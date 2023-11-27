import { addInitializer } from './initializers';
import { createComputed } from '@motion-canvas/core/lib/signals';
/**
 * Create a computed method decorator.
 *
 * @remarks
 * This decorator turns the given method into a computed value.
 * See {@link createComputed} for more information.
 */
export function computed() {
    return (target, key) => {
        addInitializer(target, (instance) => {
            const method = Object.getPrototypeOf(instance)[key];
            instance[key] = createComputed(method.bind(instance), instance);
        });
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcHV0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZGVjb3JhdG9ycy9jb21wdXRlZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDOUMsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLGlDQUFpQyxDQUFDO0FBRS9EOzs7Ozs7R0FNRztBQUNILE1BQU0sVUFBVSxRQUFRO0lBQ3RCLE9BQU8sQ0FBQyxNQUFXLEVBQUUsR0FBRyxFQUFFLEVBQUU7UUFDMUIsY0FBYyxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQWEsRUFBRSxFQUFFO1lBQ3ZDLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDcEQsUUFBUSxDQUFDLEdBQUcsQ0FBQyxHQUFHLGNBQWMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ2xFLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQyxDQUFDO0FBQ0osQ0FBQyJ9