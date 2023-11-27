import { easeInOutCubic, tween, } from '../tweening';
import { errorToLog, useLogger } from '../utils';
import { run, waitFor } from '../flow';
import { DependencyContext } from './DependencyContext';
import { isReactive, unwrap } from './utils';
import { DEFAULT } from './symbols';
export class SignalContext extends DependencyContext {
    constructor(initial, interpolation, owner = undefined, parser = value => value, extensions = {}) {
        super(owner);
        this.initial = initial;
        this.interpolation = interpolation;
        this.parser = parser;
        Object.defineProperty(this.invokable, 'reset', {
            value: this.reset.bind(this),
        });
        Object.defineProperty(this.invokable, 'save', {
            value: this.save.bind(this),
        });
        Object.defineProperty(this.invokable, 'isInitial', {
            value: this.isInitial.bind(this),
        });
        if (this.initial !== undefined) {
            this.current = this.initial;
            this.markDirty();
            if (!isReactive(this.initial)) {
                this.last = this.parse(this.initial);
            }
        }
        this.extensions = {
            getter: this.getter.bind(this),
            setter: this.setter.bind(this),
            tweener: this.tweener.bind(this),
            ...extensions,
        };
    }
    toSignal() {
        return this.invokable;
    }
    parse(value) {
        return this.parser(value);
    }
    set(value) {
        this.extensions.setter(value);
        return this.owner;
    }
    setter(value) {
        if (value === DEFAULT) {
            value = this.initial;
        }
        if (this.current === value) {
            return this.owner;
        }
        this.current = value;
        this.markDirty();
        this.clearDependencies();
        if (!isReactive(value)) {
            this.last = this.parse(value);
        }
        return this.owner;
    }
    get() {
        return this.extensions.getter();
    }
    getter() {
        if (this.event.isRaised() && isReactive(this.current)) {
            this.clearDependencies();
            this.startCollecting();
            try {
                this.last = this.parse(this.current());
            }
            catch (e) {
                useLogger().error({
                    ...errorToLog(e),
                    inspect: this.owner?.key,
                });
            }
            this.finishCollecting();
        }
        this.event.reset();
        this.collect();
        return this.last;
    }
    invoke(value, duration, timingFunction = easeInOutCubic, interpolationFunction = this.interpolation) {
        if (value === undefined) {
            return this.get();
        }
        if (duration === undefined) {
            return this.set(value);
        }
        const queue = this.createQueue(timingFunction, interpolationFunction);
        return queue.to(value, duration);
    }
    createQueue(defaultTimingFunction, defaultInterpolationFunction) {
        const initial = this.get();
        const queue = [];
        const task = run('animation chain', function* animate() {
            while (queue.length > 0) {
                yield* queue.shift();
            }
        });
        task.to = (value, duration, timingFunction = defaultTimingFunction, interpolationFunction = defaultInterpolationFunction) => {
            defaultTimingFunction = timingFunction;
            defaultInterpolationFunction = interpolationFunction;
            queue.push(this.tween(value, duration, timingFunction, interpolationFunction));
            return task;
        };
        task.back = (time, timingFunction = defaultTimingFunction, interpolationFunction = defaultInterpolationFunction) => {
            defaultTimingFunction = timingFunction;
            defaultInterpolationFunction = interpolationFunction;
            queue.push(this.tween(initial, time, defaultTimingFunction, defaultInterpolationFunction));
            return task;
        };
        task.wait = (duration) => {
            queue.push(waitFor(duration));
            return task;
        };
        task.run = (generator) => {
            queue.push(generator);
            return task;
        };
        task.do = (callback) => {
            queue.push(run(function* () {
                callback();
            }));
            return task;
        };
        return task;
    }
    *tween(value, duration, timingFunction, interpolationFunction) {
        if (value === DEFAULT) {
            value = this.initial;
        }
        yield* this.extensions.tweener(value, duration, timingFunction, interpolationFunction);
        this.set(value);
    }
    *tweener(value, duration, timingFunction, interpolationFunction) {
        const from = this.get();
        yield* tween(duration, v => {
            this.set(interpolationFunction(from, this.parse(unwrap(value)), timingFunction(v)));
        });
    }
    dispose() {
        super.dispose();
        this.initial = undefined;
        this.current = undefined;
        this.last = undefined;
    }
    /**
     * Reset the signal to its initial value (if one has been set).
     *
     * @example
     * ```ts
     * const signal = createSignal(7);
     *
     * signal.reset();
     * // same as:
     * signal(7);
     * ```
     */
    reset() {
        if (this.initial !== undefined) {
            this.set(this.initial);
        }
        return this.owner;
    }
    /**
     * Compute the current value of the signal and immediately set it.
     *
     * @remarks
     * This method can be used to stop the signal from updating while keeping its
     * current value.
     *
     * @example
     * ```ts
     * signal.save();
     * // same as:
     * signal(signal());
     * ```
     */
    save() {
        return this.set(this.get());
    }
    /**
     * Check if the signal is currently using its initial value.
     *
     * @example
     * ```ts
     *
     * const signal = createSignal(0);
     * signal.isInitial(); // true
     *
     * signal(5);
     * signal.isInitial(); // false
     *
     * signal(DEFAULT);
     * signal.isInitial(); // true
     * ```
     */
    isInitial() {
        this.collect();
        return this.current === this.initial;
    }
    /**
     * Get the raw value of this signal.
     *
     * @remarks
     * If the signal was provided with a factory function, the function itself
     * will be returned, without invoking it.
     *
     * This method can be used to create copies of signals.
     *
     * @example
     * ```ts
     * const a = createSignal(2);
     * const b = createSignal(() => a);
     * // b() == 2
     *
     * const bClone = createSignal(b.raw());
     * // bClone() == 2
     *
     * a(4);
     * // b() == 4
     * // bClone() == 4
     * ```
     */
    raw() {
        return this.current;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2lnbmFsQ29udGV4dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zaWduYWxzL1NpZ25hbENvbnRleHQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUNMLGNBQWMsRUFHZCxLQUFLLEdBQ04sTUFBTSxhQUFhLENBQUM7QUFDckIsT0FBTyxFQUFDLFVBQVUsRUFBRSxTQUFTLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFFL0MsT0FBTyxFQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUMsTUFBTSxTQUFTLENBQUM7QUFDckMsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFTdEQsT0FBTyxFQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUMsTUFBTSxTQUFTLENBQUM7QUFDM0MsT0FBTyxFQUFDLE9BQU8sRUFBQyxNQUFNLFdBQVcsQ0FBQztBQWtDbEMsTUFBTSxPQUFPLGFBSVgsU0FBUSxpQkFBeUI7SUFLakMsWUFDVSxPQUE4QyxFQUNyQyxhQUE0QyxFQUM3RCxRQUFrQyxTQUFVLEVBQ2xDLFNBQTBDLEtBQUssQ0FBQyxFQUFFLENBQVMsS0FBSyxFQUMxRSxhQUE4RCxFQUFFO1FBRWhFLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztRQU5MLFlBQU8sR0FBUCxPQUFPLENBQXVDO1FBQ3JDLGtCQUFhLEdBQWIsYUFBYSxDQUErQjtRQUVuRCxXQUFNLEdBQU4sTUFBTSxDQUEwRDtRQUsxRSxNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFFO1lBQzdDLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7U0FDN0IsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLE1BQU0sRUFBRTtZQUM1QyxLQUFLLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO1NBQzVCLENBQUMsQ0FBQztRQUNILE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxXQUFXLEVBQUU7WUFDakQsS0FBSyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztTQUNqQyxDQUFDLENBQUM7UUFFSCxJQUFJLElBQUksQ0FBQyxPQUFPLEtBQUssU0FBUyxFQUFFO1lBQzlCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztZQUM1QixJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7WUFFakIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQzdCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7YUFDdEM7U0FDRjtRQUVELElBQUksQ0FBQyxVQUFVLEdBQUc7WUFDaEIsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztZQUM5QixNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO1lBQzlCLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7WUFDaEMsR0FBRyxVQUFVO1NBQ2QsQ0FBQztJQUNKLENBQUM7SUFFTSxRQUFRO1FBQ2IsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDO0lBQ3hCLENBQUM7SUFFTSxLQUFLLENBQUMsS0FBbUI7UUFDOUIsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzVCLENBQUM7SUFFTSxHQUFHLENBQUMsS0FBaUQ7UUFDMUQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDOUIsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDO0lBQ3BCLENBQUM7SUFFTSxNQUFNLENBQUMsS0FBaUQ7UUFDN0QsSUFBSSxLQUFLLEtBQUssT0FBTyxFQUFFO1lBQ3JCLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBUSxDQUFDO1NBQ3ZCO1FBRUQsSUFBSSxJQUFJLENBQUMsT0FBTyxLQUFLLEtBQUssRUFBRTtZQUMxQixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUM7U0FDbkI7UUFFRCxJQUFJLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztRQUNyQixJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDakIsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFFekIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUN0QixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDL0I7UUFFRCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUM7SUFDcEIsQ0FBQztJQUVNLEdBQUc7UUFDUixPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDbEMsQ0FBQztJQUVNLE1BQU07UUFDWCxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUNyRCxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztZQUN6QixJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7WUFDdkIsSUFBSTtnQkFDRixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7YUFDeEM7WUFBQyxPQUFPLENBQU0sRUFBRTtnQkFDZixTQUFTLEVBQUUsQ0FBQyxLQUFLLENBQUM7b0JBQ2hCLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQztvQkFDaEIsT0FBTyxFQUFRLElBQUksQ0FBQyxLQUFNLEVBQUUsR0FBRztpQkFDaEMsQ0FBQyxDQUFDO2FBQ0o7WUFDRCxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztTQUN6QjtRQUNELElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDbkIsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBRWYsT0FBTyxJQUFJLENBQUMsSUFBSyxDQUFDO0lBQ3BCLENBQUM7SUFFa0IsTUFBTSxDQUN2QixLQUFrRCxFQUNsRCxRQUFpQixFQUNqQixpQkFBaUMsY0FBYyxFQUMvQyx3QkFBdUQsSUFBSSxDQUFDLGFBQWE7UUFFekUsSUFBSSxLQUFLLEtBQUssU0FBUyxFQUFFO1lBQ3ZCLE9BQU8sSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1NBQ25CO1FBRUQsSUFBSSxRQUFRLEtBQUssU0FBUyxFQUFFO1lBQzFCLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUN4QjtRQUVELE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsY0FBYyxFQUFFLHFCQUFxQixDQUFDLENBQUM7UUFDdEUsT0FBTyxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQztJQUNuQyxDQUFDO0lBRVMsV0FBVyxDQUNuQixxQkFBcUMsRUFDckMsNEJBQTJEO1FBRTNELE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUMzQixNQUFNLEtBQUssR0FBc0IsRUFBRSxDQUFDO1FBRXBDLE1BQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxpQkFBaUIsRUFBRSxRQUFRLENBQUMsQ0FBQyxPQUFPO1lBQ25ELE9BQU8sS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQ3ZCLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUcsQ0FBQzthQUN2QjtRQUNILENBQUMsQ0FBMEMsQ0FBQztRQUU1QyxJQUFJLENBQUMsRUFBRSxHQUFHLENBQ1IsS0FBaUQsRUFDakQsUUFBZ0IsRUFDaEIsY0FBYyxHQUFHLHFCQUFxQixFQUN0QyxxQkFBcUIsR0FBRyw0QkFBNEIsRUFDcEQsRUFBRTtZQUNGLHFCQUFxQixHQUFHLGNBQWMsQ0FBQztZQUN2Qyw0QkFBNEIsR0FBRyxxQkFBcUIsQ0FBQztZQUNyRCxLQUFLLENBQUMsSUFBSSxDQUNSLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxjQUFjLEVBQUUscUJBQXFCLENBQUMsQ0FDbkUsQ0FBQztZQUNGLE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FBQyxDQUFDO1FBRUYsSUFBSSxDQUFDLElBQUksR0FBRyxDQUNWLElBQVksRUFDWixjQUFjLEdBQUcscUJBQXFCLEVBQ3RDLHFCQUFxQixHQUFHLDRCQUE0QixFQUNwRCxFQUFFO1lBQ0YscUJBQXFCLEdBQUcsY0FBYyxDQUFDO1lBQ3ZDLDRCQUE0QixHQUFHLHFCQUFxQixDQUFDO1lBQ3JELEtBQUssQ0FBQyxJQUFJLENBQ1IsSUFBSSxDQUFDLEtBQUssQ0FDUixPQUFPLEVBQ1AsSUFBSSxFQUNKLHFCQUFxQixFQUNyQiw0QkFBNEIsQ0FDN0IsQ0FDRixDQUFDO1lBQ0YsT0FBTyxJQUFJLENBQUM7UUFDZCxDQUFDLENBQUM7UUFFRixJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsUUFBZ0IsRUFBRSxFQUFFO1lBQy9CLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDOUIsT0FBTyxJQUFJLENBQUM7UUFDZCxDQUFDLENBQUM7UUFFRixJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsU0FBMEIsRUFBRSxFQUFFO1lBQ3hDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDdEIsT0FBTyxJQUFJLENBQUM7UUFDZCxDQUFDLENBQUM7UUFFRixJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsUUFBb0IsRUFBRSxFQUFFO1lBQ2pDLEtBQUssQ0FBQyxJQUFJLENBQ1IsR0FBRyxDQUFDLFFBQVEsQ0FBQztnQkFDWCxRQUFRLEVBQUUsQ0FBQztZQUNiLENBQUMsQ0FBQyxDQUNILENBQUM7WUFDRixPQUFPLElBQUksQ0FBQztRQUNkLENBQUMsQ0FBQztRQUVGLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVTLENBQUMsS0FBSyxDQUNkLEtBQWlELEVBQ2pELFFBQWdCLEVBQ2hCLGNBQThCLEVBQzlCLHFCQUFvRDtRQUVwRCxJQUFJLEtBQUssS0FBSyxPQUFPLEVBQUU7WUFDckIsS0FBSyxHQUFHLElBQUksQ0FBQyxPQUFRLENBQUM7U0FDdkI7UUFFRCxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FDNUIsS0FBSyxFQUNMLFFBQVEsRUFDUixjQUFjLEVBQ2QscUJBQXFCLENBQ3RCLENBQUM7UUFDRixJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2xCLENBQUM7SUFFTSxDQUFDLE9BQU8sQ0FDYixLQUFnQyxFQUNoQyxRQUFnQixFQUNoQixjQUE4QixFQUM5QixxQkFBb0Q7UUFFcEQsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3hCLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLEVBQUU7WUFDekIsSUFBSSxDQUFDLEdBQUcsQ0FDTixxQkFBcUIsQ0FDbkIsSUFBSSxFQUNKLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQ3pCLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FDbEIsQ0FDRixDQUFDO1FBQ0osQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRWUsT0FBTztRQUNyQixLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDaEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxTQUFTLENBQUM7UUFDekIsSUFBSSxDQUFDLE9BQU8sR0FBRyxTQUFTLENBQUM7UUFDekIsSUFBSSxDQUFDLElBQUksR0FBRyxTQUFTLENBQUM7SUFDeEIsQ0FBQztJQUVEOzs7Ozs7Ozs7OztPQVdHO0lBQ0ksS0FBSztRQUNWLElBQUksSUFBSSxDQUFDLE9BQU8sS0FBSyxTQUFTLEVBQUU7WUFDOUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDeEI7UUFDRCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUM7SUFDcEIsQ0FBQztJQUVEOzs7Ozs7Ozs7Ozs7O09BYUc7SUFDSSxJQUFJO1FBQ1QsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO0lBQzlCLENBQUM7SUFFRDs7Ozs7Ozs7Ozs7Ozs7O09BZUc7SUFDSSxTQUFTO1FBQ2QsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2YsT0FBTyxJQUFJLENBQUMsT0FBTyxLQUFLLElBQUksQ0FBQyxPQUFPLENBQUM7SUFDdkMsQ0FBQztJQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O09Bc0JHO0lBQ0ksR0FBRztRQUNSLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQztJQUN0QixDQUFDO0NBQ0YifQ==