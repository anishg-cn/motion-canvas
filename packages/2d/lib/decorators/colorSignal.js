import { Color } from '@motion-canvas/core/lib/types';
import { signal, wrapper } from './signal';
export function colorSignal() {
    return (target, key) => {
        signal()(target, key);
        wrapper(Color)(target, key);
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sb3JTaWduYWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZGVjb3JhdG9ycy9jb2xvclNpZ25hbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUMsS0FBSyxFQUFDLE1BQU0sK0JBQStCLENBQUM7QUFDcEQsT0FBTyxFQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFFekMsTUFBTSxVQUFVLFdBQVc7SUFDekIsT0FBTyxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsRUFBRTtRQUNyQixNQUFNLEVBQUUsQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDdEIsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztJQUM5QixDQUFDLENBQUM7QUFDSixDQUFDIn0=