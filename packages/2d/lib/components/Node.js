var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { cloneable, colorSignal, computed, getPropertiesOf, initial, initializeSignals, inspectable, parser, signal, vector2Signal, wrapper, } from '../decorators';
import { Vector2, BBox, transformScalar, transformAngle, } from '@motion-canvas/core/lib/types';
import { DetailedError, useLogger, } from '@motion-canvas/core/lib/utils';
import { useScene2D } from '../scenes/useScene2D';
import { clamp, deepLerp, easeInOutCubic, tween, } from '@motion-canvas/core/lib/tweening';
import { threadable } from '@motion-canvas/core/lib/decorators';
import { drawLine } from '../utils';
import { filtersSignal } from '../decorators/filtersSignal';
import { createSignal, DependencyContext, isReactive, modify, unwrap, } from '@motion-canvas/core/lib/signals';
export class Node {
    get x() {
        return this.position.x;
    }
    get y() {
        return this.position.y;
    }
    getAbsolutePosition() {
        const matrix = this.localToWorld();
        return new Vector2(matrix.m41, matrix.m42);
    }
    setAbsolutePosition(value) {
        this.position(modify(value, unwrapped => new Vector2(unwrapped).transformAsPoint(this.worldToParent())));
    }
    getAbsoluteRotation() {
        const matrix = this.localToWorld();
        return Vector2.degrees(matrix.m11, matrix.m12);
    }
    setAbsoluteRotation(value) {
        this.rotation(modify(value, unwrapped => transformAngle(unwrapped, this.worldToParent())));
    }
    getAbsoluteScale() {
        const matrix = this.localToWorld();
        return new Vector2(Vector2.magnitude(matrix.m11, matrix.m12), Vector2.magnitude(matrix.m21, matrix.m22));
    }
    setAbsoluteScale(value) {
        this.scale(modify(value, unwrapped => this.getRelativeScale(new Vector2(unwrapped))));
    }
    getRelativeScale(scale) {
        const parentScale = this.parent()?.absoluteScale() ?? Vector2.one;
        return scale.div(parentScale);
    }
    *tweenCompositeOperation(value, time, timingFunction) {
        const nextValue = unwrap(value);
        if (nextValue === 'source-over') {
            yield* this.compositeOverride(1, time, timingFunction);
            this.compositeOverride(0);
            this.compositeOperation(nextValue);
        }
        else {
            this.compositeOperation(nextValue);
            this.compositeOverride(1);
            yield* this.compositeOverride(0, time, timingFunction);
        }
    }
    absoluteOpacity() {
        return (this.parent()?.absoluteOpacity() ?? 1) * this.opacity();
    }
    hasFilters() {
        return !!this.filters().find(filter => filter.isActive());
    }
    hasShadow() {
        return (!!this.shadowColor() &&
            (this.shadowBlur() > 0 ||
                this.shadowOffset.x() !== 0 ||
                this.shadowOffset.y() !== 0));
    }
    filterString() {
        let filters = '';
        const matrix = this.compositeToWorld();
        for (const filter of this.filters()) {
            if (filter.isActive()) {
                filters += ' ' + filter.serialize(matrix);
            }
        }
        return filters;
    }
    setChildren(value) {
        this.spawner(value);
    }
    getChildren() {
        this.spawnChildren();
        return this.realChildren;
    }
    spawnChildren() {
        const children = this.spawner();
        if (isReactive(this.spawner.context.raw())) {
            const keep = new Set();
            for (const realChild of children) {
                const current = realChild.parent.context.raw();
                if (current && current !== this) {
                    throw new DetailedError('The spawner returned a node that already has a parent', 'A spawner should either create entirely new nodes or reuse nodes from a pool.');
                }
                realChild.parent(this);
                keep.add(realChild.key);
            }
            for (const realChild of this.realChildren) {
                if (!keep.has(realChild.key)) {
                    realChild.parent(null);
                }
            }
            this.realChildren = children;
        }
        else {
            this.realChildren = children;
        }
    }
    sortedChildren() {
        return [...this.children()].sort((a, b) => Math.sign(a.zIndex() - b.zIndex()));
    }
    constructor({ children, spawner, key, ...rest }) {
        this.compositeOverride = createSignal(0);
        this.stateStack = [];
        this.realChildren = [];
        this.parent = createSignal(null);
        this.properties = getPropertiesOf(this);
        const scene = useScene2D();
        this.key = scene.registerNode(this, key);
        this.view2D = scene.getView();
        this.creationStack = new Error().stack;
        initializeSignals(this, rest);
        this.add(children);
        if (spawner) {
            this.children(spawner);
        }
    }
    /**
     * Get the local-to-world matrix for this node.
     *
     * @remarks
     * This matrix transforms vectors from local space of this node to world
     * space.
     *
     * @example
     * Calculate the absolute position of a point located 200 pixels to the right
     * of the node:
     * ```ts
     * const local = new Vector2(0, 200);
     * const world = local.transformAsPoint(node.localToWorld());
     * ```
     */
    localToWorld() {
        const parent = this.parent();
        return parent
            ? parent.localToWorld().multiply(this.localToParent())
            : this.localToParent();
    }
    /**
     * Get the world-to-local matrix for this node.
     *
     * @remarks
     * This matrix transforms vectors from world space to local space of this
     * node.
     *
     * @example
     * Calculate the position relative to this node for a point located in the
     * top-left corner of the screen:
     * ```ts
     * const world = new Vector2(0, 0);
     * const local = world.transformAsPoint(node.worldToLocal());
     * ```
     */
    worldToLocal() {
        return this.localToWorld().inverse();
    }
    /**
     * Get the world-to-parent matrix for this node.
     *
     * @remarks
     * This matrix transforms vectors from world space to local space of this
     * node's parent.
     */
    worldToParent() {
        return this.parent()?.worldToLocal() ?? new DOMMatrix();
    }
    /**
     * Get the local-to-parent matrix for this node.
     *
     * @remarks
     * This matrix transforms vectors from local space of this node to local space
     * of this node's parent.
     */
    localToParent() {
        const matrix = new DOMMatrix();
        matrix.translateSelf(this.x(), this.y());
        matrix.rotateSelf(0, 0, this.rotation());
        matrix.scaleSelf(this.scale.x(), this.scale.y());
        matrix.skewXSelf(this.skew.x());
        matrix.skewYSelf(this.skew.y());
        return matrix;
    }
    /**
     * A matrix mapping composite space to world space.
     *
     * @remarks
     * Certain effects such as blur and shadows ignore the current transformation.
     * This matrix can be used to transform their parameters so that the effect
     * appears relative to the closes composite root.
     */
    compositeToWorld() {
        return this.compositeRoot()?.localToWorld() ?? new DOMMatrix();
    }
    compositeRoot() {
        if (this.composite()) {
            return this;
        }
        return this.parent()?.compositeRoot() ?? null;
    }
    compositeToLocal() {
        const root = this.compositeRoot();
        if (root) {
            const worldToLocal = this.worldToLocal();
            worldToLocal.m44 = 1;
            return root.localToWorld().multiply(worldToLocal);
        }
        return new DOMMatrix();
    }
    view() {
        return this.view2D;
    }
    /**
     * Add the given node(s) as the children of this node.
     *
     * @remarks
     * The nodes will be appended at the end of the children list.
     *
     * @example
     * ```tsx
     * const node = <Layout />;
     * node.add(<Rect />);
     * node.add(<Circle />);
     * ```
     * Result:
     * ```mermaid
     * graph TD;
     *   layout([Layout])
     *   circle([Circle])
     *   rect([Rect])
     *     layout-->rect;
     *     layout-->circle;
     * ```
     *
     * @param node - A node or an array of nodes to append.
     */
    add(node) {
        return this.insert(node, Infinity);
    }
    /**
     * Insert the given node(s) at the specified index in the children list.
     *
     * @example
     * ```tsx
     * const node = (
     *   <Layout>
     *     <Rect />
     *     <Circle />
     *   </Layout>
     * );
     *
     * node.insert(<Txt />, 1);
     * ```
     *
     * Result:
     * ```mermaid
     * graph TD;
     *   layout([Layout])
     *   circle([Circle])
     *   text([Text])
     *   rect([Rect])
     *     layout-->rect;
     *     layout-->text;
     *     layout-->circle;
     * ```
     *
     * @param node - A node or an array of nodes to insert.
     * @param index - An index at which to insert the node(s).
     */
    insert(node, index = 0) {
        const array = Array.isArray(node) ? node : [node];
        if (array.length === 0) {
            return this;
        }
        const children = this.children();
        const newChildren = children.slice(0, index);
        for (const node of array) {
            if (node instanceof Node) {
                newChildren.push(node);
                node.remove();
                node.parent(this);
            }
        }
        newChildren.push(...children.slice(index));
        this.children(newChildren);
        return this;
    }
    /**
     * Remove this node from the tree.
     */
    remove() {
        const current = this.parent();
        if (current === null) {
            return this;
        }
        current.children(current.children().filter(child => child !== this));
        this.parent(null);
        return this;
    }
    /**
     * Rearrange this node in relation to its siblings.
     *
     * @remarks
     * Children are rendered starting from the beginning of the children list.
     * We can change the rendering order by rearranging said list.
     *
     * A positive `by` arguments move the node up (it will be rendered on top of
     * the elements it has passed). Negative values move it down.
     *
     * @param by - Number of places by which the node should be moved.
     */
    move(by = 1) {
        const parent = this.parent();
        if (by === 0 || !parent) {
            return this;
        }
        const children = parent.children();
        const newChildren = [];
        if (by > 0) {
            for (let i = 0; i < children.length; i++) {
                const child = children[i];
                if (child === this) {
                    const target = i + by;
                    for (; i < target && i + 1 < children.length; i++) {
                        newChildren[i] = children[i + 1];
                    }
                }
                newChildren[i] = child;
            }
        }
        else {
            for (let i = children.length - 1; i >= 0; i--) {
                const child = children[i];
                if (child === this) {
                    const target = i + by;
                    for (; i > target && i > 0; i--) {
                        newChildren[i] = children[i - 1];
                    }
                }
                newChildren[i] = child;
            }
        }
        parent.children(newChildren);
        return this;
    }
    /**
     * Move the node up in relation to its siblings.
     *
     * @remarks
     * The node will exchange places with the sibling right above it (if any) and
     * from then on will be rendered on top of it.
     */
    moveUp() {
        return this.move(1);
    }
    /**
     * Move the node down in relation to its siblings.
     *
     * @remarks
     * The node will exchange places with the sibling right below it (if any) and
     * from then on will be rendered under it.
     */
    moveDown() {
        return this.move(-1);
    }
    /**
     * Move the node to the top in relation to its siblings.
     *
     * @remarks
     * The node will be placed at the end of the children list and from then on
     * will be rendered on top of all of its siblings.
     */
    moveToTop() {
        return this.move(Infinity);
    }
    /**
     * Move the node to the bottom in relation to its siblings.
     *
     * @remarks
     * The node will be placed at the beginning of the children list and from then
     * on will be rendered below all of its siblings.
     */
    moveToBottom() {
        return this.move(-Infinity);
    }
    /**
     * Move the node to the provided position relative to its siblings.
     *
     * @remarks
     * If the node is getting moved to a lower position, it will be placed below
     * the sibling that's currently at the provided index (if any).
     * If the node is getting moved to a higher position, it will be placed above
     * the sibling that's currently at the provided index (if any).
     *
     * @param index - The index to move the node to.
     */
    moveTo(index) {
        const parent = this.parent();
        if (!parent) {
            return this;
        }
        const currentIndex = parent.children().indexOf(this);
        const by = index - currentIndex;
        return this.move(by);
    }
    /**
     * Move the node below the provided node in the parent's layout.
     *
     * @remarks
     * The node will be moved below the provided node and from then on will be
     * rendered below it. By default, if the node is already positioned lower than
     * the sibling node, it will not get moved.
     *
     * @param node - The sibling node below which to move.
     * @param directlyBelow - Whether the node should be positioned directly below
     *                        the sibling. When true, will move the node even if
     *                        it is already positioned below the sibling.
     */
    moveBelow(node, directlyBelow = false) {
        const parent = this.parent();
        if (!parent) {
            return this;
        }
        if (node.parent() !== parent) {
            useLogger().error("Cannot position nodes relative to each other if they don't belong to the same parent.");
            return this;
        }
        const children = parent.children();
        const ownIndex = children.indexOf(this);
        const otherIndex = children.indexOf(node);
        if (!directlyBelow && ownIndex < otherIndex) {
            // Nothing to do if the node is already positioned below the target node.
            // We could move the node so it's directly below the sibling node, but
            // that might suddenly move it on top of other nodes. This is likely
            // not what the user wanted to happen when calling this method.
            return this;
        }
        const by = otherIndex - ownIndex - 1;
        return this.move(by);
    }
    /**
     * Move the node above the provided node in the parent's layout.
     *
     * @remarks
     * The node will be moved above the provided node and from then on will be
     * rendered on top of it. By default, if the node is already positioned
     * higher than the sibling node, it will not get moved.
     *
     * @param node - The sibling node below which to move.
     * @param directlyAbove - Whether the node should be positioned directly above the
     *                        sibling. When true, will move the node even if it is
     *                        already positioned above the sibling.
     */
    moveAbove(node, directlyAbove = false) {
        const parent = this.parent();
        if (!parent) {
            return this;
        }
        if (node.parent() !== parent) {
            useLogger().error("Cannot position nodes relative to each other if they don't belong to the same parent.");
            return this;
        }
        const children = parent.children();
        const ownIndex = children.indexOf(this);
        const otherIndex = children.indexOf(node);
        if (!directlyAbove && ownIndex > otherIndex) {
            // Nothing to do if the node is already positioned above the target node.
            // We could move the node so it's directly above the sibling node, but
            // that might suddenly move it below other nodes. This is likely not what
            // the user wanted to happen when calling this method.
            return this;
        }
        const by = otherIndex - ownIndex + 1;
        return this.move(by);
    }
    /**
     * Change the parent of this node while keeping the absolute transform.
     *
     * @remarks
     * After performing this operation, the node will stay in the same place
     * visually, but its parent will be changed.
     *
     * @param newParent - The new parent of this node.
     */
    reparent(newParent) {
        const position = this.absolutePosition();
        const rotation = this.absoluteRotation();
        const scale = this.absoluteScale();
        newParent.add(this);
        this.absolutePosition(position);
        this.absoluteRotation(rotation);
        this.absoluteScale(scale);
    }
    /**
     * Remove all children of this node.
     */
    removeChildren() {
        for (const node of this.children()) {
            node.remove();
        }
    }
    /**
     * Prepare this node to be disposed of.
     *
     * @remarks
     * This method is called automatically when a scene is refreshed. It will
     * be called even if the node is not currently attached to the tree.
     *
     * The goal of this method is to clean any external references to allow the
     * node to be garbage collected.
     */
    dispose() {
        this.stateStack = [];
        for (const { signal } of this) {
            signal?.context.dispose();
        }
    }
    /**
     * Create a copy of this node.
     *
     * @param customProps - Properties to override.
     */
    clone(customProps = {}) {
        const props = { ...customProps };
        if (isReactive(this.spawner.context.raw())) {
            props.spawner = this.spawner.context.raw();
        }
        else if (this.children().length > 0) {
            props.children ?? (props.children = this.children().map(child => child.clone()));
        }
        for (const { key, meta, signal } of this) {
            if (!meta.cloneable || key in props)
                continue;
            if (meta.compound) {
                for (const [key, property] of meta.compoundEntries) {
                    if (property in props)
                        continue;
                    props[property] = signal[key].context.raw();
                }
            }
            else {
                props[key] = signal.context.raw();
            }
        }
        return this.instantiate(props);
    }
    /**
     * Create a copy of this node.
     *
     * @remarks
     * Unlike {@link clone}, a snapshot clone calculates any reactive properties
     * at the moment of cloning and passes the raw values to the copy.
     *
     * @param customProps - Properties to override.
     */
    snapshotClone(customProps = {}) {
        const props = {
            ...this.getState(),
            ...customProps,
        };
        if (this.children().length > 0) {
            props.children ?? (props.children = this.children().map(child => child.snapshotClone()));
        }
        return this.instantiate(props);
    }
    /**
     * Create a reactive copy of this node.
     *
     * @remarks
     * A reactive copy has all its properties dynamically updated to match the
     * source node.
     *
     * @param customProps - Properties to override.
     */
    reactiveClone(customProps = {}) {
        const props = { ...customProps };
        if (this.children().length > 0) {
            props.children ?? (props.children = this.children().map(child => child.reactiveClone()));
        }
        for (const { key, meta, signal } of this) {
            if (!meta.cloneable || key in props)
                continue;
            props[key] = () => signal();
        }
        return this.instantiate(props);
    }
    /**
     * Create an instance of this node's class.
     *
     * @param props - Properties to pass to the constructor.
     */
    instantiate(props = {}) {
        return new this.constructor(props);
    }
    /**
     * Whether this node should be cached or not.
     */
    requiresCache() {
        return (this.cache() ||
            this.opacity() < 1 ||
            this.compositeOperation() !== 'source-over' ||
            this.hasFilters() ||
            this.hasShadow());
    }
    cacheCanvas() {
        const canvas = document.createElement('canvas').getContext('2d');
        if (!canvas) {
            throw new Error('Could not create a cache canvas');
        }
        return canvas;
    }
    /**
     * Get a cache canvas with the contents of this node rendered onto it.
     */
    cachedCanvas() {
        const context = this.cacheCanvas();
        const cache = this.worldSpaceCacheBBox();
        const matrix = this.localToWorld();
        context.canvas.width = cache.width;
        context.canvas.height = cache.height;
        context.setTransform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.e - cache.x, matrix.f - cache.y);
        this.draw(context);
        return context;
    }
    /**
     * Get a bounding box for the contents rendered by this node.
     *
     * @remarks
     * The returned bounding box should be in local space.
     */
    getCacheBBox() {
        return new BBox();
    }
    /**
     * Get a bounding box for the contents rendered by this node as well
     * as its children.
     */
    cacheBBox() {
        const cache = this.getCacheBBox();
        const children = this.children();
        if (children.length === 0) {
            return cache;
        }
        const points = cache.corners;
        for (const child of children) {
            const childCache = child.fullCacheBBox();
            const childMatrix = child.localToParent();
            points.push(...childCache.corners.map(r => r.transformAsPoint(childMatrix)));
        }
        return BBox.fromPoints(...points);
    }
    /**
     * Get a bounding box for the contents rendered by this node (including
     * effects applied after caching).
     *
     * @remarks
     * The returned bounding box should be in local space.
     */
    fullCacheBBox() {
        const matrix = this.compositeToLocal();
        const shadowOffset = this.shadowOffset().transform(matrix);
        const shadowBlur = transformScalar(this.shadowBlur(), matrix);
        const result = this.cacheBBox().expand(this.filters.blur() * 2 + shadowBlur);
        if (shadowOffset.x < 0) {
            result.x += shadowOffset.x;
            result.width -= shadowOffset.x;
        }
        else {
            result.width += shadowOffset.x;
        }
        if (shadowOffset.y < 0) {
            result.y += shadowOffset.y;
            result.height -= shadowOffset.y;
        }
        else {
            result.height += shadowOffset.y;
        }
        return result;
    }
    /**
     * Get a bounding box in world space for the contents rendered by this node as
     * well as its children.
     *
     * @remarks
     * This is the same the bounding box returned by {@link cacheBBox} only
     * transformed to world space.
     */
    worldSpaceCacheBBox() {
        const viewBBox = BBox.fromSizeCentered(this.view().size());
        const canvasBBox = BBox.fromPoints(...viewBBox.transformCorners(this.view().localToWorld()));
        const cacheBBox = BBox.fromPoints(...this.cacheBBox().transformCorners(this.localToWorld()));
        return canvasBBox.intersection(cacheBBox).pixelPerfect;
    }
    /**
     * Prepare the given context for drawing a cached node onto it.
     *
     * @remarks
     * This method is called before the contents of the cache canvas are drawn
     * on the screen. It can be used to apply effects to the entire node together
     * with its children, instead of applying them individually.
     * Effects such as transparency, shadows, and filters use this technique.
     *
     * Whether the node is cached is decided by the {@link requiresCache} method.
     *
     * @param context - The context using which the cache will be drawn.
     */
    setupDrawFromCache(context) {
        context.globalCompositeOperation = this.compositeOperation();
        context.globalAlpha *= this.opacity();
        if (this.hasFilters()) {
            context.filter = this.filterString();
        }
        if (this.hasShadow()) {
            const matrix = this.compositeToWorld();
            const offset = this.shadowOffset().transform(matrix);
            const blur = transformScalar(this.shadowBlur(), matrix);
            context.shadowColor = this.shadowColor().serialize();
            context.shadowBlur = blur;
            context.shadowOffsetX = offset.x;
            context.shadowOffsetY = offset.y;
        }
    }
    /**
     * Render this node onto the given canvas.
     *
     * @param context - The context to draw with.
     */
    render(context) {
        if (this.absoluteOpacity() <= 0) {
            return;
        }
        context.save();
        this.transformContext(context);
        if (this.requiresCache()) {
            const cacheRect = this.worldSpaceCacheBBox();
            if (cacheRect.width !== 0 && cacheRect.height !== 0) {
                this.setupDrawFromCache(context);
                const cacheContext = this.cachedCanvas();
                const compositeOverride = this.compositeOverride();
                const matrix = this.worldToLocal();
                context.transform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.e, matrix.f);
                context.drawImage(cacheContext.canvas, cacheRect.position.x, cacheRect.position.y);
                if (compositeOverride > 0) {
                    context.save();
                    context.globalAlpha *= compositeOverride;
                    context.globalCompositeOperation = 'source-over';
                    context.drawImage(cacheContext.canvas, cacheRect.position.x, cacheRect.position.y);
                    context.restore();
                }
            }
        }
        else {
            this.draw(context);
        }
        context.restore();
    }
    /**
     * Draw this node onto the canvas.
     *
     * @remarks
     * This method is used when drawing directly onto the screen as well as onto
     * the cache canvas.
     * It assumes that the context have already been transformed to local space.
     *
     * @param context - The context to draw with.
     */
    draw(context) {
        this.drawChildren(context);
    }
    drawChildren(context) {
        for (const child of this.sortedChildren()) {
            child.render(context);
        }
    }
    /**
     * Draw an overlay for this node.
     *
     * @remarks
     * The overlay for the currently inspected node is displayed on top of the
     * canvas.
     *
     * The provided context is in screen space. The local-to-screen matrix can be
     * used to transform all shapes that need to be displayed.
     * This approach allows to keep the line widths and gizmo sizes consistent,
     * no matter how zoomed-in the view is.
     *
     * @param context - The context to draw with.
     * @param matrix - A local-to-screen matrix.
     */
    drawOverlay(context, matrix) {
        const box = this.cacheBBox().transformCorners(matrix);
        const cache = this.getCacheBBox().transformCorners(matrix);
        context.strokeStyle = 'white';
        context.lineWidth = 1;
        context.beginPath();
        drawLine(context, box);
        context.closePath();
        context.stroke();
        context.strokeStyle = 'blue';
        context.beginPath();
        drawLine(context, cache);
        context.closePath();
        context.stroke();
    }
    transformContext(context) {
        const matrix = this.localToParent();
        context.transform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.e, matrix.f);
    }
    /**
     * Try to find a node intersecting the given position.
     *
     * @param position - The searched position.
     */
    hit(position) {
        let hit = null;
        const local = position.transformAsPoint(this.localToParent().inverse());
        for (const child of this.children().reverse()) {
            hit = child.hit(local);
            if (hit) {
                break;
            }
        }
        return hit;
    }
    /**
     * Collect all asynchronous resources used by this node.
     */
    collectAsyncResources() {
        for (const child of this.children()) {
            child.collectAsyncResources();
        }
    }
    /**
     * Wait for any asynchronous resources that this node or its children have.
     *
     * @remarks
     * Certain resources like images are always loaded asynchronously.
     * Awaiting this method makes sure that all such resources are done loading
     * before continuing the animation.
     */
    async toPromise() {
        do {
            await DependencyContext.consumePromises();
            this.collectAsyncResources();
        } while (DependencyContext.hasPromises());
        return this;
    }
    /**
     * Return a snapshot of the node's current signal values.
     *
     * @remarks
     * This method will calculate the values of any reactive properties of the
     * node at the time the method is called.
     */
    getState() {
        const state = {};
        for (const { key, meta, signal } of this) {
            if (!meta.cloneable || key in state)
                continue;
            state[key] = signal();
        }
        return state;
    }
    /**
     * Apply the given state to the node, setting all matching signal values to
     * the provided values.
     *
     * @param state - The state to apply to the node.
     */
    applyState(state) {
        for (const key in state) {
            const signal = this.signalByKey(key);
            if (signal) {
                signal(state[key]);
            }
        }
    }
    /**
     * Push a snapshot of the node's current state onto the node's state stack.
     *
     * @remarks
     * This method can be used together with the {@link restore} method to save a
     * node's current state and later restore it. It is possible to store more
     * than one state by calling `save` method multiple times.
     */
    save() {
        this.stateStack.push(this.getState());
    }
    /**
     * Restore the node to its last saved state.
     *
     * @remarks
     * This method can be used together with the {@link save} method to restore a
     * node to a previously saved state. Restoring a node to a previous state
     * removes that state from the state stack.
     *
     * Providing a duration will tween the node to the restored state. Otherwise,
     * it will be restored immediately.
     *
     * @example
     * ```tsx
     * const node = <Circle width={100} height={100} fill={"lightseagreen"} />
     *
     * view.add(node);
     *
     * // Save the node's current state
     * node.save();
     *
     * // Modify some of the node's properties
     * yield* node.scale(2, 1);
     * yield* node.fill('hotpink', 1);
     *
     * // Restore the node to its saved state over 1 second
     * yield* node.restore(1);
     * ```
     *
     * @param duration - The duration of the transition.
     * @param timing - The timing function to use for the transition.
     */
    restore(duration, timing = easeInOutCubic) {
        const state = this.stateStack.pop();
        if (state === undefined) {
            return;
        }
        if (duration === undefined) {
            this.applyState(state);
            return;
        }
        const currentState = this.getState();
        for (const key in state) {
            // Filter out any properties that haven't changed between the current and
            // previous states, so we don't perform unnecessary tweens.
            if (currentState[key] === state[key]) {
                delete state[key];
            }
        }
        return tween(duration, value => {
            const t = timing(value);
            const nextState = Object.keys(state).reduce((newState, key) => {
                newState[key] = deepLerp(currentState[key], state[key], t);
                return newState;
            }, {});
            this.applyState(nextState);
        });
    }
    *[Symbol.iterator]() {
        for (const key in this.properties) {
            const meta = this.properties[key];
            const signal = this.signalByKey(key);
            yield { meta, signal, key };
        }
    }
    signalByKey(key) {
        return this[key];
    }
}
__decorate([
    vector2Signal()
], Node.prototype, "position", void 0);
__decorate([
    wrapper(Vector2),
    cloneable(false),
    signal()
], Node.prototype, "absolutePosition", void 0);
__decorate([
    initial(0),
    signal()
], Node.prototype, "rotation", void 0);
__decorate([
    cloneable(false),
    signal()
], Node.prototype, "absoluteRotation", void 0);
__decorate([
    initial(Vector2.one),
    vector2Signal('scale')
], Node.prototype, "scale", void 0);
__decorate([
    initial(Vector2.zero),
    vector2Signal('skew')
], Node.prototype, "skew", void 0);
__decorate([
    wrapper(Vector2),
    cloneable(false),
    signal()
], Node.prototype, "absoluteScale", void 0);
__decorate([
    initial(0),
    signal()
], Node.prototype, "zIndex", void 0);
__decorate([
    initial(false),
    signal()
], Node.prototype, "cache", void 0);
__decorate([
    initial(false),
    signal()
], Node.prototype, "composite", void 0);
__decorate([
    initial('source-over'),
    signal()
], Node.prototype, "compositeOperation", void 0);
__decorate([
    threadable()
], Node.prototype, "tweenCompositeOperation", null);
__decorate([
    initial(1),
    parser((value) => clamp(0, 1, value)),
    signal()
], Node.prototype, "opacity", void 0);
__decorate([
    computed()
], Node.prototype, "absoluteOpacity", null);
__decorate([
    filtersSignal()
], Node.prototype, "filters", void 0);
__decorate([
    initial('#0000'),
    colorSignal()
], Node.prototype, "shadowColor", void 0);
__decorate([
    initial(0),
    signal()
], Node.prototype, "shadowBlur", void 0);
__decorate([
    vector2Signal('shadowOffset')
], Node.prototype, "shadowOffset", void 0);
__decorate([
    computed()
], Node.prototype, "hasFilters", null);
__decorate([
    computed()
], Node.prototype, "hasShadow", null);
__decorate([
    computed()
], Node.prototype, "filterString", null);
__decorate([
    inspectable(false),
    cloneable(false),
    initial([]),
    signal()
], Node.prototype, "spawner", void 0);
__decorate([
    inspectable(false),
    cloneable(false),
    signal()
], Node.prototype, "children", void 0);
__decorate([
    computed()
], Node.prototype, "spawnChildren", null);
__decorate([
    computed()
], Node.prototype, "sortedChildren", null);
__decorate([
    computed()
], Node.prototype, "localToWorld", null);
__decorate([
    computed()
], Node.prototype, "worldToLocal", null);
__decorate([
    computed()
], Node.prototype, "worldToParent", null);
__decorate([
    computed()
], Node.prototype, "localToParent", null);
__decorate([
    computed()
], Node.prototype, "compositeToWorld", null);
__decorate([
    computed()
], Node.prototype, "compositeRoot", null);
__decorate([
    computed()
], Node.prototype, "compositeToLocal", null);
__decorate([
    computed()
], Node.prototype, "cacheCanvas", null);
__decorate([
    computed()
], Node.prototype, "cachedCanvas", null);
__decorate([
    computed()
], Node.prototype, "cacheBBox", null);
__decorate([
    computed()
], Node.prototype, "fullCacheBBox", null);
__decorate([
    computed()
], Node.prototype, "worldSpaceCacheBBox", null);
/*@__PURE__*/
Node.prototype.isClass = true;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTm9kZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21wb25lbnRzL05vZGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsT0FBTyxFQUNMLFNBQVMsRUFDVCxXQUFXLEVBQ1gsUUFBUSxFQUNSLGVBQWUsRUFDZixPQUFPLEVBQ1AsaUJBQWlCLEVBQ2pCLFdBQVcsRUFDWCxNQUFNLEVBQ04sTUFBTSxFQUNOLGFBQWEsRUFDYixPQUFPLEdBQ1IsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUNMLE9BQU8sRUFDUCxJQUFJLEVBQ0osZUFBZSxFQUVmLGNBQWMsR0FLZixNQUFNLCtCQUErQixDQUFDO0FBQ3ZDLE9BQU8sRUFDTCxhQUFhLEVBRWIsU0FBUyxHQUNWLE1BQU0sK0JBQStCLENBQUM7QUFHdkMsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBQ2hELE9BQU8sRUFDTCxLQUFLLEVBQ0wsUUFBUSxFQUNSLGNBQWMsRUFFZCxLQUFLLEdBQ04sTUFBTSxrQ0FBa0MsQ0FBQztBQUMxQyxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sb0NBQW9DLENBQUM7QUFDOUQsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUdsQyxPQUFPLEVBQUMsYUFBYSxFQUFnQixNQUFNLDZCQUE2QixDQUFDO0FBQ3pFLE9BQU8sRUFDTCxZQUFZLEVBQ1osaUJBQWlCLEVBR2pCLFVBQVUsRUFDVixNQUFNLEVBQ04sTUFBTSxHQUNQLE1BQU0saUNBQWlDLENBQUM7QUFrQ3pDLE1BQU0sT0FBTyxJQUFJO0lBb0NmLElBQVcsQ0FBQztRQUNWLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUErQixDQUFDO0lBQ3ZELENBQUM7SUFDRCxJQUFXLENBQUM7UUFDVixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBK0IsQ0FBQztJQUN2RCxDQUFDO0lBdUJTLG1CQUFtQjtRQUMzQixNQUFNLE1B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