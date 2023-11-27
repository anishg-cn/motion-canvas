import { createComputed } from './createComputed';
import { ComputedContext, createSignal, } from '../signals';
export function createComputedAsync(factory, initial = null) {
    let handle;
    const signal = createSignal(factory);
    return createComputed(() => {
        const promise = signal();
        if (!handle || handle.promise !== promise) {
            handle = ComputedContext.collectPromise(promise, handle?.value ?? initial);
        }
        return handle.value;
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlQ29tcHV0ZWRBc3luYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zaWduYWxzL2NyZWF0ZUNvbXB1dGVkQXN5bmMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBQ2hELE9BQU8sRUFFTCxlQUFlLEVBQ2YsWUFBWSxHQUViLE1BQU0sWUFBWSxDQUFDO0FBU3BCLE1BQU0sVUFBVSxtQkFBbUIsQ0FDakMsT0FBeUIsRUFDekIsVUFBb0IsSUFBSTtJQUV4QixJQUFJLE1BQStCLENBQUM7SUFDcEMsTUFBTSxNQUFNLEdBQUcsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3JDLE9BQU8sY0FBYyxDQUFDLEdBQUcsRUFBRTtRQUN6QixNQUFNLE9BQU8sR0FBRyxNQUFNLEVBQUUsQ0FBQztRQUN6QixJQUFJLENBQUMsTUFBTSxJQUFJLE1BQU0sQ0FBQyxPQUFPLEtBQUssT0FBTyxFQUFFO1lBQ3pDLE1BQU0sR0FBRyxlQUFlLENBQUMsY0FBYyxDQUNyQyxPQUFPLEVBQ1AsTUFBTSxFQUFFLEtBQUssSUFBSSxPQUFPLENBQ3pCLENBQUM7U0FDSDtRQUVELE9BQU8sTUFBTSxDQUFDLEtBQUssQ0FBQztJQUN0QixDQUFDLENBQUMsQ0FBQztBQUNMLENBQUMifQ==