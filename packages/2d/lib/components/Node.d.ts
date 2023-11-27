import { Vector2, BBox, PossibleColor, PossibleVector2, Vector2Signal, ColorSignal, SimpleVector2Signal } from '@motion-canvas/core/lib/types';
import { ReferenceReceiver } from '@motion-canvas/core/lib/utils';
import type { ComponentChildren } from './types';
import { Promisable } from '@motion-canvas/core/lib/threading';
import { TimingFunction } from '@motion-canvas/core/lib/tweening';
import type { View2D } from './View2D';
import { Filter } from '../partials';
import { FiltersSignal } from '../decorators/filtersSignal';
import { SignalValue, SimpleSignal } from '@motion-canvas/core/lib/signals';
export type NodeState = NodeProps & Record<string, any>;
export interface NodeProps {
    ref?: ReferenceReceiver<any>;
    children?: ComponentChildren;
    spawner?: SignalValue<Node[]>;
    key?: string;
    x?: SignalValue<number>;
    y?: SignalValue<number>;
    position?: SignalValue<PossibleVector2>;
    rotation?: SignalValue<number>;
    scaleX?: SignalValue<number>;
    scaleY?: SignalValue<number>;
    scale?: SignalValue<PossibleVector2>;
    skewX?: SignalValue<number>;
    skewY?: SignalValue<number>;
    skew?: SignalValue<PossibleVector2>;
    zIndex?: SignalValue<number>;
    opacity?: SignalValue<number>;
    filters?: SignalValue<Filter[]>;
    shadowColor?: SignalValue<PossibleColor>;
    shadowBlur?: SignalValue<number>;
    shadowOffsetX?: SignalValue<number>;
    shadowOffsetY?: SignalValue<number>;
    shadowOffset?: SignalValue<PossibleVector2>;
    cache?: SignalValue<boolean>;
    composite?: SignalValue<boolean>;
    compositeOperation?: SignalValue<GlobalCompositeOperation>;
}
export declare class Node implements Promisable<Node> {
    isClass: boolean;
    /**
     * Represents the position of this node in local space of its parent.
     *
     * @example
     * Initializing the position:
     * ```tsx
     * // with a possible vector:
     * <Node position={[1, 2]} />
     * // with individual components:
     * <Node x={1} y={2} />
     * ```
     *
     * Accessing the position:
     * ```tsx
     * // retrieving the vector:
     * const position = node.position();
     * // retrieving an individual component:
     * const x = node.position.x();
     * ```
     *
     * Setting the position:
     * ```tsx
     * // with a possible vector:
     * node.position([1, 2]);
     * node.position(() => [1, 2]);
     * // with individual components:
     * node.position.x(1);
     * node.position.x(() => 1);
     * ```
     */
    readonly position: Vector2Signal<this>;
    get x(): SimpleSignal<number, this>;
    get y(): SimpleSignal<number, this>;
    /**
     * A helper signal for operating on the position in world space.
     *
     * @remarks
     * Retrieving the position using this signal returns the position in world
     * space. Similarly, setting the position using this signal transforms the
     * new value to local space.
     *
     * If the new value is a function, the position of this node will be
     * continuously updated to always match the position returned by the function.
     * This can be useful to "pin" the node in a specific place or to make it
     * follow another node's position.
     *
     * Unlike {@link position}, this signal is not compound - it doesn't contain
     * separate signals for the `x` and `y` components.
     */
    readonly absolutePosition: SimpleVector2Signal<this>;
    protected getAbsolutePosition(): Vector2;
    protected setAbsolutePosition(value: SignalValue<PossibleVector2>): void;
    /**
     * Represents the rotation (in degrees) of this node relative to its parent.
     */
    readonly rotation: SimpleSignal<number, this>;
    /**
     * A helper signal for operating on the rotation in world space.
     *
     * @remarks
     * Retrieving the rotation using this signal returns the rotation in world
     * space. Similarly, setting the rotation using this signal transforms the
     * new value to local space.
     *
     * If the new value is a function, the rotation of this node will be
     * continuously updated to always match the rotation returned by the function.
     */
    readonly absoluteRotation: SimpleSignal<number, this>;
    protected getAbsoluteRotation(): number;
    protected setAbsoluteRotation(value: SignalValue<number>): void;
    /**
     * Represents the scale of this node in local space of its parent.
     *
     * @example
     * Initializing the scale:
     * ```tsx
     * // with a possible vector:
     * <Node scale={[1, 2]} />
     * // with individual components:
     * <Node scaleX={1} scaleY={2} />
     * ```
     *
     * Accessing the scale:
     * ```tsx
     * // retrieving the vector:
     * const scale = node.scale();
     * // retrieving an individual component:
     * const scaleX = node.scale.x();
     * ```
     *
     * Setting the scale:
     * ```tsx
     * // with a possible vector:
     * node.scale([1, 2]);
     * node.scale(() => [1, 2]);
     * // with individual components:
     * node.scale.x(1);
     * node.scale.x(() => 1);
     * ```
     */
    readonly scale: Vector2Signal<this>;
    /**
     * Represents the skew of this node in local space of its parent.
     *
     * @example
     * Initializing the skew:
     * ```tsx
     * // with a possible vector:
     * <Node skew={[40, 20]} />
     * // with individual components:
     * <Node skewX={40} skewY={20} />
     * ```
     *
     * Accessing the skew:
     * ```tsx
     * // retrieving the vector:
     * const skew = node.skew();
     * // retrieving an individual component:
     * const skewX = node.skew.x();
     * ```
     *
     * Setting the skew:
     * ```tsx
     * // with a possible vector:
     * node.skew([40, 20]);
     * node.skew(() => [40, 20]);
     * // with individual components:
     * node.skew.x(40);
     * node.skew.x(() => 40);
     * ```
     */
    readonly skew: Vector2Signal<this>;
    /**
     * A helper signal for operating on the scale in world space.
     *
     * @remarks
     * Retrieving the scale using this signal returns the scale in world space.
     * Similarly, setting the scale using this signal transforms the new value to
     * local space.
     *
     * If the new value is a function, the scale of this node will be continuously
     * updated to always match the position returned by the function.
     *
     * Unlike {@link scale}, this signal is not compound - it doesn't contain
     * separate signals for the `x` and `y` components.
     */
    readonly absoluteScale: SimpleVector2Signal<this>;
    protected getAbsoluteScale(): Vector2;
    protected setAbsoluteScale(value: SignalValue<PossibleVector2>): void;
    private getRelativeScale;
    readonly zIndex: SimpleSignal<number, this>;
    readonly cache: SimpleSignal<boolean, this>;
    readonly composite: SimpleSignal<boolean, this>;
    readonly compositeOperation: SimpleSignal<GlobalCompositeOperation, this>;
    private readonly compositeOverride;
    protected tweenCompositeOperation(value: SignalValue<GlobalCompositeOperation>, time: number, timingFunction: TimingFunction): Generator<void | import("@motion-canvas/core/lib/threading").ThreadGenerator | Promise<any> | Promisable<any>, void, any>;
    /**
     * Represents the opacity of this node in the range 0-1.
     *
     * @remarks
     * The value is clamped to the range 0-1.
     */
    readonly opacity: SimpleSignal<number, this>;
    absoluteOpacity(): number;
    readonly filters: FiltersSignal<this>;
    readonly shadowColor: ColorSignal<this>;
    readonly shadowBlur: SimpleSignal<number, this>;
    readonly shadowOffset: Vector2Signal<this>;
    protected hasFilters(): boolean;
    protected hasShadow(): boolean;
    protected filterString(): string;
    protected readonly spawner: SimpleSignal<Node[], this>;
    readonly children: SimpleSignal<Node[], this>;
    protected setChildren(value: SignalValue<Node[]>): void;
    protected getChildren(): Node[];
    protected spawnChildren(): void;
    protected sortedChildren(): Node[];
    protected view2D: View2D;
    private stateStack;
    private realChildren;
    readonly parent: SimpleSignal<Node | null, void>;
    readonly properties: Record<string, import("../decorators").PropertyMetadata<any>>;
    readonly key: string;
    readonly creationStack?: string;
    constructor({ children, spawner, key, ...rest }: NodeProps);
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
    localToWorld(): DOMMatrix;
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
    worldToLocal(): DOMMatrix;
    /**
     * Get the world-to-parent matrix for this node.
     *
     * @remarks
     * This matrix transforms vectors from world space to local space of this
     * node's parent.
     */
    worldToParent(): DOMMatrix;
    /**
     * Get the local-to-parent matrix for this node.
     *
     * @remarks
     * This matrix transforms vectors from local space of this node to local space
     * of this node's parent.
     */
    localToParent(): DOMMatrix;
    /**
     * A matrix mapping composite space to world space.
     *
     * @remarks
     * Certain effects such as blur and shadows ignore the current transformation.
     * This matrix can be used to transform their parameters so that the effect
     * appears relative to the closes composite root.
     */
    compositeToWorld(): DOMMatrix;
    protected compositeRoot(): Node | null;
    compositeToLocal(): DOMMatrix;
    view(): View2D;
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
    add(node: ComponentChildren): this;
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
    insert(node: ComponentChildren, index?: number): this;
    /**
     * Remove this node from the tree.
     */
    remove(): this;
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
    move(by?: number): this;
    /**
     * Move the node up in relation to its siblings.
     *
     * @remarks
     * The node will exchange places with the sibling right above it (if any) and
     * from then on will be rendered on top of it.
     */
    moveUp(): this;
    /**
     * Move the node down in relation to its siblings.
     *
     * @remarks
     * The node will exchange places with the sibling right below it (if any) and
     * from then on will be rendered under it.
     */
    moveDown(): this;
    /**
     * Move the node to the top in relation to its siblings.
     *
     * @remarks
     * The node will be placed at the end of the children list and from then on
     * will be rendered on top of all of its siblings.
     */
    moveToTop(): this;
    /**
     * Move the node to the bottom in relation to its siblings.
     *
     * @remarks
     * The node will be placed at the beginning of the children list and from then
     * on will be rendered below all of its siblings.
     */
    moveToBottom(): this;
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
    moveTo(index: number): this;
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
    moveBelow(node: Node, directlyBelow?: boolean): this;
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
    moveAbove(node: Node, directlyAbove?: boolean): this;
    /**
     * Change the parent of this node while keeping the absolute transform.
     *
     * @remarks
     * After performing this operation, the node will stay in the same place
     * visually, but its parent will be changed.
     *
     * @param newParent - The new parent of this node.
     */
    reparent(newParent: Node): void;
    /**
     * Remove all children of this node.
     */
    removeChildren(): void;
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
    dispose(): void;
    /**
     * Create a copy of this node.
     *
     * @param customProps - Properties to override.
     */
    clone(customProps?: NodeProps): this;
    /**
     * Create a copy of this node.
     *
     * @remarks
     * Unlike {@link clone}, a snapshot clone calculates any reactive properties
     * at the moment of cloning and passes the raw values to the copy.
     *
     * @param customProps - Properties to override.
     */
    snapshotClone(customProps?: NodeProps): this;
    /**
     * Create a reactive copy of this node.
     *
     * @remarks
     * A reactive copy has all its properties dynamically updated to match the
     * source node.
     *
     * @param customProps - Properties to override.
     */
    reactiveClone(customProps?: NodeProps): this;
    /**
     * Create an instance of this node's class.
     *
     * @param props - Properties to pass to the constructor.
     */
    instantiate(props?: NodeProps): this;
    /**
     * Whether this node should be cached or not.
     */
    protected requiresCache(): boolean;
    protected cacheCanvas(): CanvasRenderingContext2D;
    /**
     * Get a cache canvas with the contents of this node rendered onto it.
     */
    protected cachedCanvas(): CanvasRenderingContext2D;
    /**
     * Get a bounding box for the contents rendered by this node.
     *
     * @remarks
     * The returned bounding box should be in local space.
     */
    protected getCacheBBox(): BBox;
    /**
     * Get a bounding box for the contents rendered by this node as well
     * as its children.
     */
    cacheBBox(): BBox;
    /**
     * Get a bounding box for the contents rendered by this node (including
     * effects applied after caching).
     *
     * @remarks
     * The returned bounding box should be in local space.
     */
    protected fullCacheBBox(): BBox;
    /**
     * Get a bounding box in world space for the contents rendered by this node as
     * well as its children.
     *
     * @remarks
     * This is the same the bounding box returned by {@link cacheBBox} only
     * transformed to world space.
     */
    protected worldSpaceCacheBBox(): BBox;
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
    protected setupDrawFromCache(context: CanvasRenderingContext2D): void;
    /**
     * Render this node onto the given canvas.
     *
     * @param context - The context to draw with.
     */
    render(context: CanvasRenderingContext2D): void;
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
    protected draw(context: CanvasRenderingContext2D): void;
    protected drawChildren(context: CanvasRenderingContext2D): void;
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
    drawOverlay(context: CanvasRenderingContext2D, matrix: DOMMatrix): void;
    protected transformContext(context: CanvasRenderingContext2D): void;
    /**
     * Try to find a node intersecting the given position.
     *
     * @param position - The searched position.
     */
    hit(position: Vector2): Node | null;
    /**
     * Collect all asynchronous resources used by this node.
     */
    protected collectAsyncResources(): void;
    /**
     * Wait for any asynchronous resources that this node or its children have.
     *
     * @remarks
     * Certain resources like images are always loaded asynchronously.
     * Awaiting this method makes sure that all such resources are done loading
     * before continuing the animation.
     */
    toPromise(): Promise<this>;
    /**
     * Return a snapshot of the node's current signal values.
     *
     * @remarks
     * This method will calculate the values of any reactive properties of the
     * node at the time the method is called.
     */
    getState(): NodeState;
    /**
     * Apply the given state to the node, setting all matching signal values to
     * the provided values.
     *
     * @param state - The state to apply to the node.
     */
    applyState(state: NodeState): void;
    /**
     * Push a snapshot of the node's current state onto the node's state stack.
     *
     * @remarks
     * This method can be used together with the {@link restore} method to save a
     * node's current state and later restore it. It is possible to store more
     * than one state by calling `save` method multiple times.
     */
    save(): void;
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
    restore(duration?: number, timing?: TimingFunction): import("@motion-canvas/core/lib/threading").ThreadGenerator | undefined;
    [Symbol.iterator](): Generator<{
        meta: import("../decorators").PropertyMetadata<any>;
        signal: SimpleSignal<any, void>;
        key: string;
    }, void, unknown>;
    private signalByKey;
}
//# sourceMappingURL=Node.d.ts.map