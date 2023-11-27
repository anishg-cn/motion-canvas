var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { CubicBezierSegment } from '../curves';
import { computed, vector2Signal } from '../decorators';
import { bezierCurveTo, lineTo, moveTo } from '../utils';
import { Bezier } from './Bezier';
/**
 * A node for drawing a cubic Bézier curve.
 *
 * @preview
 * ```tsx editor
 * import {makeScene2D, CubicBezier} from '@motion-canvas/2d';
 * import {createRef} from '@motion-canvas/core';
 *
 * export default makeScene2D(function* (view) {
 *   const bezier = createRef<CubicBezier>();
 *
 *   view.add(
 *     <CubicBezier
 *       ref={bezier}
 *       lineWidth={4}
 *       stroke={'lightseagreen'}
 *       p0={[-200, -100]}
 *       p1={[100, -100]}
 *       p2={[-100, 100]}
 *       p3={[200, 100]}
 *       end={0}
 *     />
 *   );
 *
 *   yield* bezier().end(1, 1);
 *   yield* bezier().start(1, 1).to(0, 1);
 * });
 * ```
 */
export class CubicBezier extends Bezier {
    constructor(props) {
        super(props);
    }
    segment() {
        return new CubicBezierSegment(this.p0(), this.p1(), this.p2(), this.p3());
    }
    overlayInfo(matrix) {
        const [p0, p1, p2, p3] = this.segment().transformPoints(matrix);
        const curvePath = new Path2D();
        moveTo(curvePath, p0);
        bezierCurveTo(curvePath, p1, p2, p3);
        const handleLinesPath = new Path2D();
        moveTo(handleLinesPath, p0);
        lineTo(handleLinesPath, p1);
        moveTo(handleLinesPath, p2);
        lineTo(handleLinesPath, p3);
        return {
            curve: curvePath,
            startPoint: p0,
            endPoint: p3,
            controlPoints: [p1, p2],
            handleLines: handleLinesPath,
        };
    }
}
__decorate([
    vector2Signal('p0')
], CubicBezier.prototype, "p0", void 0);
__decorate([
    vector2Signal('p1')
], CubicBezier.prototype, "p1", void 0);
__decorate([
    vector2Signal('p2')
], CubicBezier.prototype, "p2", void 0);
__decorate([
    vector2Signal('p3')
], CubicBezier.prototype, "p3", void 0);
__decorate([
    computed()
], CubicBezier.prototype, "segment", null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3ViaWNCZXppZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29tcG9uZW50cy9DdWJpY0Jlemllci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFHQSxPQUFPLEVBQUMsa0JBQWtCLEVBQUMsTUFBTSxXQUFXLENBQUM7QUFFN0MsT0FBTyxFQUFDLFFBQVEsRUFBRSxhQUFhLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDdEQsT0FBTyxFQUFDLGFBQWEsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFDLE1BQU0sVUFBVSxDQUFDO0FBQ3ZELE9BQU8sRUFBQyxNQUFNLEVBQW9CLE1BQU0sVUFBVSxDQUFDO0FBb0JuRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQTRCRztBQUNILE1BQU0sT0FBTyxXQUFZLFNBQVEsTUFBTTtJQXlCckMsWUFBbUIsS0FBdUI7UUFDeEMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2YsQ0FBQztJQUdTLE9BQU87UUFDZixPQUFPLElBQUksa0JBQWtCLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDNUUsQ0FBQztJQUVTLFdBQVcsQ0FBQyxNQUFpQjtRQUNyQyxNQUFNLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUVoRSxNQUFNLFNBQVMsR0FBRyxJQUFJLE1BQU0sRUFBRSxDQUFDO1FBQy9CLE1BQU0sQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDdEIsYUFBYSxDQUFDLFNBQVMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRXJDLE1BQU0sZUFBZSxHQUFHLElBQUksTUFBTSxFQUFFLENBQUM7UUFDckMsTUFBTSxDQUFDLGVBQWUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUM1QixNQUFNLENBQUMsZUFBZSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzVCLE1BQU0sQ0FBQyxlQUFlLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDNUIsTUFBTSxDQUFDLGVBQWUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUU1QixPQUFPO1lBQ0wsS0FBSyxFQUFFLFNBQVM7WUFDaEIsVUFBVSxFQUFFLEVBQUU7WUFDZCxRQUFRLEVBQUUsRUFBRTtZQUNaLGFBQWEsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUM7WUFDdkIsV0FBVyxFQUFFLGVBQWU7U0FDN0IsQ0FBQztJQUNKLENBQUM7Q0FDRjtBQWxEQztJQURDLGFBQWEsQ0FBQyxJQUFJLENBQUM7dUNBQzRCO0FBTWhEO0lBREMsYUFBYSxDQUFDLElBQUksQ0FBQzt1Q0FDNEI7QUFNaEQ7SUFEQyxhQUFhLENBQUMsSUFBSSxDQUFDO3VDQUM0QjtBQU1oRDtJQURDLGFBQWEsQ0FBQyxJQUFJLENBQUM7dUNBQzRCO0FBT2hEO0lBREMsUUFBUSxFQUFFOzBDQUdWIn0=