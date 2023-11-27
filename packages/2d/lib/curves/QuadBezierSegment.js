var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Vector2 } from '@motion-canvas/core/lib/types';
import { quadraticCurveTo } from '../utils';
import { PolynomialSegment } from './PolynomialSegment';
import { Polynomial2D } from './Polynomial2D';
import { lazy } from '@motion-canvas/core/lib/decorators';
/**
 * A spline segment representing a quadratic Bézier curve.
 */
export class QuadBezierSegment extends PolynomialSegment {
    get points() {
        return [this.p0, this.p1, this.p2];
    }
    constructor(p0, p1, p2) {
        super(new Polynomial2D(p0, 
        // 2*(-p0+p1)
        p0.flipped.add(p1).scale(2), 
        // p0-2*p1+p2
        p0.sub(p1.scale(2)).add(p2)), QuadBezierSegment.getLength(p0, p1, p2));
        this.p0 = p0;
        this.p1 = p1;
        this.p2 = p2;
    }
    split(t) {
        const a = new Vector2(this.p0.x + (this.p1.x - this.p0.x) * t, this.p0.y + (this.p1.y - this.p0.y) * t);
        const b = new Vector2(this.p1.x + (this.p2.x - this.p1.x) * t, this.p1.y + (this.p2.y - this.p1.y) * t);
        const p = new Vector2(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
        const left = new QuadBezierSegment(this.p0, a, p);
        const right = new QuadBezierSegment(p, b, this.p2);
        return [left, right];
    }
    static getLength(p0, p1, p2) {
        // Let the browser do the work for us instead of calculating the arclength
        // manually.
        QuadBezierSegment.el.setAttribute('d', `M ${p0.x} ${p0.y} Q ${p1.x} ${p1.y} ${p2.x} ${p2.y}`);
        return QuadBezierSegment.el.getTotalLength();
    }
    doDraw(context) {
        quadraticCurveTo(context, this.p1, this.p2);
    }
}
__decorate([
    lazy(() => document.createElementNS('http://www.w3.org/2000/svg', 'path'))
], QuadBezierSegment, "el", void 0);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUXVhZEJlemllclNlZ21lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY3VydmVzL1F1YWRCZXppZXJTZWdtZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLE9BQU8sRUFBQyxPQUFPLEVBQUMsTUFBTSwrQkFBK0IsQ0FBQztBQUN0RCxPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFDMUMsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDdEQsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQzVDLE9BQU8sRUFBQyxJQUFJLEVBQUMsTUFBTSxvQ0FBb0MsQ0FBQztBQUV4RDs7R0FFRztBQUNILE1BQU0sT0FBTyxpQkFBa0IsU0FBUSxpQkFBaUI7SUFJdEQsSUFBVyxNQUFNO1FBQ2YsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDckMsQ0FBQztJQUVELFlBQ2tCLEVBQVcsRUFDWCxFQUFXLEVBQ1gsRUFBVztRQUUzQixLQUFLLENBQ0gsSUFBSSxZQUFZLENBQ2QsRUFBRTtRQUNGLGFBQWE7UUFDYixFQUFFLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQzNCLGFBQWE7UUFDYixFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQzVCLEVBQ0QsaUJBQWlCLENBQUMsU0FBUyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQ3hDLENBQUM7UUFiYyxPQUFFLEdBQUYsRUFBRSxDQUFTO1FBQ1gsT0FBRSxHQUFGLEVBQUUsQ0FBUztRQUNYLE9BQUUsR0FBRixFQUFF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