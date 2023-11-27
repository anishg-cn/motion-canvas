var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { clamp } from '@motion-canvas/core/lib/tweening';
import { Vector2 } from '@motion-canvas/core/lib/types';
import { getPointAtDistance } from '../curves/getPointAtDistance';
import { computed, initial, signal } from '../decorators';
import { lineTo, moveTo, resolveCanvasStyle } from '../utils';
import { Shape } from './Shape';
export class Curve extends Shape {
    desiredSize() {
        return this.childrenBBox().size;
    }
    constructor(props) {
        super(props);
        this.canHaveSubpath = false;
    }
    /**
     * Convert a percentage along the curve to a distance.
     *
     * @remarks
     * The returned distance is given in relation to the full curve, not
     * accounting for {@link startOffset} and {@link endOffset}.
     *
     * @param value - The percentage along the curve.
     */
    percentageToDistance(value) {
        return clamp(0, this.baseArcLength(), this.startOffset() + this.offsetArcLength() * value);
    }
    /**
     * Convert a distance along the curve to a percentage.
     *
     * @remarks
     * The distance should be given in relation to the full curve, not
     * accounting for {@link startOffset} and {@link endOffset}.
     *
     * @param value - The distance along the curve.
     */
    distanceToPercentage(value) {
        return (value - this.startOffset()) / this.offsetArcLength();
    }
    /**
     * The base arc length of this curve.
     *
     * @remarks
     * This is the entire length of this curve, not accounting for
     * {@link startOffset | the offsets}.
     */
    baseArcLength() {
        return this.profile().arcLength;
    }
    /**
     * The offset arc length of this curve.
     *
     * @remarks
     * This is the length of the curve that accounts for
     * {@link startOffset | the offsets}.
     */
    offsetArcLength() {
        const startOffset = this.startOffset();
        const endOffset = this.endOffset();
        const baseLength = this.baseArcLength();
        return clamp(0, baseLength, baseLength - startOffset - endOffset);
    }
    /**
     * The visible arc length of this curve.
     *
     * @remarks
     * This arc length accounts for both the offset and the {@link start} and
     * {@link end} properties.
     */
    arcLength() {
        return this.offsetArcLength() * Math.abs(this.start() - this.end());
    }
    /**
     * The percentage of the curve that's currently visible.
     *
     * @remarks
     * The returned value is the ratio between the visible length (as defined by
     * {@link start} and {@link end}) and the offset length of the curve.
     */
    completion() {
        return Math.abs(this.start() - this.end());
    }
    processSubpath(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _path, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _startPoint, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _endPoint) {
        // do nothing
    }
    curveDrawingInfo() {
        const path = new Path2D();
        let subpath = new Path2D();
        const profile = this.profile();
        let start = this.percentageToDistance(this.start());
        let end = this.percentageToDistance(this.end());
        if (start > end) {
            [start, end] = [end, start];
        }
        const distance = end - start;
        const arrowSize = Math.min(distance / 2, this.arrowSize());
        if (this.startArrow()) {
            start += arrowSize / 2;
        }
        if (this.endArrow()) {
            end -= arrowSize / 2;
        }
        let length = 0;
        let startPoint = null;
        let startTangent = null;
        let endPoint = null;
        let endTangent = null;
        for (const segment of profile.segments) {
            const previousLength = length;
            length += segment.arcLength;
            if (length < start) {
                continue;
            }
            const relativeStart = (start - previousLength) / segment.arcLength;
            const relativeEnd = (end - previousLength) / segment.arcLength;
            const clampedStart = clamp(0, 1, relativeStart);
            const clampedEnd = clamp(0, 1, relativeEnd);
            if (this.canHaveSubpath &&
                endPoint &&
                !segment.getPoint(0).position.equals(endPoint)) {
                path.addPath(subpath);
                this.processSubpath(subpath, startPoint, endPoint);
                subpath = new Path2D();
                startPoint = null;
            }
            const [startCurvePoint, endCurvePoint] = segment.draw(subpath, clampedStart, clampedEnd, startPoint === null);
            if (startPoint === null) {
                startPoint = startCurvePoint.position;
                startTangent = startCurvePoint.normal.flipped.perpendicular;
            }
            endPoint = endCurvePoint.position;
            endTangent = endCurvePoint.normal.flipped.perpendicular;
            if (length > end) {
                break;
            }
        }
        if (this.closed() &&
            this.start.isInitial() &&
            this.end.isInitial() &&
            this.startOffset.isInitial() &&
            this.endOffset.isInitial()) {
            subpath.closePath();
        }
        this.processSubpath(subpath, startPoint, endPoint);
        path.addPath(subpath);
        return {
            startPoint: startPoint ?? Vector2.zero,
            startTangent: startTangent ?? Vector2.right,
            endPoint: endPoint ?? Vector2.zero,
            endTangent: endTangent ?? Vector2.right,
            arrowSize,
            path,
            startOffset: start,
        };
    }
    getPointAtDistance(value) {
        return getPointAtDistance(this.profile(), value + this.startOffset());
    }
    getPointAtPercentage(value) {
        return getPointAtDistance(this.profile(), this.percentageToDistance(value));
    }
    getComputedLayout() {
        return this.offsetComputedLayout(super.getComputedLayout());
    }
    offsetComputedLayout(box) {
        box.position = box.position.sub(this.childrenBBox().center);
        return box;
    }
    getPath() {
        return this.curveDrawingInfo().path;
    }
    getCacheBBox() {
        const box = this.childrenBBox();
        const arrowSize = this.startArrow() || this.endArrow() ? this.arrowSize() : 0;
        const lineWidth = this.lineWidth();
        const coefficient = this.lineWidthCoefficient();
        return box.expand(Math.max(0, arrowSize, lineWidth * coefficient));
    }
    lineWidthCoefficient() {
        return this.lineCap() === 'square' ? 0.5 * 1.4143 : 0.5;
    }
    /**
     * Check if the path requires a profile.
     *
     * @remarks
     * The profile is only required if certain features are used. Otherwise, the
     * profile generation can be skipped, and the curve can be drawn directly
     * using the 2D context.
     */
    requiresProfile() {
        return (!this.start.isInitial() ||
            !this.startOffset.isInitial() ||
            !this.startArrow.isInitial() ||
            !this.end.isInitial() ||
            !this.endOffset.isInitial() ||
            !this.endArrow.isInitial());
    }
    drawShape(context) {
        super.drawShape(context);
        if (this.startArrow() || this.endArrow()) {
            this.drawArrows(context);
        }
    }
    drawArrows(context) {
        const { startPoint, startTangent, endPoint, endTangent, arrowSize } = this.curveDrawingInfo();
        if (arrowSize < 0.001) {
            return;
        }
        context.save();
        context.beginPath();
        if (this.endArrow()) {
            this.drawArrow(context, endPoint, endTangent.flipped, arrowSize);
        }
        if (this.startArrow()) {
            this.drawArrow(context, startPoint, startTangent, arrowSize);
        }
        context.fillStyle = resolveCanvasStyle(this.stroke(), context);
        context.closePath();
        context.fill();
        context.restore();
    }
    drawArrow(context, center, tangent, arrowSize) {
        const normal = tangent.perpendicular;
        const origin = center.add(tangent.scale(-arrowSize / 2));
        moveTo(context, origin);
        lineTo(context, origin.add(tangent.add(normal).scale(arrowSize)));
        lineTo(context, origin.add(tangent.sub(normal).scale(arrowSize)));
        lineTo(context, origin);
        context.closePath();
    }
}
__decorate([
    initial(false),
    signal()
], Curve.prototype, "closed", void 0);
__decorate([
    initial(0),
    signal()
], Curve.prototype, "start", void 0);
__decorate([
    initial(0),
    signal()
], Curve.prototype, "startOffset", void 0);
__decorate([
    initial(false),
    signal()
], Curve.prototype, "startArrow", void 0);
__decorate([
    initial(1),
    signal()
], Curve.prototype, "end", void 0);
__decorate([
    initial(0),
    signal()
], Curve.prototype, "endOffset", void 0);
__decorate([
    initial(false),
    signal()
], Curve.prototype, "endArrow", void 0);
__decorate([
    initial(24),
    signal()
], Curve.prototype, "arrowSize", void 0);
__decorate([
    computed()
], Curve.prototype, "arcLength", null);
__decorate([
    computed()
], Curve.prototype, "curveDrawingInfo", null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3VydmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29tcG9uZW50cy9DdXJ2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFDQSxPQUFPLEVBQUMsS0FBSyxFQUFDLE1BQU0sa0NBQWtDLENBQUM7QUFDdkQsT0FBTyxFQUEwQixPQUFPLEVBQUMsTUFBTSwrQkFBK0IsQ0FBQztBQUkvRSxPQUFPLEVBQUMsa0JBQWtCLEVBQUMsTUFBTSw4QkFBOEIsQ0FBQztBQUNoRSxPQUFPLEVBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFeEQsT0FBTyxFQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsa0JBQWtCLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFDNUQsT0FBTyxFQUFDLEtBQUssRUFBYSxNQUFNLFNBQVMsQ0FBQztBQXFDMUMsTUFBTSxPQUFnQixLQUFNLFNBQVEsS0FBSztJQTRHcEIsV0FBVztRQUM1QixPQUFPLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxJQUFJLENBQUM7SUFDbEMsQ0FBQztJQUVELFlBQW1CLEtBQWlCO1FBQ2xDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztRQVBMLG1CQUFjLEdBQUcsS0FBSyxDQUFDO0lBUWpDLENBQUM7SUFNRDs7Ozs7Ozs7T0FRRztJQUNJLG9CQUFvQixDQUFDLEtBQWE7UUFDdkMsT0FBTyxLQUFLLENBQ1YsQ0FBQyxFQUNELElBQUksQ0FBQyxhQUFhLEVBQUUsRUFDcEIsSUFBSSxDQUFDLFdBQVcsRUFBRSxHQUFHLElBQUksQ0FBQyxlQUFlLEVBQUUsR0FBRyxLQUFLLENBQ3BELENBQUM7SUFDSixDQUFDO0lBRUQ7Ozs7Ozs7O09BUUc7SUFDSSxvQkFBb0IsQ0FBQyxLQUFhO1FBQ3ZDLE9BQU8sQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO0lBQy9E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