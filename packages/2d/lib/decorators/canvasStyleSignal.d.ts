import type { CanvasStyle, PossibleCanvasStyle } from '../partials';
import { Signal } from '@motion-canvas/core/lib/signals';
export type CanvasStyleSignal<T> = Signal<PossibleCanvasStyle, CanvasStyle, T>;
export declare function canvasStyleSignal(): PropertyDecorator;
//# sourceMappingURL=canvasStyleSignal.d.ts.map