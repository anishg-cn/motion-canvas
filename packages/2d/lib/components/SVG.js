var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { isReactive, } from '@motion-canvas/core/lib/signals';
import { BBox, Matrix2D, Vector2, } from '@motion-canvas/core/lib/types';
import { computed, signal } from '../decorators';
import { Shape } from './Shape';
import { Node } from './Node';
import { useLogger } from '@motion-canvas/core/lib/utils';
import { Path } from './Path';
import { Rect } from './Rect';
import { clampRemap, easeInOutSine, tween, } from '@motion-canvas/core/lib/tweening';
import { Layout } from './Layout';
import { lazy, threadable } from '@motion-canvas/core/lib/decorators';
import { View2D } from './View2D';
import { all, delay } from '@motion-canvas/core/lib/flow';
import { Circle } from './Circle';
import { Line } from './Line';
import { Img } from './Img';
import { applyTransformDiff, getTransformDiff } from '../utils/diff';
/**
A Node for drawing and animating SVG images.

@remarks
If you're not interested in animating SVG, you can use {@link Img} instead.
 */
export class SVG extends Shape {
    constructor(props) {
        super(props);
        this.lastTweenTargetSrc = null;
        this.lastTweenTargetDocument = null;
        this.wrapper = new Node({});
        this.wrapper.children(this.documentNodes);
        this.wrapper.scale(this.wrapperScale);
        this.add(this.wrapper);
    }
    /**
     * Get all SVG nodes with the given id.
     * @param id - An id to query.
     */
    getChildrenById(id) {
        return this.document()
            .nodes.filter(node => node.id === id)
            .map(({ shape }) => shape);
    }
    desiredSize() {
        const docSize = this.document().size;
        const scale = this.calculateWrapperScale(docSize, super.desiredSize());
        return docSize.mul(scale);
    }
    getCurrentSize() {
        return {
            x: this.width.isInitial() ? null : this.width(),
            y: this.height.isInitial() ? null : this.height(),
        };
    }
    calculateWrapperScale(documentSize, parentSize) {
        const result = new Vector2(1, 1);
        if (parentSize.x && parentSize.y) {
            result.x = parentSize.x / documentSize.width;
            result.y = parentSize.y / documentSize.height;
        }
        else if (parentSize.x && !parentSize.y) {
            result.x = parentSize.x / documentSize.width;
            result.y = result.x;
        }
        else if (!parentSize.x && parentSize.y) {
            result.y = parentSize.y / documentSize.height;
            result.x = result.y;
        }
        return result;
    }
    /**
     * Convert `SVGDocumentData` to `SVGDocument`.
     * @param data - `SVGDocumentData` to convert.
     */
    buildDocument(data) {
        return {
            size: data.size,
            nodes: data.nodes.map(ch => this.buildShape(ch)),
        };
    }
    /**
     * Convert `SVGShapeData` to `SVGShape`.
     * @param data - `SVGShapeData` to convert.
     */
    buildShape({ id, type, props, children }) {
        return {
            id,
            shape: new type({
                children: children?.map(ch => this.buildShape(ch).shape),
                ...this.processElementStyle(props),
            }),
        };
    }
    /**
     * Convert an SVG string to `SVGDocument`.
     * @param svg - An SVG string to be parsed.
     */
    parseSVG(svg) {
        return this.buildDocument(SVG.parseSVGData(svg));
    }
    /**
     * Create a tweening list to tween between two SVG nodes.
     * @param from - The initial node,
     * @param to - The final node.
     * @param duration - The duration of the tween.
     * @param timing - The timing function.
     */
    *generateTransformer(from, to, duration, timing) {
        yield from.position(to.position(), duration, timing);
        yield from.scale(to.scale(), duration, timing);
        yield from.rotation(to.rotation(), duration, timing);
        if (from instanceof Path &&
            to instanceof Path &&
            from.data() !== to.data()) {
            yield from.data(to.data(), duration, timing);
        }
        if (from instanceof Layout && to instanceof Layout) {
            yield from.size(to.size(), duration, timing);
        }
        if (from instanceof Shape && to instanceof Shape) {
            yield from.fill(to.fill(), duration, timing);
            yield from.stroke(to.stroke(), duration, timing);
            yield from.lineWidth(to.lineWidth(), duration, timing);
        }
        const fromChildren = from.children();
        const toChildren = to.children();
        for (let i = 0; i < fromChildren.length; i++) {
            yield* this.generateTransformer(fromChildren[i], toChildren[i], duration, timing);
        }
    }
    *tweenSvg(value, time, timingFunction) {
        const newValue = isReactive(value) ? value() : value;
        const newSVG = this.parseSVG(newValue);
        const currentSVG = this.document();
        const diff = getTransformDiff(currentSVG.nodes, newSVG.nodes);
        this.lastTweenTargetSrc = newValue;
        this.lastTweenTargetDocument = newSVG;
        applyTransformDiff(currentSVG.nodes, diff, ({ shape, ...rest }) => ({
            ...rest,
            shape: shape.clone(),
        }));
        this.wrapper.children(currentSVG.nodes.map(shape => shape.shape));
        for (const item of currentSVG.nodes) {
            item.shape.parent(this.wrapper);
        }
        const beginning = 0.2;
        const ending = 0.8;
        const overlap = 0.15;
        const transformator = [];
        const transformatorTime = (ending - beginning) * time;
        const transformatorDelay = beginning * time;
        for (const item of diff.transformed) {
            transformator.push(...this.generateTransformer(item.from.current.shape, item.to.current.shape, transformatorTime, timingFunction));
        }
        const autoWidth = this.width.isInitial();
        const autoHeight = this.height.isInitial();
        this.wrapper.scale(this.calculateWrapperScale(currentSVG.size, this.getCurrentSize()));
        const baseTween = tween(time, value => {
            const progress = timingFunction(value);
            const remapped = clampRemap(beginning, ending, 0, 1, progress);
            const scale = this.wrapper.scale();
            if (autoWidth) {
                this.width(easeInOutSine(remapped, currentSVG.size.x, newSVG.size.x) * scale.x);
            }
            if (autoHeight) {
                this.height(easeInOutSine(remapped, currentSVG.size.y, newSVG.size.y) * scale.y);
            }
            const deletedOpacity = clampRemap(0, beginning + overlap, 1, 0, progress);
            for (const { current } of diff.deleted) {
                current.shape.opacity(deletedOpacity);
            }
            const insertedOpacity = clampRemap(ending - overlap, 1, 0, 1, progress);
            for (const { current } of diff.inserted) {
                current.shape.opacity(insertedOpacity);
            }
        }, () => {
            this.wrapper.children(this.documentNodes);
            if (autoWidth)
                this.width.reset();
            if (autoHeight)
                this.height.reset();
            for (const { current } of diff.deleted)
                current.shape.dispose();
            for (const { from } of diff.transformed) {
                from.current.shape.dispose();
            }
            this.wrapper.scale(this.wrapperScale);
        });
        yield* all(this.wrapper.scale(this.calculateWrapperScale(newSVG.size, this.getCurrentSize()), time, timingFunction), baseTween, delay(transformatorDelay, all(...transformator)));
    }
    wrapperScale() {
        return this.calculateWrapperScale(this.document().size, this.getCurrentSize());
    }
    /**
     * Get the current `SVGDocument`.
     */
    document() {
        try {
            const src = this.svg();
            if (this.lastTweenTargetDocument && src === this.lastTweenTargetSrc) {
                return this.lastTweenTargetDocument;
            }
            return this.parseSVG(src);
        }
        finally {
            this.lastTweenTargetSrc = null;
            this.lastTweenTargetDocument = null;
        }
    }
    /**
     * Get current document nodes.
     */
    documentNodes() {
        return this.document().nodes.map(node => node.shape);
    }
    /**
     * Convert SVG colors in Shape properties to Motion Canvas colors.
     * @param param - Shape properties.
     * @returns Converted Shape properties.
     */
    processElementStyle({ fill, stroke, ...rest }) {
        return {
            fill: fill === 'currentColor' ? this.fill : SVG.processSVGColor(fill),
            stroke: stroke === 'currentColor' ? this.stroke : SVG.processSVGColor(stroke),
            ...rest,
        };
    }
    /**
     * Parse an SVG string as `SVGDocumentData`.
     * @param svg - And SVG string to be parsed.
     * @returns `SVGDocumentData` that can be used to build SVGDocument.
     */
    static parseSVGData(svg) {
        const cached = SVG.svgNodesPool[svg];
        if (cached && (cached.size.x > 0 || cached.size.y > 0))
            return cached;
        SVG.containerElement.innerHTML = svg;
        const svgRoot = SVG.containerElement.querySelector('svg');
        if (!svgRoot) {
            useLogger().error({
                message: 'Invalid SVG',
                object: svg,
            });
            return {
                size: new Vector2(0, 0),
                nodes: [],
            };
        }
        let viewBox = new BBox();
        let size = new Vector2();
        const hasViewBox = svgRoot.hasAttribute('viewBox');
        const hasSize = svgRoot.hasAttribute('width') || svgRoot.hasAttribute('height');
        if (hasViewBox) {
            const { x, y, width, height } = svgRoot.viewBox.baseVal;
            viewBox = new BBox(x, y, width, height);
            if (!hasSize)
                size = viewBox.size;
        }
        if (hasSize) {
            size = new Vector2(svgRoot.width.baseVal.value, svgRoot.height.baseVal.value);
            if (!hasViewBox)
                viewBox = new BBox(0, 0, size.width, size.height);
        }
        if (!hasViewBox && !hasSize) {
            viewBox = new BBox(svgRoot.getBBox());
            size = viewBox.size;
        }
        const scale = size.div(viewBox.size);
        const center = viewBox.center;
        const rootTransform = new DOMMatrix()
            .scaleSelf(scale.x, scale.y)
            .translateSelf(-center.x, -center.y);
        const nodes = Array.from(SVG.extractGroupNodes(svgRoot, svgRoot, rootTransform, {}));
        const builder = {
            size,
            nodes,
        };
        SVG.svgNodesPool[svg] = builder;
        return builder;
    }
    /**
     * Get position, rotation and scale from Matrix transformation as Shape properties
     * @param transform - Matrix transformation
     * @returns MotionCanvas Shape properties
     */
    static getMatrixTransformation(transform) {
        const matrix2 = new Matrix2D(transform);
        const position = matrix2.translation;
        const rotation = matrix2.rotation;
        // matrix.scaling can give incorrect result when matrix contain skew operation
        const scale = {
            x: matrix2.x.magnitude,
            y: matrix2.y.magnitude,
        };
        if (matrix2.determinant < 0) {
            if (matrix2.values[0] < matrix2.values[3])
                scale.x = -scale.x;
            else
                scale.y = -scale.y;
        }
        return {
            position,
            rotation,
            scale,
        };
    }
    /**
     * Convert an SVG color into a Motion Canvas color.
     * @param color - SVG color.
     * @returns Motion Canvas color.
     */
    static processSVGColor(color) {
        if (color === 'transparent' || color === 'none') {
            return null;
        }
        return color;
    }
    /**
     * Get the final transformation matrix for the given SVG element.
     * @param element - SVG element.
     * @param parentTransform - The transformation matrix of the parent.
     */
    static getElementTransformation(element, parentTransform) {
        const transform = element.transform.baseVal.consolidate();
        const transformMatrix = (transform ? parentTransform.multiply(transform.matrix) : parentTransform).translate(SVG.parseNumberAttribute(element, 'x'), SVG.parseNumberAttribute(element, 'y'));
        return transformMatrix;
    }
    static parseLineCap(name) {
        if (!name)
            return null;
        if (name === 'butt' || name === 'round' || name === 'square')
            return name;
        useLogger().warn(`SVG: invalid line cap "${name}"`);
        return null;
    }
    static parseLineJoin(name) {
        if (!name)
            return null;
        if (name === 'bevel' || name === 'miter' || name === 'round')
            return name;
        if (name === 'arcs' || name === 'miter-clip') {
            useLogger().warn(`SVG: line join is not supported "${name}"`);
        }
        else {
            useLogger().warn(`SVG: invalid line join "${name}"`);
        }
        return null;
    }
    static parseLineDash(value) {
        if (!value)
            return null;
        const list = value.split(/,|\s+/);
        if (list.findIndex(str => str.endsWith('%')) > 0) {
            useLogger().warn(`SVG: percentage line dash are ignored`);
            return null;
        }
        return list.map(str => parseFloat(str));
    }
    static parseDashOffset(value) {
        if (!value)
            return null;
        const trimmed = value.trim();
        if (trimmed.endsWith('%')) {
            useLogger().warn(`SVG: percentage line dash offset are ignored`);
        }
        return parseFloat(trimmed);
    }
    static parseOpacity(value) {
        if (!value)
            return null;
        if (value.endsWith('%'))
            return parseFloat(value) / 100;
        return parseFloat(value);
    }
    /**
     * Convert the SVG element's style to a Motion Canvas Shape properties.
     * @param element - An SVG element whose style should be converted.
     * @param inheritedStyle - The parent style that should be inherited.
     */
    static getElementStyle(element, inheritedStyle) {
        return {
            fill: element.getAttribute('fill') ?? inheritedStyle.fill,
            stroke: element.getAttribute('stroke') ?? inheritedStyle.stroke,
            lineWidth: element.hasAttribute('stroke-width')
                ? parseFloat(element.getAttribute('stroke-width'))
                : inheritedStyle.lineWidth,
            lineCap: this.parseLineCap(element.getAttribute('stroke-linecap')) ??
                inheritedStyle.lineCap,
            lineJoin: this.parseLineJoin(element.getAttribute('stroke-linejoin')) ??
                inheritedStyle.lineJoin,
            lineDash: this.parseLineDash(element.getAttribute('stroke-dasharray')) ??
                inheritedStyle.lineDash,
            lineDashOffset: this.parseDashOffset(element.getAttribute('stroke-dashoffset')) ??
                inheritedStyle.lineDashOffset,
            opacity: this.parseOpacity(element.getAttribute('opacity')) ??
                inheritedStyle.opacity,
            layout: false,
        };
    }
    /**
     * Extract `SVGShapeData` list from the SVG element's children.
     * This will not extract the current element's shape.
     * @param element - An element whose children will be extracted.
     * @param svgRoot - The SVG root ("svg" tag) of the element.
     * @param parentTransform - The transformation matrix applied to the parent.
     * @param inheritedStyle - The style of the current SVG `element` that the children should inherit.
     */
    static *extractGroupNodes(element, svgRoot, parentTransform, inheritedStyle) {
        for (const child of element.children) {
            if (!(child instanceof SVGGraphicsElement))
                continue;
            yield* this.extractElementNodes(child, svgRoot, parentTransform, inheritedStyle);
        }
    }
    /**
     * Parse a number from an SVG element attribute.
     * @param element - SVG element whose attribute will be parsed.
     * @param name - The name of the attribute to parse.
     * @returns a parsed number or `0` if the attribute is not defined.
     */
    static parseNumberAttribute(element, name) {
        return parseFloat(element.getAttribute(name) ?? '0');
    }
    /**
     * Extract `SVGShapeData` list from the SVG element.
     * This will also recursively extract shapes from its children.
     * @param child - An SVG element to extract.
     * @param svgRoot - The SVG root ("svg" tag) of the element.
     * @param parentTransform - The transformation matrix applied to the parent.
     * @param inheritedStyle - The style of the parent SVG element that the element should inherit.
     */
    static *extractElementNodes(child, svgRoot, parentTransform, inheritedStyle) {
        const transformMatrix = SVG.getElementTransformation(child, parentTransform);
        const style = SVG.getElementStyle(child, inheritedStyle);
        const id = child.id ?? '';
        if (child.tagName === 'g') {
            yield* SVG.extractGroupNodes(child, svgRoot, transformMatrix, style);
        }
        else if (child.tagName === 'use') {
            const hrefElement = svgRoot.querySelector(child.href.baseVal);
            if (!(hrefElement instanceof SVGGraphicsElement)) {
                useLogger().warn(`invalid SVG use tag. element "${child.outerHTML}"`);
                return;
            }
            yield* SVG.extractElementNodes(hrefElement, svgRoot, transformMatrix, inheritedStyle);
        }
        else if (child.tagName === 'path') {
            const data = child.getAttribute('d');
            if (!data) {
                useLogger().warn('blank path data at ' + child.id);
                return;
            }
            const transformation = transformMatrix;
            yield {
                id: id || 'path',
                type: Path,
                props: {
                    data,
                    tweenAlignPath: true,
                    ...SVG.getMatrixTransformation(transformation),
                    ...style,
                },
            };
        }
        else if (child.tagName === 'rect') {
            const width = SVG.parseNumberAttribute(child, 'width');
            const height = SVG.parseNumberAttribute(child, 'height');
            const rx = SVG.parseNumberAttribute(child, 'rx');
            const ry = SVG.parseNumberAttribute(child, 'ry');
            const bbox = new BBox(0, 0, width, height);
            const center = bbox.center;
            const transformation = transformMatrix.translate(center.x, center.y);
            yield {
                id: id || 'rect',
                type: Rect,
                props: {
                    width,
                    height,
                    radius: [rx, ry],
                    ...SVG.getMatrixTransformation(transformation),
                    ...style,
                },
            };
        }
        else if (['circle', 'ellipse'].includes(child.tagName)) {
            const cx = SVG.parseNumberAttribute(child, 'cx');
            const cy = SVG.parseNumberAttribute(child, 'cy');
            const size = child.tagName === 'circle'
                ? SVG.parseNumberAttribute(child, 'r') * 2
                : [
                    SVG.parseNumberAttribute(child, 'rx') * 2,
                    SVG.parseNumberAttribute(child, 'ry') * 2,
                ];
            const transformation = transformMatrix.translate(cx, cy);
            yield {
                id: id || child.tagName,
                type: Circle,
                props: {
                    size,
                    ...style,
                    ...SVG.getMatrixTransformation(transformation),
                },
            };
        }
        else if (['line', 'polyline', 'polygon'].includes(child.tagName)) {
            const numbers = child.tagName === 'line'
                ? ['x1', 'y1', 'x2', 'y2'].map(attr => SVG.parseNumberAttribute(child, attr))
                : child
                    .getAttribute('points')
                    .match(/-?[\d.e+-]+/g)
                    .map(value => parseFloat(value));
            const points = numbers.reduce((accum, current) => {
                let last = accum.at(-1);
                if (!last || last.length === 2) {
                    last = [];
                    accum.push(last);
                }
                last.push(current);
                return accum;
            }, []);
            if (child.tagName === 'polygon')
                points.push(points[0]);
            yield {
                id: id || child.tagName,
                type: Line,
                props: {
                    points,
                    ...style,
                    ...SVG.getMatrixTransformation(transformMatrix),
                },
            };
        }
        else if (child.tagName === 'image') {
            const x = SVG.parseNumberAttribute(child, 'x');
            const y = SVG.parseNumberAttribute(child, 'y');
            const width = SVG.parseNumberAttribute(child, 'width');
            const height = SVG.parseNumberAttribute(child, 'height');
            const href = child.getAttribute('href') ?? '';
            const bbox = new BBox(x, y, width, height);
            const center = bbox.center;
            const transformation = transformMatrix.translate(center.x, center.y);
            yield {
                id: id || child.tagName,
                type: Img,
                props: {
                    src: href,
                    ...style,
                    ...SVG.getMatrixTransformation(transformation),
                },
            };
        }
    }
}
SVG.svgNodesPool = {};
__decorate([
    signal()
], SVG.prototype, "svg", void 0);
__decorate([
    threadable()
], SVG.prototype, "tweenSvg", null);
__decorate([
    computed()
], SVG.prototype, "wrapperScale", null);
__decorate([
    computed()
], SVG.prototype, "document", null);
__decorate([
    computed()
], SVG.prototype, "documentNodes", null);
__decorate([
    lazy(() => {
        const element = document.createElement('div');
        View2D.shadowRoot.appendChild(element);
        return element;
    })
], SVG, "containerElement", void 0);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU1ZHLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbXBvbmVudHMvU1ZHLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLE9BQU8sRUFHTCxVQUFVLEdBQ1gsTUFBTSxpQ0FBaUMsQ0FBQztBQUN6QyxPQUFPLEVBQ0wsSUFBSSxFQUNKLFFBQVEsRUFHUixPQUFPLEdBQ1IsTUFBTSwrQkFBK0IsQ0FBQztBQUN2QyxPQUFPLEVBQUMsUUFBUSxFQUFFLE1BQU0sRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUMvQyxPQUFPLEVBQUMsS0FBSyxFQUFhLE1BQU0sU0FBUyxDQUFDO0FBQzFDLE9BQU8sRUFBQyxJQUFJLEVBQVksTUFBTSxRQUFRLENBQUM7QUFFdkMsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLCtCQUErQixDQUFDO0FBQ3hELE9BQU8sRUFBQyxJQUFJLEVBQVksTUFBTSxRQUFRLENBQUM7QUFDdkMsT0FBTyxFQUFDLElBQUksRUFBWSxNQUFNLFFBQVEsQ0FBQztBQUN2QyxPQUFPLEVBQ0wsVUFBVSxFQUNWLGFBQWEsRUFFYixLQUFLLEdBQ04sTUFBTSxrQ0FBa0MsQ0FBQztBQUMxQyxPQUFPLEVBQUMsTUFBTSxFQUFDLE1BQU0sVUFBVSxDQUFDO0FBQ2hDLE9BQU8sRUFBQyxJQUFJLEVBQUUsVUFBVSxFQUFDLE1BQU0sb0NBQW9DLENBQUM7QUFDcEUsT0FBTyxFQUFDLE1BQU0sRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUNoQyxPQUFPLEVBQUMsR0FBRyxFQUFFLEtBQUssRUFBQyxNQUFNLDhCQUE4QixDQUFDO0FBRXhELE9BQU8sRUFBQyxNQUFNLEVBQWMsTUFBTSxVQUFVLENBQUM7QUFDN0MsT0FBTyxFQUFDLElBQUksRUFBWSxNQUFNLFFBQVEsQ0FBQztBQUN2QyxPQUFPLEVBQUMsR0FBRyxFQUFXLE1BQU0sT0FBTyxDQUFDO0FBQ3BDLE9BQU8sRUFBQyxrQkFBa0IsRUFBRSxnQkFBZ0IsRUFBQyxNQUFNLGVB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