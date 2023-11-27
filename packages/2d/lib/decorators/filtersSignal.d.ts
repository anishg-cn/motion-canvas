import { Filter, FilterName } from '../partials';
import { TimingFunction } from '@motion-canvas/core/lib/tweening';
import { ThreadGenerator } from '@motion-canvas/core/lib/threading';
import { Signal, SignalContext, SignalValue, SimpleSignal } from '@motion-canvas/core/lib/signals';
export type FiltersSignal<TOwner> = Signal<Filter[], Filter[], TOwner, FiltersSignalContext<TOwner>> & {
    [K in FilterName]: SimpleSignal<number, TOwner>;
};
export declare class FiltersSignalContext<TOwner> extends SignalContext<Filter[], Filter[], TOwner> {
    constructor(initial: Filter[], owner: TOwner);
    tweener(value: SignalValue<Filter[]>, duration: number, timingFunction: TimingFunction): ThreadGenerator;
}
export declare function filtersSignal(): PropertyDecorator;
//# sourceMappingURL=filtersSignal.d.ts.map