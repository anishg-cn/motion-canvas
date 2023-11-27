import { decorate, threadable } from '../decorators';
import { usePlayback } from '../utils';
import { Thread } from './Thread';
import { isThreadGenerator } from './ThreadGenerator';
import { setTaskName } from './names';
/**
 * Check if the given value is a [Promise][promise].
 *
 * @param value - A possible [Promise][promise].
 *
 * [promise]: https://developer.mozilla.org/en-US/docs/web/javascript/reference/global_objects/promise
 */
export function isPromise(value) {
    return typeof value?.then === 'function';
}
decorate(threads, threadable());
/**
 * Create a context in which generators can be run concurrently.
 *
 * @remarks
 * From the perspective of the external generator, `threads` is executed
 * synchronously. By default, each scene generator is wrapped in its own
 * `threads` generator.
 *
 * @example
 * ```ts
 * // first
 *
 * yield* threads(function* () {
 *   const task = yield generatorFunction();
 *   // second
 * }); // <- `task` will be terminated here because the scope
 *     //    of this `threads` generator has ended
 *
 * // third
 * ```
 *
 * @param factory - A function that returns the generator to run.
 * @param callback - Called whenever threads are created, canceled or finished.
 *                   Used for debugging purposes.
 */
export function* threads(factory, callback) {
    const playback = usePlayback();
    const root = factory();
    setTaskName(root, 'root');
    const rootThread = new Thread(root);
    callback?.(rootThread);
    let threads = [rootThread];
    while (threads.length > 0) {
        const newThreads = [];
        const queue = [...threads];
        const dt = playback.framesToSeconds(1) * playback.speed;
        while (queue.length > 0) {
            const thread = queue.pop();
            if (!thread || thread.canceled) {
                continue;
            }
            const result = thread.next();
            if (result.done) {
                thread.cancel();
                continue;
            }
            if (isThreadGenerator(result.value)) {
                const child = new Thread(result.value);
                thread.value = result.value;
                thread.add(child);
                queue.push(thread);
                queue.push(child);
            }
            else if (result.value) {
                thread.value = yield result.value;
                queue.push(thread);
            }
            else {
                thread.update(dt);
                newThreads.unshift(thread);
            }
        }
        threads = newThreads.filter(thread => !thread.canceled);
        if (threads.length > 0)
            yield;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGhyZWFkcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90aHJlYWRpbmcvdGhyZWFkcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUMsUUFBUSxFQUFFLFVBQVUsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUNuRCxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sVUFBVSxDQUFDO0FBQ3JDLE9BQU8sRUFBQyxNQUFNLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFDaEMsT0FBTyxFQUFrQixpQkFBaUIsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQ3JFLE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSxTQUFTLENBQUM7QUFFcEM7Ozs7OztHQU1HO0FBQ0gsTUFBTSxVQUFVLFNBQVMsQ0FBQyxLQUFVO0lBQ2xDLE9BQU8sT0FBTyxLQUFLLEVBQUUsSUFBSSxLQUFLLFVBQVUsQ0FBQztBQUMzQyxDQUFDO0FBYUQsUUFBUSxDQUFDLE9BQU8sRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDO0FBQ2hDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0F3Qkc7QUFDSCxNQUFNLFNBQVMsQ0FBQyxDQUFDLE9BQU8sQ0FDdEIsT0FBdUIsRUFDdkIsUUFBMEI7SUFFMUIsTUFBTSxRQUFRLEdBQUcsV0FBVyxFQUFFLENBQUM7SUFDL0IsTUFBTSxJQUFJLEdBQUcsT0FBTyxFQUFFLENBQUM7SUFDdkIsV0FBVyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztJQUMxQixNQUFNLFVBQVUsR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNwQyxRQUFRLEVBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUV2QixJQUFJLE9BQU8sR0FBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ3JDLE9BQU8sT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7UUFDekIsTUFBTSxVQUFVLEdBQUcsRUFBVyxDQUFDO1FBQy9CLE1BQU0sS0FBSyxHQUFHLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQztRQUMzQixNQUFNLEVBQUUsR0FBRyxRQUFRLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUM7UUFFeEQsT0FBTyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUN2QixNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDM0IsSUFBSSxDQUFDLE1BQU0sSUFBSSxNQUFNLENBQUMsUUFBUSxFQUFFO2dCQUM5QixTQUFTO2FBQ1Y7WUFFRCxNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDN0IsSUFBSSxNQUFNLENBQUMsSUFBSSxFQUFFO2dCQUNmLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDaEIsU0FBUzthQUNWO1lBRUQsSUFBSSxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQ25DLE1BQU0sS0FBSyxHQUFHLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDdkMsTUFBTSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDO2dCQUM1QixNQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUVsQixLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUNuQixLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQ25CO2lCQUFNLElBQUksTUFBTSxDQUFDLEtBQUssRUFBRTtnQkFDdkIsTUFBTSxDQUFDLEtBQUssR0FBRyxNQUFNLE1BQU0sQ0FBQyxLQUFLLENBQUM7Z0JBQ2xDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDcEI7aUJBQU07Z0JBQ0wsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDbEIsVUFBVSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQzthQUM1QjtTQUNGO1FBRUQsT0FBTyxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN4RCxJQUFJLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQztZQUFFLEtBQUssQ0FBQztLQUMvQjtBQUNILENBQUMifQ==