import { Shape, ShapeProps } from './Shape';
import { BBox } from '@motion-canvas/core/lib/types';
import { SignalValue, SimpleSignal } from '@motion-canvas/core/lib/signals';
export interface TxtProps extends ShapeProps {
    children?: string;
    text?: SignalValue<string>;
}
export declare class Txt extends Shape {
    protected static formatter: HTMLDivElement;
    protected static readonly segmenter: any;
    readonly text: SimpleSignal<string, this>;
    constructor({ children, ...rest }: TxtProps);
    protected draw(context: CanvasRenderingContext2D): void;
    protected drawText(context: CanvasRenderingContext2D, text: string, box: BBox): void;
    protected getCacheBBox(): BBox;
    protected formattedText(): string;
    protected updateLayout(): void;
}
//# sourceMappingURL=Txt.d.ts.map