import { Shape, ShapeProps } from './Shape';
import { SignalValue, SimpleSignal } from '@motion-canvas/core/lib/signals';
export interface PolygonProps extends ShapeProps {
    /**
     * {@inheritDoc Polygon.sides}
     */
    sides?: SignalValue<number>;
}
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
export declare class Polygon extends Shape {
    /**
     * Sets the number of sides of the polygon.
     *
     * @remarks
     * For example, a value of 6 creates a hexagon.
     *
     *
     * @example
     * ```tsx
     * <Polygon
     *   size={320}
     *   sides={7}
     *   stroke={'#fff'}
     *   lineWidth={8}
     *   fill={'lightseagreen'}
     * />
     * ```
     */
    readonly sides: SimpleSignal<number, this>;
    constructor(props: PolygonProps);
    protected getPath(): Path2D;
    protected getRipplePath(): Path2D;
}
//# sourceMappingURL=Polygon.d.ts.map