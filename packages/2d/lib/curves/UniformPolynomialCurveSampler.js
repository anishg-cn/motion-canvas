import { clamp, remap } from '@motion-canvas/core/lib/tweening';
/**
 * Class to uniformly sample points on a given polynomial curve.
 *
 * @remarks
 * In order to uniformly sample points from non-linear curves, this sampler
 * re-parameterizes the curve by arclength.
 */
export class UniformPolynomialCurveSampler {
    /**
     * @param curve - The curve to sample
     * @param samples - How many points to sample from the provided curve. The
     *                  more points get sampled, the higher the resolution–and
     *                  therefore precision–of the sampler.
     */
    constructor(curve, samples = 20) {
        this.curve = curve;
        this.sampledDistances = [];
        this.resample(samples);
    }
    /**
     * Discard all previously sampled points and resample the provided number of
     * points from the curve.
     *
     * @param samples - The number of points to sample.
     */
    resample(samples) {
        this.sampledDistances = [0];
        let length = 0;
        let previous = this.curve.eval(0).position;
        for (let i = 1; i < samples; i++) {
            const t = i / (samples - 1);
            const curvePoint = this.curve.eval(t);
            const segmentLength = previous.sub(curvePoint.position).magnitude;
            length += segmentLength;
            this.sampledDistances.push(length);
            previous = curvePoint.position;
        }
        // Account for any accumulated floating point errors and explicitly set the
        // distance of the last point to the arclength of the curve.
        this.sampledDistances[this.sampledDistances.length - 1] =
            this.curve.arcLength;
    }
    /**
     * Return the point at the provided distance along the sampled curve's
     * arclength.
     *
     * @param distance - The distance along the curve's arclength for which to
     *                   retrieve the point.
     */
    pointAtDistance(distance) {
        return this.curve.eval(this.distanceToT(distance));
    }
    /**
     * Return the t value for the point at the provided distance along the sampled
     * curve's arc length.
     *
     * @param distance - The distance along the arclength
     */
    distanceToT(distance) {
        const samples = this.sampledDistances.length;
        distance = clamp(0, this.curve.arcLength, distance);
        for (let i = 0; i < samples; i++) {
            const lower = this.sampledDistances[i];
            const upper = this.sampledDistances[i + 1];
            if (distance >= lower && distance <= upper) {
                return remap(lower, upper, i / (samples - 1), (i + 1) / (samples - 1), distance);
            }
        }
        return 1;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVW5pZm9ybVBvbHlub21pYWxDdXJ2ZVNhbXBsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY3VydmVzL1VuaWZvcm1Qb2x5bm9taWFsQ3VydmVTYW1wbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBQyxLQUFLLEVBQUUsS0FBSyxFQUFDLE1BQU0sa0NBQWtDLENBQUM7QUFLOUQ7Ozs7OztHQU1HO0FBQ0gsTUFBTSxPQUFPLDZCQUE2QjtJQUd4Qzs7Ozs7T0FLRztJQUNILFlBQW9DLEtBQXdCLEVBQUUsT0FBTyxHQUFHLEVBQUU7UUFBdEMsVUFBSyxHQUFMLEtBQUssQ0FBbUI7UUFScEQscUJBQWdCLEdBQWEsRUFBRSxDQUFDO1FBU3RDLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDekIsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0ksUUFBUSxDQUFDLE9BQWU7UUFDN0IsSUFBSSxDQUFDLGdCQUFnQixHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFNUIsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQ2YsSUFBSSxRQUFRLEdBQVksSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDO1FBQ3BELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxPQUFPLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDaEMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQzVCLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3RDLE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFNBQVMsQ0FBQztZQUVsRSxNQUFNLElBQUksYUFBYSxDQUFDO1lBRXhCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDbkMsUUFBUSxHQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUM7U0FDaEM7UUFFRCwyRUFBMkU7UUFDM0UsNERBQTREO1FBQzVELElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztZQUNyRCxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQztJQUN6QixDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0ksZUFBZSxDQUFDLFFBQWdCO1FBQ3JDLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBQ3JELENBQUM7SUFFRDs7Ozs7T0FLRztJQUNJLFdBQVcsQ0FBQyxRQUFnQjtRQUNqQyxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDO1FBQzdDLFFBQVEsR0FBRyxLQUFLLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBRXBELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxPQUFPLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDaEMsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3ZDLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDM0MsSUFBSSxRQUFRLElBQUksS0FBSyxJQUFJLFFBQVEsSUFBSSxLQUFLLEVBQUU7Z0JBQzFDLE9BQU8sS0FBSyxDQUNWLEtBQUssRUFDTCxLQUFLLEVBQ0wsQ0FBQyxHQUFHLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxFQUNqQixDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsRUFDdkIsUUFBUSxDQUNULENBQUM7YUFDSDtTQUNGO1FBRUQsT0FBTyxDQUFDLENBQUM7SUFDWCxDQUFDO0NBQ0YifQ==