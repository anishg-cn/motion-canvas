import { useLogger } from '@motion-canvas/core/lib/utils';
import { getPropertyMetaOrCreate } from './signal';
import { addInitializer } from './initializers';
import { deepLerp, map } from '@motion-canvas/core/lib/tweening';
import { CompoundSignalContext, SignalContext, } from '@motion-canvas/core/lib/signals';
import { makeSignalExtensions } from '../utils/makeSignalExtensions';
import { modify } from '@motion-canvas/core/lib/signals/utils';
/**
 * Create a compound property decorator.
 *
 * @remarks
 * This decorator turns a given property into a signal consisting of one or more
 * nested signals.
 *
 * @example
 * ```ts
 * class Example {
 *   \@compound({x: 'scaleX', y: 'scaleY'})
 *   public declare readonly scale: Signal<Vector2, this>;
 *
 *   public setScale() {
 *     this.scale({x: 7, y: 3});
 *     // same as:
 *     this.scale.x(7).scale.y(3);
 *   }
 * }
 * ```
 *
 * @param entries - A record mapping the property in the compound object to the
 *                  corresponding property on the owner node.
 */
export function compound(entries) {
    return (target, key) => {
        const meta = getPropertyMetaOrCreate(target, key);
        meta.compound = true;
        meta.compoundEntries = Object.entries(entries);
        addInitializer(target, (instance) => {
            if (!meta.parser) {
                useLogger().error(`Missing parser decorator for "${key.toString()}"`);
                return;
            }
            const initial = meta.default;
            const parser = meta.parser.bind(instance);
            const signalContext = new CompoundSignalContext(meta.compoundEntries.map(([key, property]) => {
                const signal = new SignalContext(modify(initial, value => parser(value)[key]), map, instance, undefined, makeSignalExtensions(undefined, instance, property)).toSignal();
                return [key, signal];
            }), parser, initial, meta.interpolationFunction ?? deepLerp, instance, makeSignalExtensions(meta, instance, key));
            instance[key] = signalContext.toSignal();
        });
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG91bmQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZGVjb3JhdG9ycy9jb21wb3VuZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sK0JBQStCLENBQUM7QUFDeEQsT0FBTyxFQUFDLHVCQUF1QixFQUFDLE1BQU0sVUFBVSxDQUFDO0FBQ2pELE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUM5QyxPQUFPLEVBQUMsUUFBUSxFQUFFLEdBQUcsRUFBQyxNQUFNLGtDQUFrQyxDQUFDO0FBQy9ELE9BQU8sRUFDTCxxQkFBcUIsRUFDckIsYUFBYSxHQUNkLE1BQU0saUNBQWlDLENBQUM7QUFDekMsT0FBTyxFQUFDLG9CQUFvQixFQUFDLE1BQU0sK0JBQStCLENBQUM7QUFDbkUsT0FBTyxFQUFDLE1BQU0sRUFBQyxNQUFNLHVDQUF1QyxDQUFDO0FBRTdEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXVCRztBQUNILE1BQU0sVUFBVSxRQUFRLENBQUMsT0FBK0I7SUFDdEQsT0FBTyxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsRUFBRTtRQUNyQixNQUFNLElBQUksR0FBRyx1QkFBdUIsQ0FBTSxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDdkQsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7UUFDckIsSUFBSSxDQUFDLGVBQWUsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRS9DLGNBQWMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxRQUFhLEVBQUUsRUFBRTtZQUN2QyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDaEIsU0FBUyxFQUFFLENBQUMsS0FBSyxDQUFDLGlDQUFpQyxHQUFHLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDO2dCQUN0RSxPQUFPO2FBQ1I7WUFFRCxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO1lBQzdCLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzFDLE1BQU0sYUFBYSxHQUFHLElBQUkscUJBQXFCLENBQzdDLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLEVBQUUsRUFBRTtnQkFDM0MsTUFBTSxNQUFNLEdBQUcsSUFBSSxhQUFhLENBQzlCLE1BQU0sQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFDdkMsR0FBRyxFQUNSLFFBQVEsRUFDUixTQUFTLEVBQ1Qsb0JBQW9CLENBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FDcEQsQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDYixPQUFPLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ3ZCLENBQUMsQ0FBQyxFQUNGLE1BQU0sRUFDTixPQUFPLEVBQ1AsSUFBSSxDQUFDLHFCQUFxQixJQUFJLFFBQVEsRUFDdEMsUUFBUSxFQUNSLG9CQUFvQixDQUFDLElBQUksRUFBRSxRQUFRLEVBQVUsR0FBRyxDQUFDLENBQ2xELENBQUM7WUFFRixRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsYUFBYSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQzNDLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQyxDQUFDO0FBQ0osQ0FBQyJ9