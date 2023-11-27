var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { BBox } from '@motion-canvas/core/lib/types';
import { Shape } from './Shape';
import { initial, signal } from '../decorators';
import { drawPolygon } from '../utils';
/**
 * A node for drawing regular polygons.
 *
 * @remarks
 * This node can be used to render shapes such as: triangle, pentagon,
 * hexagon and more.
 *
 * Note that the polygon is inscribed in a circle defined by the height
 * and width. If height and width are unequal, the polygon is inscribed
 * in the resulting ellipse.
 *
 * Since the polygon is inscribed in the circle, the actual displayed
 * height and width may differ somewhat from the bounding rectangle. This
 * will be particularly noticeable if the number of sides is low, e.g. for a
 * triangle.
 *
 * @preview
 * ```tsx editor
 * // snippet Polygon
 * import {makeScene2D, Polygon} from '@motion-canvas/2d';
 * import {createRef} from '@motion-canvas/core';
 *
 * export default makeScene2D(function* (view) {
 *   const ref = createRef<Polygon>();
 *   view.add(
 *     <Polygon
 *       ref={ref}
 *       sides={6}
 *       size={160}
 *       fill={'lightseagreen'}
 *     />
 *   );
 *
 *   yield* ref().sides(3, 2).to(6, 2);
 * });
 *
 * // snippet Pentagon outline
 * import {makeScene2D, Polygon} from '@motion-canvas/2d';
 *
 * export default makeScene2D(function* (view) {
 *   view.add(
 *     <Polygon
 *       sides={5}
 *       size={160}
 *       stroke={'lightblue'}
 *       lineWidth={8}
 *     />
 *   );
 * });
 * ```
 */
export class Polygon extends Shape {
    constructor(props) {
        super(props);
    }
    getPath() {
        const path = new Path2D();
        const sides = this.sides();
        const box = BBox.fromSizeCentered(this.size());
        drawPolygon(path, box, sides);
        return path;
    }
    getRipplePath() {
        const path = new Path2D();
        const sides = this.sides();
        const rippleSize = this.rippleSize();
        const box = BBox.fromSizeCentered(this.size()).expand(rippleSize);
        drawPolygon(path, box, sides);
        return path;
    }
}
__decorate([
    initial(6),
    signal()
], Polygon.prototype, "sides", void 0);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUG9seWdvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21wb25lbnRzL1BvbHlnb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsT0FBTyxFQUFDLElBQUksRUFBQyxNQUFNLCtCQUErQixDQUFDO0FBQ25ELE9BQU8sRUFBQyxLQUFLLEVBQWEsTUFBTSxTQUFTLENBQUM7QUFDMUMsT0FBTyxFQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFOUMsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLFVBQVUsQ0FBQztBQVNyQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FrREc7QUFDSCxNQUFNLE9BQU8sT0FBUSxTQUFRLEtBQUs7SUF1QmhDLFlBQW1CLEtBQW1CO1FBQ3BDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNmLENBQUM7SUFFa0IsT0FBTztRQUN4QixNQUFNLElBQUksR0FBRyxJQUFJLE1BQU0sRUFBRSxDQUFDO1FBQzFCLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUUzQixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7UUFDL0MsV0FBVyxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFOUIsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBQ2tCLGFBQWE7UUFDOUIsTUFBTSxJQUFJLEdBQUcsSUFBSSxNQUFNLEVBQUUsQ0FBQztRQUMxQixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDM0IsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBRXJDLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDbEUsV0FBVyxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFOUIsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0NBQ0Y7QUF6QkM7SUFGQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBQ1YsTUFBTSxFQUFFO3NDQUNpRCJ9