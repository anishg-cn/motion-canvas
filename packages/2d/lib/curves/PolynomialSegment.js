import { Segment } from './Segment';
import { UniformPolynomialCurveSampler } from './UniformPolynomialCurveSampler';
import { moveTo } from '../utils';
export class PolynomialSegment extends Segment {
    get arcLength() {
        return this.length;
    }
    constructor(curve, length) {
        super();
        this.curve = curve;
        this.length = length;
        this.pointSampler = new UniformPolynomialCurveSampler(this);
    }
    getBBox() {
        return this.curve.getBounds();
    }
    /**
     * Evaluate the polynomial at the given t value.
     *
     * @param t - The t value at which to evaluate the curve.
     */
    eval(t) {
        const tangent = this.tangent(t);
        return {
            position: this.curve.eval(t),
            tangent,
            normal: tangent.perpendicular,
        };
    }
    getPoint(distance) {
        const closestPoint = this.pointSampler.pointAtDistance(this.arcLength * distance);
        return {
            position: closestPoint.position,
            tangent: closestPoint.tangent,
            normal: closestPoint.tangent.perpendicular,
        };
    }
    transformPoints(matrix) {
        return this.points.map(point => point.transformAsPoint(matrix));
    }
    /**
     * Return the tangent of the point that sits at the provided t value on the
     * curve.
     *
     * @param t - The t value at which to evaluate the curve.
     */
    tangent(t) {
        return this.curve.evalDerivative(t).normalized;
    }
    draw(context, start = 0, end = 1, move = true) {
        let curve = null;
        let startT = start;
        let endT = end;
        let points = this.points;
        if (start !== 0 || end !== 1) {
            const startDistance = this.length * start;
            const endDistance = this.length * end;
            startT = this.pointSampler.distanceToT(startDistance);
            endT = this.pointSampler.distanceToT(endDistance);
            const relativeEndT = (endT - startT) / (1 - startT);
            const [, startSegment] = this.split(startT);
            [curve] = startSegment.split(relativeEndT);
            points = curve.points;
        }
        if (move) {
            moveTo(context, points[0]);
        }
        (curve ?? this).doDraw(context);
        const startTangent = this.tangent(startT);
        const endTangent = this.tangent(endT);
        return [
            {
                position: points[0],
                tangent: startTangent,
                normal: startTangent.perpendicular,
            },
            {
                position: points.at(-1),
                tangent: endTangent,
                normal: endTangent.perpendicular,
            },
        ];
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUG9seW5vbWlhbFNlZ21lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY3VydmVzL1BvbHlub21pYWxTZWdtZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBQyxPQUFPLEVBQUMsTUFBTSxXQUFXLENBQUM7QUFFbEMsT0FBTyxFQUFDLDZCQUE2QixFQUFDLE1BQU0saUNBQWlDLENBQUM7QUFDOUUsT0FBTyxFQUFDLE1BQU0sRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUloQyxNQUFNLE9BQWdCLGlCQUFrQixTQUFRLE9BQU87SUFHckQsSUFBVyxTQUFTO1FBQ2xCLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUNyQixDQUFDO0lBSUQsWUFDcUIsS0FBbUIsRUFDbkIsTUFBYztRQUVqQyxLQUFLLEVBQUUsQ0FBQztRQUhXLFVBQUssR0FBTCxLQUFLLENBQWM7UUFDbkIsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQUdqQyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksNkJBQTZCLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDOUQsQ0FBQztJQUVNLE9BQU87UUFDWixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUM7SUFDaEMsQ0FBQztJQUVEOzs7O09BSUc7SUFDSSxJQUFJLENBQUMsQ0FBUztRQUNuQixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRWhDLE9BQU87WUFDTCxRQUFRLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQzVCLE9BQU87WUFDUCxNQUFNLEVBQUUsT0FBTyxDQUFDLGFBQWE7U0FDOUIsQ0FBQztJQUNKLENBQUM7SUFVTSxRQUFRLENBQUMsUUFBZ0I7UUFDOUIsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxlQUFlLENBQ3BELElBQUksQ0FBQyxTQUFTLEdBQUcsUUFB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