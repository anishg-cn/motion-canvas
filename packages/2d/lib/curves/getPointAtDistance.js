import { clamp } from '@motion-canvas/core/lib/tweening';
import { Vector2 } from '@motion-canvas/core/lib/types';
export function getPointAtDistance(profile, distance) {
    const clamped = clamp(0, profile.arcLength, distance);
    let length = 0;
    for (const segment of profile.segments) {
        const previousLength = length;
        length += segment.arcLength;
        if (length >= clamped) {
            const relative = (clamped - previousLength) / segment.arcLength;
            return segment.getPoint(clamp(0, 1, relative));
        }
    }
    return { position: Vector2.zero, tangent: Vector2.up, normal: Vector2.up };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0UG9pbnRBdERpc3RhbmNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2N1cnZlcy9nZXRQb2ludEF0RGlzdGFuY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFDLEtBQUssRUFBQyxNQUFNLGtDQUFrQyxDQUFDO0FBQ3ZELE9BQU8sRUFBQyxPQUFPLEVBQUMsTUFBTSwrQkFBK0IsQ0FBQztBQUl0RCxNQUFNLFVBQVUsa0JBQWtCLENBQ2hDLE9BQXFCLEVBQ3JCLFFBQWdCO0lBRWhCLE1BQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUN0RCxJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUM7SUFDZixLQUFLLE1BQU0sT0FBTyxJQUFJLE9BQU8sQ0FBQyxRQUFRLEVBQUU7UUFDdEMsTUFBTSxjQUFjLEdBQUcsTUFBTSxDQUFDO1FBQzlCLE1BQU0sSUFBSSxPQUFPLENBQUMsU0FBUyxDQUFDO1FBQzVCLElBQUksTUFBTSxJQUFJLE9BQU8sRUFBRTtZQUNyQixNQUFNLFFBQVEsR0FBRyxDQUFDLE9BQU8sR0FBRyxjQUFjLENBQUMsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDO1lBQ2hFLE9BQU8sT0FBTyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO1NBQ2hEO0tBQ0Y7SUFFRCxPQUFPLEVBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBQyxFQUFFLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxFQUFFLEVBQUMsQ0FBQztBQUMzRSxDQUFDIn0=