import { PossibleVector2, Vector2 } from '@motion-canvas/core/lib/types/Vector';
import type { Length } from '../partials';
import { Signal } from '@motion-canvas/core/lib/signals';
export type Vector2LengthSignal<TOwner> = Signal<PossibleVector2<Length>, Vector2, TOwner> & {
    x: Signal<Length, number, TOwner>;
    y: Signal<Length, number, TOwner>;
};
export declare function vector2Signal(prefix?: string | Record<string, string>): PropertyDecorator;
//# sourceMappingURL=vector2Signal.d.ts.map