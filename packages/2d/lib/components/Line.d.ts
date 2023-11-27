import { SignalValue, SimpleSignal } from '@motion-canvas/core/lib/signals';
import { BBox, PossibleVector2, Vector2 } from '@motion-canvas/core/lib/types';
import { CurveProfile } from '../curves';
import { Curve, CurveProps } from './Curve';
export interface LineProps extends CurveProps {
    radius?: SignalValue<number>;
    points?: SignalValue<SignalValue<PossibleVector2>[]>;
}
export declare class Line extends Curve {
    readonly radius: SimpleSignal<number, this>;
    readonly points: SimpleSignal<SignalValue<PossibleVector2>[] | null, this>;
    constructor(props: LineProps);
    protected childrenBBox(): BBox;
    parsedPoints(): Vector2[];
    profile(): CurveProfile;
    protected lineWidthCoefficient(): number;
    drawOverlay(context: CanvasRenderingContext2D, matrix: DOMMatrix): void;
}
//# sourceMappingURL=Line.d.ts.map