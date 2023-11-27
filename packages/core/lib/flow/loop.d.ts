import { ThreadGenerator } from '../threading';
/**
 * A callback called by {@link loop} during each iteration.
 */
export interface LoopCallback {
    /**
     * @param i - The current iteration index.
     */
    (i: number): ThreadGenerator | void;
}
/**
 * Run the given generator N times.
 *
 * @remarks
 * Each iteration waits until the previous one is completed.
 *
 * @example
 * ```ts
 * const colors = [
 *   '#ff6470',
 *   '#ffc66d',
 *   '#68abdf',
 *   '#99c47a',
 * ];
 *
 * yield* loop(
 *   colors.length,
 *   i => rect.fill(colors[i], 2),
 * );
 * ```
 *
 * @param iterations - The number of iterations.
 * @param factory - A function creating the generator to run. Because generators
 *                  can't be reset, a new generator is created on each
 *                  iteration.
 */
export declare function loop(iterations: number, factory: LoopCallback): ThreadGenerator;
//# sourceMappingURL=loop.d.ts.map