import { SignalValue, SimpleSignal } from '@motion-canvas/core/lib/signals';
import { BBox, Vector2 } from '@motion-canvas/core/lib/types';
import { CurveProfile } from '../curves';
import { Curve, CurveProps } from './Curve';
import { TimingFunction } from '@motion-canvas/core/lib/tweening';
export interface PathProps extends CurveProps {
    data: SignalValue<string>;
}
export declare class Path extends Curve {
    private currentProfile;
    readonly data: SimpleSignal<string, this>;
    constructor(props: PathProps);
    profile(): CurveProfile;
    protected childrenBBox(): BBox;
    protected lineWidthCoefficient(): number;
    protected processSubpath(path: Path2D, startPoint: Vector2 | null, endPoint: Vector2 | null): void;
    protected tweenData(newPath: SignalValue<string>, time: number, timingFunction: TimingFunction): Generator<void | import("@motion-canvas/core").ThreadGenerator | Promise<any> | import("@motion-canvas/core").Promisable<any>, void, any>;
    drawOverlay(context: CanvasRenderingContext2D, matrix: DOMMatrix): void;
}
//# sourceMappingURL=Path.d.ts.map