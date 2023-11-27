var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { computed, initial, signal } from '../decorators';
import { DEG2RAD } from '@motion-canvas/core/lib/utils';
import { Curve } from './Curve';
import { BBox } from '@motion-canvas/core';
import { getCircleProfile } from '../curves';
/**
 * A node for drawing circular shapes.
 *
 * @remarks
 * This node can be used to render shapes such as: circle, ellipse, arc, and
 * sector (pie chart).
 *
 * @preview
 * ```tsx editor
 * // snippet Simple circle
 * import {makeScene2D, Circle} from '@motion-canvas/2d';
 *
 * export default makeScene2D(function* (view) {
 *   view.add(
 *     <Circle
 *       size={160}
 *       fill={'lightseagreen'}
 *     />
 *    );
 * });
 *
 * // snippet Ellipse
 * import {makeScene2D, Circle} from '@motion-canvas/2d';
 *
 * export default makeScene2D(function* (view) {
 *   view.add(
 *     <Circle
 *       width={160}
 *       height={80}
 *       fill={'lightseagreen'}
 *     />
 *   );
 * });
 *
 * // snippet Sector (pie chart):
 * import {makeScene2D, Circle} from '@motion-canvas/2d';
 * import {createRef} from '@motion-canvas/core';
 *
 * export default makeScene2D(function* (view) {
 *   const ref = createRef<Circle>();
 *   view.add(
 *     <Circle
 *       ref={ref}
 *       size={160}
 *       fill={'lightseagreen'}
 *       startAngle={30}
 *       endAngle={270}
 *       closed={true}
 *     />
 *   );
 *
 *   yield* ref().startAngle(270, 2).to(30, 2);
 * });
 *
 * // snippet Arc:
 * import {makeScene2D, Circle} from '@motion-canvas/2d';
 * import {createRef} from '@motion-canvas/core';
 *
 * export default makeScene2D(function* (view) {
 *   const ref = createRef<Circle>();
 *   view.add(
 *     <Circle
 *       ref={ref}
 *       size={160}
 *       stroke={'lightseagreen'}
 *       lineWidth={8}
 *       startAngle={-90}
 *       endAngle={90}
 *     />
 *   );
 *
 *   yield* ref().startAngle(-270, 2).to(-90, 2);
 * });
 *
 * // snippet Curve properties:
 * import {makeScene2D, Circle} from '@motion-canvas/2d';
 * import {all, createRef, easeInCubic, easeOutCubic} from '@motion-canvas/core';
 *
 * export default makeScene2D(function* (view) {
 *   const ref = createRef<Circle>();
 *   view.add(
 *     <Circle
 *       ref={ref}
 *       size={160}
 *       stroke={'lightseagreen'}
 *       lineWidth={8}
 *       endAngle={270}
 *       endArrow
 *     />,
 *   );
 *
 *   yield* all(ref().start(1, 1), ref().rotation(180, 1, easeInCubic));
 *   ref().start(0).end(0);
 *   yield* all(ref().end(1, 1), ref().rotation(360, 1, easeOutCubic));
 * });
 * ```
 */
export class Circle extends Curve {
    constructor(props) {
        super(props);
    }
    profile() {
        return getCircleProfile(this.size().scale(0.5), this.startAngle() * DEG2RAD, this.endAngle() * DEG2RAD, this.closed(), this.counterclockwise());
    }
    desiredSize() {
        return {
            x: this.width.context.getter(),
            y: this.height.context.getter(),
        };
    }
    offsetComputedLayout(box) {
        return box;
    }
    childrenBBox() {
        return BBox.fromSizeCentered(this.computedSize());
    }
    getPath() {
        if (this.requiresProfile()) {
            return this.curveDrawingInfo().path;
        }
        return this.createPath();
    }
    getRipplePath() {
        return this.createPath(this.rippleSize());
    }
    getCacheBBox() {
        return super.getCacheBBox().expand(this.rippleSize());
    }
    createPath(expand = 0) {
        const path = new Path2D();
        const start = this.startAngle() * DEG2RAD;
        let end = this.endAngle() * DEG2RAD;
        const size = this.size().scale(0.5).add(expand);
        const closed = this.closed();
        if (end > start + Math.PI * 2) {
            const loops = Math.floor((end - start) / (Math.PI * 2));
            end -= Math.PI * 2 * loops;
        }
        if (closed) {
            path.moveTo(0, 0);
        }
        path.ellipse(0, 0, size.x, size.y, 0, start, end, this.counterclockwise());
        if (closed) {
            path.closePath();
        }
        return path;
    }
}
__decorate([
    initial(0),
    signal()
], Circle.prototype, "startAngle", void 0);
__decorate([
    initial(360),
    signal()
], Circle.prototype, "endAngle", void 0);
__decorate([
    initial(false),
    signal()
], Circle.prototype, "counterclockwise", void 0);
__decorate([
    computed()
], Circle.prototype, "profile", null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2lyY2xlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbXBvbmVudHMvQ2lyY2xlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUNBLE9BQU8sRUFBQyxRQUFRLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN4RCxPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sK0JBQStCLENBQUM7QUFDdEQsT0FBTyxFQUFDLEtBQUssRUFBYSxNQUFNLFNBQVMsQ0FBQztBQUMxQyxPQUFPLEVBQUMsSUFBSSxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDekMsT0FBTyxFQUFlLGdCQUFnQixFQUFDLE1BQU0sV0FBVyxDQUFDO0FBdUJ6RDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBZ0dHO0FBQ0gsTUFBTSxPQUFPLE1BQU8sU0FBUSxLQUFLO0lBdUUvQixZQUFtQixLQUFrQjtRQUNuQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDZixDQUFDO0lBR00sT0FBTztRQUNaLE9BQU8sZ0JBQWdCLENBQ3JCLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQ3RCLElBQUksQ0FBQyxVQUFVLEVBQUUsR0FBRyxPQUFPLEVBQzNCLElBQUksQ0FBQyxRQUFRLEVBQUUsR0FBRyxPQUFPLEVBQ3pCLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFDYixJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FDeEIsQ0FBQztJQUNKLENBQUM7SUFFa0IsV0FBVztRQUM1QixPQUFPO1lBQ0wsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRTtZQUM5QixDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFB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