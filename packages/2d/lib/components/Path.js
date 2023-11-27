var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { createSignal, isReactive, } from '@motion-canvas/core/lib/signals';
import { BBox } from '@motion-canvas/core/lib/types';
import { getPathProfile } from '../curves/getPathProfile';
import { computed, signal } from '../decorators';
import { drawLine, drawPivot } from '../utils';
import { Curve } from './Curve';
import { threadable } from '@motion-canvas/core/lib/decorators';
import { tween } from '@motion-canvas/core/lib/tweening';
import { createCurveProfileLerp } from '../curves/createCurveProfileLerp';
export class Path extends Curve {
    constructor(props) {
        super(props);
        this.currentProfile = createSignal(null);
        this.canHaveSubpath = true;
    }
    profile() {
        return this.currentProfile() ?? getPathProfile(this.data());
    }
    childrenBBox() {
        const points = this.profile().segments.flatMap(segment => segment.points);
        return BBox.fromPoints(...points);
    }
    lineWidthCoefficient() {
        const join = this.lineJoin();
        let coefficient = super.lineWidthCoefficient();
        if (join === 'miter') {
            const { minSin } = this.profile();
            if (minSin > 0) {
                coefficient = Math.max(coefficient, 0.5 / minSin);
            }
        }
        return coefficient;
    }
    processSubpath(path, startPoint, endPoint) {
        if (startPoint && endPoint && startPoint.equals(endPoint)) {
            path.closePath();
        }
    }
    *tweenData(newPath, time, timingFunction) {
        const fromProfile = this.profile();
        const toProfile = getPathProfile(isReactive(newPath) ? newPath() : newPath);
        const interpolator = createCurveProfileLerp(fromProfile, toProfile);
        this.currentProfile(fromProfile);
        yield* tween(time, value => {
            const progress = timingFunction(value);
            this.currentProfile(interpolator(progress));
        }, () => {
            this.currentProfile(null);
            this.data(newPath);
        });
    }
    drawOverlay(context, matrix) {
        const box = this.childrenBBox().transformCorners(matrix);
        const size = this.computedSize();
        const offset = size.mul(this.offset()).scale(0.5).transformAsPoint(matrix);
        const segments = this.profile().segments;
        context.lineWidth = 1;
        context.strokeStyle = 'white';
        context.fillStyle = 'white';
        context.save();
        context.setTransform(matrix);
        let endPoint = null;
        let path = new Path2D();
        for (const segment of segments) {
            if (endPoint && !segment.getPoint(0).position.equals(endPoint)) {
                context.stroke(path);
                path = new Path2D();
                endPoint = null;
            }
            const [, end] = segment.draw(path, 0, 1, endPoint == null);
            endPoint = end.position;
        }
        context.stroke(path);
        context.restore();
        context.beginPath();
        drawPivot(context, offset);
        context.stroke();
        context.beginPath();
        drawLine(context, box);
        context.closePath();
        context.stroke();
    }
}
__decorate([
    signal()
], Path.prototype, "data", void 0);
__decorate([
    computed()
], Path.prototype, "profile", null);
__decorate([
    threadable()
], Path.prototype, "tweenData", null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGF0aC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21wb25lbnRzL1BhdGgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsT0FBTyxFQUNMLFlBQVksRUFDWixVQUFVLEdBR1gsTUFBTSxpQ0FBaUMsQ0FBQztBQUN6QyxPQUFPLEVBQUMsSUFBSSxFQUFVLE1BQU0sK0JBQStCLENBQUM7QUFFNUQsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLDBCQUEwQixDQUFDO0FBQ3hELE9BQU8sRUFBQyxRQUFRLEVBQUUsTUFBTSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQy9DLE9BQU8sRUFBQyxRQUFRLEVBQUUsU0FBUyxFQUFDLE1BQU0sVUFBVSxDQUFDO0FBQzdDLE9BQU8sRUFBQyxLQUFLLEVBQWEsTUFBTSxTQUFTLENBQUM7QUFDMUMsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLG9DQUFvQyxDQUFDO0FBQzlELE9BQU8sRUFBaUIsS0FBSyxFQUFDLE1BQU0sa0NBQWtDLENBQUM7QUFDdkUsT0FBTyxFQUFDLHNCQUFzQixFQUFDLE1BQU0sa0NBQWtDLENBQUM7QUFNeEUsTUFBTSxPQUFPLElBQUssU0FBUSxLQUFLO0lBSzdCLFlBQW1CLEtBQWdCO1FBQ2pDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUxQLG1CQUFjLEdBQUcsWUFBWSxDQUFzQixJQUFJLENBQUMsQ0FBQztRQU0vRCxJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQztJQUM3QixDQUFDO0lBR2UsT0FBTztRQUNyQixPQUFPLElBQUksQ0FBQyxjQUFjLEVBQUUsSUFBSSxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7SUFDOUQsQ0FBQztJQUVrQixZQUFZO1FBQzdCLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTyxD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