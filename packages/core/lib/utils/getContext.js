import { Canvas } from 'skia-canvas';
export function getContext(
// eslint-disable-next-line @typescript-eslint/naming-convention
options, canvas = new Canvas()) {
    // FIXME: add support for `options` in `getContext()`
    // const context = canvas.getContext('2d', options);
    const context = canvas.getContext('2d');
    if (!context) {
        throw new Error('Could not create a 2D context.');
    }
    return context;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0Q29udGV4dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9nZXRDb250ZXh0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBQyxNQUFNLEVBQTJCLE1BQU0sYUFBYSxDQUFDO0FBRTdELE1BQU0sVUFBVSxVQUFVO0FBQ3hCLGdFQUFnRTtBQUNoRSxPQUEwQyxFQUMxQyxTQUFpQixJQUFJLE1BQU0sRUFBRTtJQUU3QixxREFBcUQ7SUFDckQsb0RBQW9EO0lBQ3BELE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDeEMsSUFBSSxDQUFDLE9BQU8sRUFBRTtRQUNaLE1BQU0sSUFBSSxLQUFLLENBQUMsZ0NBQWdDLENBQUMsQ0FBQztLQUNuRDtJQUNELE9BQU8sT0FBTyxDQUFDO0FBQ2pCLENBQUMifQ==