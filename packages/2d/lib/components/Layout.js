var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { addInitializer, cloneable, computed, defaultStyle, getPropertyMeta, initial, signal, vector2Signal, } from '../decorators';
import { Origin, originToOffset, BBox, Vector2, } from '@motion-canvas/core/lib/types';
import { tween, } from '@motion-canvas/core/lib/tweening';
import { threadable } from '@motion-canvas/core/lib/decorators';
import { Node } from './Node';
import { drawLine, drawPivot } from '../utils';
import { spacingSignal } from '../decorators/spacingSignal';
import { modify, } from '@motion-canvas/core/lib/signals';
export class Layout extends Node {
    get columnGap() {
        return this.gap.x;
    }
    get rowGap() {
        return this.gap.y;
    }
    getX() {
        if (this.isLayoutRoot()) {
            return this.x.context.getter();
        }
        return this.computedPosition().x;
    }
    setX(value) {
        this.x.context.setter(value);
    }
    getY() {
        if (this.isLayoutRoot()) {
            return this.y.context.getter();
        }
        return this.computedPosition().y;
    }
    setY(value) {
        this.y.context.setter(value);
    }
    get width() {
        return this.size.x;
    }
    get height() {
        return this.size.y;
    }
    getWidth() {
        return this.computedSize().width;
    }
    setWidth(value) {
        this.width.context.setter(value);
    }
    *tweenWidth(value, time, timingFunction, interpolationFunction) {
        const width = this.desiredSize().x;
        const lock = typeof width !== 'number' || typeof value !== 'number';
        let from;
        if (lock) {
            from = this.size.x();
        }
        else {
            from = width;
        }
        let to;
        if (lock) {
            this.size.x(value);
            to = this.size.x();
        }
        else {
            to = value;
        }
        this.size.x(from);
        lock && this.lockSize();
        yield* tween(time, value => this.size.x(interpolationFunction(from, to, timingFunction(value))));
        this.size.x(value);
        lock && this.releaseSize();
    }
    getHeight() {
        return this.computedSize().height;
    }
    setHeight(value) {
        this.height.context.setter(value);
    }
    *tweenHeight(value, time, timingFunction, interpolationFunction) {
        const height = this.desiredSize().y;
        const lock = typeof height !== 'number' || typeof value !== 'number';
        let from;
        if (lock) {
            from = this.size.y();
        }
        else {
            from = height;
        }
        let to;
        if (lock) {
            this.size.y(value);
            to = this.size.y();
        }
        else {
            to = value;
        }
        this.size.y(from);
        lock && this.lockSize();
        yield* tween(time, value => this.size.y(interpolationFunction(from, to, timingFunction(value))));
        this.size.y(value);
        lock && this.releaseSize();
    }
    /**
     * Get the desired size of this node.
     *
     * @remarks
     * This method can be used to control the size using external factors.
     * By default, the returned size is the same as the one declared by the user.
     */
    desiredSize() {
        return {
            x: this.width.context.getter(),
            y: this.height.context.getter(),
        };
    }
    *tweenSize(value, time, timingFunction, interpolationFunction) {
        const size = this.desiredSize();
        let from;
        if (typeof size.x !== 'number' || typeof size.y !== 'number') {
            from = this.size();
        }
        else {
            from = new Vector2(size);
        }
        let to;
        if (typeof value === 'object' &&
            typeof value.x === 'number' &&
            typeof value.y === 'number') {
            to = new Vector2(value);
        }
        else {
            this.size(value);
            to = this.size();
        }
        this.size(from);
        this.lockSize();
        yield* tween(time, value => this.size(interpolationFunction(from, to, timingFunction(value))));
        this.releaseSize();
        this.size(value);
    }
    constructor(props) {
        super(props);
    }
    lockSize() {
        this.sizeLockCounter(this.sizeLockCounter() + 1);
    }
    releaseSize() {
        this.sizeLockCounter(this.sizeLockCounter() - 1);
    }
    parentTransform() {
        let parent = this.parent();
        while (parent) {
            if (parent instanceof Layout) {
                return parent;
            }
            parent = parent.parent();
        }
        return null;
    }
    anchorPosition() {
        const size = this.computedSize();
        const offset = this.offset();
        return size.scale(0.5).mul(offset);
    }
    /**
     * Get the resolved layout mode of this node.
     *
     * @remarks
     * When the mode is `null`, its value will be inherited from the parent.
     *
     * Use {@link layout} to get the raw mode set for this node (without
     * inheritance).
     */
    layoutEnabled() {
        return this.layout() ?? this.parentTransform()?.layoutEnabled() ?? false;
    }
    isLayoutRoot() {
        return !this.layoutEnabled() || !this.parentTransform()?.layoutEnabled();
    }
    localToParent() {
        const matrix = super.localToParent();
        const offset = this.offset();
        if (!offset.exactlyEquals(Vector2.zero)) {
            const translate = this.size().mul(offset).scale(-0.5);
            matrix.translateSelf(translate.x, translate.y);
        }
        return matrix;
    }
    /**
     * A simplified version of {@link localToParent} matrix used for transforming
     * direction vectors.
     *
     * @internal
     */
    scalingRotationMatrix() {
        const matrix = new DOMMatrix();
        matrix.rotateSelf(0, 0, this.rotation());
        matrix.scaleSelf(this.scale.x(), this.scale.y());
        const offset = this.offset();
        if (!offset.exactlyEquals(Vector2.zero)) {
            const translate = this.size().mul(offset).scale(-0.5);
            matrix.translateSelf(translate.x, translate.y);
        }
        return matrix;
    }
    getComputedLayout() {
        return new BBox(this.element.getBoundingClientRect());
    }
    computedPosition() {
        this.requestLayoutUpdate();
        const box = this.getComputedLayout();
        const position = new Vector2(box.x + (box.width / 2) * this.offset.x(), box.y + (box.height / 2) * this.offset.y());
        const parent = this.parentTransform();
        if (parent) {
            const parentRect = parent.getComputedLayout();
            position.x -= parentRect.x + (parentRect.width - box.width) / 2;
            position.y -= parentRect.y + (parentRect.height - box.height) / 2;
        }
        return position;
    }
    computedSize() {
        this.requestLayoutUpdate();
        return this.getComputedLayout().size;
    }
    /**
     * Find the closest layout root and apply any new layout changes.
     */
    requestLayoutUpdate() {
        const parent = this.parentTransform();
        if (this.appendedToView()) {
            parent?.requestFontUpdate();
            this.updateLayout();
        }
        else {
            parent.requestLayoutUpdate();
        }
    }
    appendedToView() {
        const root = this.isLayoutRoot();
        if (root) {
            this.view().element.append(this.element);
        }
        return root;
    }
    /**
     * Apply any new layout changes to this node and its children.
     */
    updateLayout() {
        this.applyFont();
        this.applyFlex();
        if (this.layoutEnabled()) {
            const children = this.layoutChildren();
            for (const child of children) {
                child.updateLayout();
            }
        }
    }
    layoutChildren() {
        const queue = [...this.children()];
        const result = [];
        const elements = [];
        while (queue.length) {
            const child = queue.shift();
            if (child instanceof Layout) {
                if (child.layoutEnabled()) {
                    result.push(child);
                    elements.push(child.element);
                }
            }
            else if (child) {
                queue.unshift(...child.children());
            }
        }
        this.element.replaceChildren(...elements);
        return result;
    }
    /**
     * Apply any new font changes to this node and all of its ancestors.
     */
    requestFontUpdate() {
        this.appendedToView();
        this.parentTransform()?.requestFontUpdate();
        this.applyFont();
    }
    getCacheBBox() {
        return BBox.fromSizeCentered(this.computedSize());
    }
    draw(context) {
        if (this.clip()) {
            const size = this.computedSize();
            if (size.width === 0 || size.height === 0) {
                return;
            }
            context.beginPath();
            context.rect(size.width / -2, size.height / -2, size.width, size.height);
            context.closePath();
            context.clip();
        }
        this.drawChildren(context);
    }
    drawOverlay(context, matrix) {
        const size = this.computedSize();
        const offset = size.mul(this.offset()).scale(0.5).transformAsPoint(matrix);
        const box = BBox.fromSizeCentered(size);
        const layout = box.transformCorners(matrix);
        const padding = box
            .addSpacing(this.padding().scale(-1))
            .transformCorners(matrix);
        const margin = box.addSpacing(this.margin()).transformCorners(matrix);
        context.beginPath();
        drawLine(context, margin);
        drawLine(context, layout);
        context.closePath();
        context.fillStyle = 'rgba(255,193,125,0.6)';
        context.fill('evenodd');
        context.beginPath();
        drawLine(context, layout);
        drawLine(context, padding);
        context.closePath();
        context.fillStyle = 'rgba(180,255,147,0.6)';
        context.fill('evenodd');
        context.beginPath();
        drawLine(context, layout);
        context.closePath();
        context.lineWidth = 1;
        context.strokeStyle = 'white';
        context.stroke();
        context.beginPath();
        drawPivot(context, offset);
        context.stroke();
    }
    getOriginDelta(origin) {
        const size = this.computedSize().scale(0.5);
        const offset = this.offset().mul(size);
        if (origin === Origin.Middle) {
            return offset.flipped;
        }
        const newOffset = originToOffset(origin).mul(size);
        return newOffset.sub(offset);
    }
    /**
     * Update the offset of this node and adjust the position to keep it in the
     * same place.
     *
     * @param offset - The new offset.
     */
    moveOffset(offset) {
        const size = this.computedSize().scale(0.5);
        const oldOffset = this.offset().mul(size);
        const newOffset = offset.mul(size);
        this.offset(offset);
        this.position(this.position().add(newOffset).sub(oldOffset));
    }
    parsePixels(value) {
        return value === null ? '' : `${value}px`;
    }
    parseLength(value) {
        if (value === null) {
            return '';
        }
        if (typeof value === 'string') {
            return value;
        }
        return `${value}px`;
    }
    applyFlex() {
        this.element.style.position = this.isLayoutRoot() ? 'absolute' : 'relative';
        const size = this.desiredSize();
        this.element.style.width = this.parseLength(size.x);
        this.element.style.height = this.parseLength(size.y);
        this.element.style.maxWidth = this.parseLength(this.maxWidth());
        this.element.style.minWidth = this.parseLength(this.minWidth());
        this.element.style.maxHeight = this.parseLength(this.maxHeight());
        this.element.style.minHeight = this.parseLength(this.minHeight());
        this.element.style.aspectRatio =
            this.ratio() === null ? '' : this.ratio().toString();
        this.element.style.marginTop = this.parsePixels(this.margin.top());
        this.element.style.marginBottom = this.parsePixels(this.margin.bottom());
        this.element.style.marginLeft = this.parsePixels(this.margin.left());
        this.element.style.marginRight = this.parsePixels(this.margin.right());
        this.element.style.paddingTop = this.parsePixels(this.padding.top());
        this.element.style.paddingBottom = this.parsePixels(this.padding.bottom());
        this.element.style.paddingLeft = this.parsePixels(this.padding.left());
        this.element.style.paddingRight = this.parsePixels(this.padding.right());
        this.element.style.flexDirection = this.direction();
        this.element.style.flexBasis = this.parseLength(this.basis());
        this.element.style.flexWrap = this.wrap();
        this.element.style.justifyContent = this.justifyContent();
        this.element.style.alignContent = this.alignContent();
        this.element.style.alignItems = this.alignItems();
        this.element.style.alignSelf = this.alignSelf();
        this.element.style.columnGap = this.parseLength(this.gap.x());
        this.element.style.rowGap = this.parseLength(this.gap.y());
        if (this.sizeLockCounter() > 0) {
            this.element.style.flexGrow = '0';
            this.element.style.flexShrink = '0';
        }
        else {
            this.element.style.flexGrow = this.grow().toString();
            this.element.style.flexShrink = this.shrink().toString();
        }
    }
    applyFont() {
        this.element.style.fontFamily = this.fontFamily.isInitial()
            ? ''
            : this.fontFamily();
        this.element.style.fontSize = this.fontSize.isInitial()
            ? ''
            : `${this.fontSize()}px`;
        this.element.style.fontStyle = this.fontStyle.isInitial()
            ? ''
            : this.fontStyle();
        if (this.lineHeight.isInitial()) {
            this.element.style.lineHeight = '';
        }
        else {
            const lineHeight = this.lineHeight();
            this.element.style.lineHeight =
                typeof lineHeight === 'string'
                    ? (parseFloat(lineHeight) / 100).toString()
                    : `${lineHeight}px`;
        }
        this.element.style.fontWeight = this.fontWeight.isInitial()
            ? ''
            : this.fontWeight().toString();
        this.element.style.letterSpacing = this.letterSpacing.isInitial()
            ? ''
            : `${this.letterSpacing()}px`;
        this.element.style.textAlign = this.textAlign.isInitial()
            ? ''
            : this.textAlign();
        if (this.textWrap.isInitial()) {
            this.element.style.whiteSpace = '';
        }
        else {
            const wrap = this.textWrap();
            if (typeof wrap === 'boolean') {
                this.element.style.whiteSpace = wrap ? 'normal' : 'nowrap';
            }
            else {
                this.element.style.whiteSpace = wrap;
            }
        }
    }
    dispose() {
        super.dispose();
        this.sizeLockCounter?.context.dispose();
        if (this.element) {
            this.element.remove();
            this.element.innerHTML = '';
        }
        this.element = null;
        this.styles = null;
    }
    hit(position) {
        const local = position.transformAsPoint(this.localToParent().inverse());
        if (this.cacheBBox().includes(local)) {
            return super.hit(position) ?? this;
        }
        return null;
    }
}
__decorate([
    initial(null),
    signal()
], Layout.prototype, "layout", void 0);
__decorate([
    initial(null),
    signal()
], Layout.prototype, "maxWidth", void 0);
__decorate([
    initial(null),
    signal()
], Layout.prototype, "maxHeight", void 0);
__decorate([
    initial(null),
    signal()
], Layout.prototype, "minWidth", void 0);
__decorate([
    initial(null),
    signal()
], Layout.prototype, "minHeight", void 0);
__decorate([
    initial(null),
    signal()
], Layout.prototype, "ratio", void 0);
__decorate([
    spacingSignal('margin')
], Layout.prototype, "margin", void 0);
__decorate([
    spacingSignal('padding')
], Layout.prototype, "padding", void 0);
__decorate([
    initial('row'),
    signal()
], Layout.prototype, "direction", void 0);
__decorate([
    initial(null),
    signal()
], Layout.prototype, "basis", void 0);
__decorate([
    initial(0),
    signal()
], Layout.prototype, "grow", void 0);
__decorate([
    initial(1),
    signal()
], Layout.prototype, "shrink", void 0);
__decorate([
    initial('nowrap'),
    signal()
], Layout.prototype, "wrap", void 0);
__decorate([
    initial('start'),
    signal()
], Layout.prototype, "justifyContent", void 0);
__decorate([
    initial('normal'),
    signal()
], Layout.prototype, "alignContent", void 0);
__decorate([
    initial('stretch'),
    signal()
], Layout.prototype, "alignItems", void 0);
__decorate([
    initial('auto'),
    signal()
], Layout.prototype, "alignSelf", void 0);
__decorate([
    initial(0),
    vector2Signal({ x: 'columnGap', y: 'rowGap' })
], Layout.prototype, "gap", void 0);
__decorate([
    defaultStyle('font-family'),
    signal()
], Layout.prototype, "fontFamily", void 0);
__decorate([
    defaultStyle('font-size', parseFloat),
    signal()
], Layout.prototype, "fontSize", void 0);
__decorate([
    defaultStyle('font-style'),
    signal()
], Layout.prototype, "fontStyle", void 0);
__decorate([
    defaultStyle('font-weight', parseInt),
    signal()
], Layout.prototype, "fontWeight", void 0);
__decorate([
    defaultStyle('line-height', parseFloat),
    signal()
], Layout.prototype, "lineHeight", void 0);
__decorate([
    defaultStyle('letter-spacing', i => (i === 'normal' ? 0 : parseFloat(i))),
    signal()
], Layout.prototype, "letterSpacing", void 0);
__decorate([
    defaultStyle('white-space', i => (i === 'pre' ? 'pre' : i === 'normal')),
    signal()
], Layout.prototype, "textWrap", void 0);
__decorate([
    initial('inherit'),
    signal()
], Layout.prototype, "textDirection", void 0);
__decorate([
    defaultStyle('text-align'),
    signal()
], Layout.prototype, "textAlign", void 0);
__decorate([
    initial({ x: null, y: null }),
    vector2Signal({ x: 'width', y: 'height' })
], Layout.prototype, "size", void 0);
__decorate([
    threadable()
], Layout.prototype, "tweenWidth", null);
__decorate([
    threadable()
], Layout.prototype, "tweenHeight", null);
__decorate([
    computed()
], Layout.prototype, "desiredSize", null);
__decorate([
    threadable()
], Layout.prototype, "tweenSize", null);
__decorate([
    vector2Signal('offset')
], Layout.prototype, "offset", void 0);
__decorate([
    originSignal(Origin.Middle)
], Layout.prototype, "middle", void 0);
__decorate([
    originSignal(Origin.Top)
], Layout.prototype, "top", void 0);
__decorate([
    originSignal(Origin.Bottom)
], Layout.prototype, "bottom", void 0);
__decorate([
    originSignal(Origin.Left)
], Layout.prototype, "left", void 0);
__decorate([
    originSignal(Origin.Right)
], Layout.prototype, "right", void 0);
__decorate([
    originSignal(Origin.TopLeft)
], Layout.prototype, "topLeft", void 0);
__decorate([
    originSignal(Origin.TopRight)
], Layout.prototype, "topRight", void 0);
__decorate([
    originSignal(Origin.BottomLeft)
], Layout.prototype, "bottomLeft", void 0);
__decorate([
    originSignal(Origin.BottomRight)
], Layout.prototype, "bottomRight", void 0);
__decorate([
    initial(false),
    signal()
], Layout.prototype, "clip", void 0);
__decorate([
    initial(0),
    signal()
], Layout.prototype, "sizeLockCounter", void 0);
__decorate([
    computed()
], Layout.prototype, "parentTransform", null);
__decorate([
    computed()
], Layout.prototype, "anchorPosition", null);
__decorate([
    computed()
], Layout.prototype, "layoutEnabled", null);
__decorate([
    computed()
], Layout.prototype, "isLayoutRoot", null);
__decorate([
    computed()
], Layout.prototype, "scalingRotationMatrix", null);
__decorate([
    computed()
], Layout.prototype, "computedPosition", null);
__decorate([
    computed()
], Layout.prototype, "computedSize", null);
__decorate([
    computed()
], Layout.prototype, "requestLayoutUpdate", null);
__decorate([
    computed()
], Layout.prototype, "appendedToView", null);
__decorate([
    computed()
], Layout.prototype, "updateLayout", null);
__decorate([
    computed()
], Layout.prototype, "layoutChildren", null);
__decorate([
    computed()
], Layout.prototype, "requestFontUpdate", null);
__decorate([
    computed()
], Layout.prototype, "applyFlex", null);
__decorate([
    computed()
], Layout.prototype, "applyFont", null);
function originSignal(origin) {
    return (target, key) => {
        signal()(target, key);
        cloneable(false)(target, key);
        const meta = getPropertyMeta(target, key);
        meta.parser = value => new Vector2(value);
        meta.getter = function () {
            return this.getOriginDelta(origin).transformAsPoint(this.localToParent());
        };
        meta.setter = function (value) {
            this.position(modify(value, unwrapped => this.getOriginDelta(origin)
                .transform(this.scalingRotationMatrix())
                .flipped.add(unwrapped)));
            return this;
        };
    };
}
addInitializer(Layout.prototype, instance => {
    instance.element = document.createElement('div');
    instance.element.style.display = 'flex';
    instance.element.style.boxSizing = 'border-box';
    instance.styles = getComputedStyle(instance.element);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTGF5b3V0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbXBvbmVudHMvTGF5b3V0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLE9BQU8sRUFDTCxjQUFjLEVBQ2QsU0FBUyxFQUNULFFBQVEsRUFDUixZQUFZLEVBQ1osZUFBZSxFQUNmLE9BQU8sRUFDUCxNQUFNLEVBRU4sYUFBYSxHQUNkLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFDTCxNQUFNLEVBQ04sY0FBYyxFQUdkLElBQUksRUFHSixPQUFPLEdBR1IsTUFBTSwrQkFBK0IsQ0FBQztBQUN2QyxPQUFPLEVBR0wsS0FBSyxHQUNOLE1BQU0sa0NBQWtDLENBQUM7QUFhMUMsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLG9DQUFvQyxDQUFDO0FBRTlELE9BQU8sRUFBQyxJQUFJLEVBQVksTUFBTSxRQUFRLENBQUM7QUFDdkMsT0FBTyxFQUFDLFFBQVEsRUFBRSxTQUFTLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFDN0MsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLDZCQUE2QixDQUFDO0FBQzFELE9BQU8sRUFDTCxNQUFNLEdBSVAsTUFBTSxpQ0FBaUMsQ0FBQztBQWlJekMsTUFBTSxPQUFPLE1BQU8sU0FBUSxJQUFJO0lBMEQ5QixJQUFXLFNBQVM7UUFDbEIsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUNwQixDQUFDO0lBQ0QsSUFBVyxNQUFNO1FBQ2YsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUNwQixDQUFDO0lBK0JTLElBQUk7UUFDWixJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUUsRUFBRTtZQUN2QixPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO1NBQ2hDO1FBRUQsT0FBTyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDbkMsQ0FB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Q0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7UUFDckUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBRXZFLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztRQUNyRSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFDM0UsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZFLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUV6RSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ3BELElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUcsQ0FBQyxDQUFDO1FBQy9ELElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7UUFFMUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxj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