import { decorate, threadable } from '../decorators';
decorate(loop, threadable());
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
export function* loop(iterations, factory) {
    for (let i = 0; i < iterations; i++) {
        const generator = factory(i);
        if (generator) {
            yield* generator;
        }
        else {
            yield;
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9vcC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9mbG93L2xvb3AudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFDLFFBQVEsRUFBRSxVQUFVLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFhbkQsUUFBUSxDQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDO0FBQzdCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBeUJHO0FBQ0gsTUFBTSxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQ25CLFVBQWtCLEVBQ2xCLE9BQXFCO0lBRXJCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxVQUFVLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDbkMsTUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzdCLElBQUksU0FBUyxFQUFFO1lBQ2IsS0FBSyxDQUFDLENBQUMsU0FBUyxDQUFDO1NBQ2xCO2FBQU07WUFDTCxLQUFLLENBQUM7U0FDUDtLQUNGO0FBQ0gsQ0FBQyJ9