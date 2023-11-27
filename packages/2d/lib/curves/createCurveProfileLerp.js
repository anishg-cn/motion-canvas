import { Vector2 } from '@motion-canvas/core/lib/types';
import { LineSegment } from './LineSegment';
import { getPointAtDistance } from './getPointAtDistance';
import { getPolylineProfile } from './getPolylineProfile';
/**
 * Split segments of polygon until distance between adjacent point is less than or equal maxLength. This function mutate original points.
 * @param points - Polygon points
 * @param maxLength - max distance between two point
 */
function bisect(points, maxLength) {
    for (let i = 0; i < points.length - 1; i++) {
        const a = points[i];
        let b = points[i + 1];
        while (a.sub(b).magnitude > maxLength) {
            b = Vector2.lerp(a, b, 0.5);
            points.splice(i + 1, 0, b);
        }
    }
}
/**
 * Convert curve which only contain LineSegment into polygon.
 * @param curve - curve to convert. curve must contain 1 subpath
 * @param maxLength - max distance between two point
 * @returns - null if curve contain segment other than LineSegment
 */
function exactPolygonPoints(curve, maxLength) {
    const points = [];
    let endPoint = null;
    for (const segment of curve.segments) {
        if (!(segment instanceof LineSegment))
            return null;
        points.push(segment.from);
        endPoint = segment.to;
    }
    if (endPoint)
        points.push(endPoint);
    if (!Number.isNaN(maxLength) && maxLength > 0) {
        bisect(points, maxLength);
    }
    return points;
}
/**
 * Calculate area of polygon
 * @param points - polygon points
 * @returns - area of polygon
 */
function polygonArea(points) {
    return (points.reduce((area, a, i) => {
        const b = points[(i + 1) % points.length];
        return area + (a.y * b.x - a.x * b.y);
    }, 0) / 2);
}
/**
 * Convert curve into polygon by sampling curve profile
 * @param curve - curve to convert. curve must contain only 1 subpath
 * @param maxLength - max distance between point
 * @returns - always return polygon points
 */
function approximatePolygonPoints(curve, maxLength) {
    const points = [];
    let numPoints = 3;
    if (!Number.isNaN(maxLength) && maxLength > 0) {
        numPoints = Math.max(numPoints, Math.ceil(curve.arcLength / maxLength));
    }
    for (let i = 0; i < numPoints; i += 1) {
        const point = getPointAtDistance(curve, curve.arcLength * (i / (numPoints - 1)));
        points.push(point.position);
    }
    if (polygonArea(points) > 0)
        points.reverse();
    return points;
}
/**
 * Split curve into subpaths
 * @param curve - curve to split
 * @returns - subpaths of curve
 */
function splitCurve(curve) {
    if (curve.segments.length === 0)
        return [];
    let current = {
        arcLength: 0,
        minSin: 0,
        segments: [],
        closed: false,
    };
    let endPoint = null;
    const composite = [current];
    for (const segment of curve.segments) {
        const start = segment.getPoint(0).position;
        if (endPoint && !start.equals(endPoint)) {
            current = {
                arcLength: 0,
                minSin: 0,
                segments: [],
                closed: false,
            };
            composite.push(current);
        }
        current.segments.push(segment);
        current.arcLength += segment.arcLength;
        endPoint = segment.getPoint(1).position;
    }
    for (const sub of composite) {
        sub.closed = sub.segments[0]
            .getPoint(0)
            .position.equals(sub.segments[sub.segments.length - 1].getPoint(1).position);
    }
    return composite;
}
/**
 * Convert curve into polygon use best possible method
 * @param curve - curve to convert
 * @param maxLength - max distance between two point
 * @returns - polgon points
 */
function subcurveToPolygon(curve, maxLength) {
    const points = exactPolygonPoints(curve, maxLength) ||
        approximatePolygonPoints(curve, maxLength);
    return {
        points: [...points],
        closed: curve.closed,
    };
}
/**
 * Calculate polygon perimeter
 * @param points - polygon points
 * @returns - perimeter of polygon
 */
function polygonLength(points) {
    return points.reduce((length, point, i) => {
        if (i)
            return length + points[i - 1].sub(point).magnitude;
        return 0;
    }, 0);
}
/**s
 * Sample additional points for polygon to better match its pair. This will mutate original points.
 * @param points - polygon points
 * @param numPoints - number of points to be added
 */
function addPoints(points, numPoints) {
    const desiredLength = points.length + numPoints;
    const step = polygonLength(points) / numPoints;
    let i = 0;
    let cursor = 0;
    let insertAt = step / 2;
    while (points.length < desiredLength) {
        const a = points[i];
        const b = points[(i + 1) % points.length];
        const length = a.sub(b).magnitude;
        if (insertAt <= cursor + length) {
            points.splice(i + 1, 0, length
                ? Vector2.lerp(a, b, (insertAt - cursor) / length)
                : new Vector2(a));
            insertAt += step;
        }
        else {
            cursor += length;
            i += 1;
        }
    }
}
/**
 * Calculate total moving point distance when morphing between polygon points
 * @param points - first polygon points
 * @param reference - second polygon points
 * @param offset - offset for first polygon points
 * @returns
 */
function calculateLerpDistance(points, reference, offset) {
    const len = points.length;
    let sumOfSquares = 0;
    for (let i = 0; i < reference.length; i += 1) {
        const a = points[(offset + i) % len];
        const b = reference[i];
        sumOfSquares += a.sub(b).squaredMagnitude;
    }
    return sumOfSquares;
}
/**
 * Rotate polygon in order to minimize moving points.
 * @param polygon - polygon to be rotated
 * @param reference - polygon to be reference
 */
function rotatePolygon(polygon, reference) {
    const { points, closed } = polygon;
    const len = points.length;
    if (!closed) {
        const originalDistance = calculateLerpDistance(points, reference.points, 0);
        const reversedPoints = [...points].reverse();
        const reversedDistance = calculateLerpDistance(reversedPoints, reference.points, 0);
        if (reversedDistance < originalDistance)
            polygon.points = reversedPoints;
    }
    else {
        let minDistance = Infinity;
        let bestOffset = 0;
        const last = points.pop();
        // Closed polygon first point must equal last point
        // When we rotate polygon, first point is changed which mean last point also must changed
        // When we remove last point, calculateLerpDistance will assume last point is equal first point
        // Proof:
        // len = points.length = reference.length - 1
        // When i = 0:
        // (offset + i) % len = offset % len
        // When i = reference.length - 1 or i = len
        // (offset + i) % len = (offset + len) % len = offset % len
        for (let offset = 0; offset < len; offset += 1) {
            const distance = calculateLerpDistance(points, reference.points, offset);
            if (distance < minDistance) {
                minDistance = distance;
                bestOffset = offset;
            }
        }
        if (last)
            points.push(last);
        if (bestOffset) {
            points.pop();
            const spliced = points.splice(0, bestOffset);
            points.splice(points.length, 0, ...spliced);
            points.push(points[0]);
        }
    }
}
/**
 * Round polygon's points coordinate to a specified amount of decimal
 * @param points - polygon point to be rounded
 * @param round - amount of decimal
 * @returns - new polygon point
 */
function roundPolygon({ points, ...rest }, round) {
    const pow = round >= 1 ? 10 ** round : 1;
    return {
        points: points.map(point => {
            const [x, y] = [point.x, point.y].map(n => Math.round(n * pow) / pow);
            return new Vector2(x, y);
        }),
        ...rest,
    };
}
/**
 * Create two polygon to tween between sub curve/path
 * @param from - source curve
 * @param to - targe curve
 * @param precision - desired distance between two point
 * @param round - amount of decimal when rounding
 * @returns two polygon ready to tween
 */
function getSubcurveInterpolationPolygon(from, to, precision, round) {
    const morphPrecision = precision;
    const fromRing = subcurveToPolygon(from, morphPrecision);
    const toRing = subcurveToPolygon(to, morphPrecision);
    const diff = fromRing.points.length - toRing.points.length;
    addPoints(fromRing.points, diff < 0 ? diff * -1 : 0);
    addPoints(toRing.points, diff > 0 ? diff : 0);
    if (!from.closed && to.closed)
        rotatePolygon(toRing, fromRing);
    else
        rotatePolygon(fromRing, toRing);
    return {
        from: roundPolygon(fromRing, round),
        to: roundPolygon(toRing, round),
    };
}
/**
 * Make two sub curve list have equal length
 * @param subcurves - List to add
 * @param reference - Reference list
 */
function balanceSubcurves(subcurves, reference) {
    for (let i = subcurves.length; i < reference.length; i++) {
        const point = reference[i].segments[0].getPoint(0).position;
        subcurves.push({
            arcLength: 0,
            closed: false,
            minSin: 0,
            segments: [new LineSegment(point, point)],
        });
    }
}
/**
 * Create two polygon to tween between curve
 * @param from - source curve
 * @param to - targe curve
 * @param precision - desired distance between two point
 * @param round - amount of decimal when rounding
 * @returns list that contain list of polygon before and after tween
 */
function getInterpolationPolygon(from, to, precision, round) {
    const fromSub = splitCurve(from);
    const toSub = splitCurve(to);
    if (fromSub.length < toSub.length)
        balanceSubcurves(fromSub, toSub);
    else
        balanceSubcurves(toSub, fromSub);
    return fromSub.map((sub, i) => getSubcurveInterpolationPolygon(sub, toSub[i], precision, round));
}
/**
 * Add curve into another curve
 * @param target - target curve
 * @param source - curve to add
 */
function addCurveToCurve(target, source) {
    const { segments, arcLength, minSin } = source;
    target.segments.push(...segments);
    target.arcLength += arcLength;
    target.minSin = Math.min(target.minSin, minSin);
}
/**
 * Interpolate between two polygon points.
 * @param from - source polygon points
 * @param to - target polygon points
 * @param value - interpolation progress
 * @returns - new polygon points
 */
function polygonPointsLerp(from, to, value) {
    const points = [];
    if (value === 0)
        return [...from];
    if (value === 1)
        return [...to];
    for (let i = 0; i < from.length; i++) {
        const a = from[i];
        const b = to[i];
        points.push(Vector2.lerp(a, b, value));
    }
    return points;
}
/**
 * Create interpolator to tween between two curve
 * @param a - source curve
 * @param b - target curve
 * @returns - curve interpolator
 */
export function createCurveProfileLerp(a, b) {
    const interpolations = getInterpolationPolygon(a, b, 5, 4);
    return (progress) => {
        const curve = {
            segments: [],
            arcLength: 0,
            minSin: 1,
        };
        for (const { from, to } of interpolations) {
            const points = polygonPointsLerp(from.points, to.points, progress);
            addCurveToCurve(curve, getPolylineProfile(points, 0, false));
        }
        return curve;
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlQ3VydmVQcm9maWxlTGVycC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jdXJ2ZXMvY3JlYXRlQ3VydmVQcm9maWxlTGVycC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sK0JBQStCLENBQUM7QUFFdEQsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUMxQyxPQUFPLEVBQUMsa0JBQWtCLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQUN4RCxPQUFPLEVBQUMsa0JBQWtCLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQWdCeEQ7Ozs7R0FJRztBQUVILFNBQVMsTUFBTSxDQUFDLE1BQWlCLEVBQUUsU0FBaUI7SUFDbEQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQzFDLE1BQU0sQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNwQixJQUFJLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3RCLE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLEdBQUcsU0FBUyxFQUFFO1lBQ3JDLENBQUMsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDNUIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztTQUM1QjtLQUNGO0FBQ0gsQ0FBQztBQUVEOzs7OztHQUtHO0FBRUgsU0FBUyxrQkFBa0IsQ0FDekIsS0FBc0IsRUFDdEIsU0FBaUI7SUFFakIsTUFBTSxNQUFNLEdBQWMsRUFBRSxDQUFDO0lBRTdCLElBQUksUUFBUSxHQUFtQixJQUFJLENBQUM7SUFDcEMsS0FBSyxNQUFNLE9BQU8sSUFBSSxLQUFLLENBQUMsUUFBUSxFQUFFO1FBQ3BDLElBQUksQ0FBQyxDQUFDLE9BQU8sWUFBWSxXQUFXLENBQUM7WUFBRSxPQUFPLElBQUksQ0FBQztRQUVuRCxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUUxQixRQUFRLEdBQUcsT0FBTyxDQUFDLEVBQUUsQ0FBQztLQUN2QjtJQUVELElBQUksUUFBUTtRQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7SUFFcEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLElBQUksU0FBUyxHQUFHLENBQUMsRUFBRTtRQUM3QyxNQUFNLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0tBQzNCO0lBRUQsT0FBTyxNQUFNLENBQUM7QUFDaEIsQ0FBQztBQUVEOzs7O0dBSUc7QUFFSCxTQUFTLFdBQVcsQ0FBQyxNQUFpQjtJQUNwQyxPQUFPLENBQ0wsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDM0IsTUFBTSxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMxQyxPQUFPLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN4QyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUNWLENBQUM7QUFDSixDQUFDO0FBRUQ7Ozs7O0dBS0c7QUFFSCxTQUFTLHdCQUF3QixDQUMvQixLQUFzQixFQUN0QixTQUFpQjtJQUVqQixNQUFNLE1BQU0sR0FBYyxFQUFFLENBQUM7SUFFN0IsSUFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFDO0lBQ2xCLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxJQUFJLFNBQVMsR0FBRyxDQUFDLEVBQUU7UUFDN0MsU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDO0tBQ3pFO0lBRUQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFO1FBQ3JDLE1BQU0sS0FBSyxHQUFHLGtCQUFrQixDQUM5QixLQUFLLEVBQ0wsS0FBSyxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUN4QyxDQUFDO1FBQ0YsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDN0I7SUFFRCxJQUFJLFdBQVcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDO1FBQUUsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBRTlDLE9BQU8sTUFBTSxDQUFDO0FBQ2hCLENBQUM7QUFFRDs7OztHQUlHO0FBRUgsU0FBUyxVQUFVLENBQUMsS0FBbUI7SUFDckMsSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLE1BQU0sS0FBSyxDQUFDO1FBQUUsT0FBTyxFQUFFLENBQUM7SUFFM0MsSUFBSSxPQUFPLEdBQW9CO1FBQzdCLFNBQVMsRUFBRSxDQUFDO1FBQ1osTUFBTSxFQUFFLENBQUM7UUFDVCxRQUFRLEVBQUUsRUFBRTtRQUNaLE1BQU0sRUFBRSxLQUFLO0tBQ2QsQ0FBQztJQUVGLElBQUksUUFBUSxHQUFtQixJQUFJLENBQUM7SUFFcEMsTUFBTSxTQUFTLEdBQXNCLENBQUMsT0FBTyxDQUFDLENBQUM7SUFFL0MsS0FBSyxNQUFNLE9BQU8sSUFBSSxLQUFLLENBQUMsUUFBUSxFQUFFO1FBQ3BDLE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDO1FBRTNDLElBQUksUUFBUSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRTtZQUN2QyxPQUFPLEdBQUc7Z0JBQ1IsU0FBUyxFQUFFLENBQUM7Z0JBQ1osTUFBTSxFQUFFLENBQUM7Z0JBQ1QsUUFBUSxFQUFFLEVBQUU7Z0JBQ1osTUFBTSxFQUFFLEtBQUs7YUFDZCxDQUFDO1lBQ0YsU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUN6QjtRQUVELE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQy9CLE9BQU8sQ0FBQyxTQUFTLElBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQztRQUN2QyxRQUFRLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUM7S0FDekM7SUFFRCxLQUFLLE1BQU0sR0FBRyxJQUFJLFNBQVMsRUFBRTtRQUMzQixHQUFHLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2FBQ3pCLFFBQVEsQ0FBQyxDQUFDLENBQUM7YUFDWCxRQUFRLENBQUMsTUFBTSxDQUNkLEdBQUcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FDM0QsQ0FBQztLQUNMO0lBRUQsT0FBTyxTQUFTLENBQUM7QUFDbkIsQ0FBQztBQUVEOzs7OztHQUtHO0FBRUgsU0FBUyxpQkFBaUIsQ0FDeEIsS0FBc0IsRUFDdEIsU0FBaUI7SUFFakIsTUFBTSxNQUFNLEdBQ1Ysa0JBQWtCLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQztRQUNwQyx3QkFBd0IsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDN0MsT0FBTztRQUNMLE1BQU0sRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDO1FBQ25CLE1BQU0sRUFBRSxLQUFLLENBQUMsTUFBTTtLQUNyQixDQUFDO0FBQ0osQ0FBQztBQUVEOzs7O0dBSUc7QUFFSCxTQUFTLGFBQWEsQ0FBQyxNQUFpQjtJQUN0QyxPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQ3hDLElBQUksQ0FBQztZQUFFLE9BQU8sTUFBTSxHQUFHLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUMxRCxPQUFPLENBQUMsQ0FBQztJQUNYLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUNSLENBQUM7QUFFRDs7OztHQUlHO0FBRUgsU0FBUyxTQUFTLENBQUMsTUFBaUIsRUFBRSxTQUFpQjtJQUNyRCxNQUFNLGFBQWEsR0FBRyxNQUFNLENBQUMsTUFBTSxHQUFHLFNBQVMsQ0FBQztJQUNoRCxNQUFNLElBQUksR0FBRyxhQUFhLENBQUMsTUFBTSxDQUFDLEdBQUcsU0FBUyxDQUFDO0lBRS9DLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNWLElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQztJQUNmLElBQUksUUFBUSxHQUFHLElBQUksR0FBRyxDQUFDLENBQUM7SUFFeEIsT0FBTyxNQUFNLENBQUMsTUFBTSxHQUFHLGFBQWEsRUFBRTtRQUNwQyxNQUFNLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDcEIsTUFBTSxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMxQyxNQUFNLE1BQU0sR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUVsQyxJQUFJLFFBQVEsSUFBSSxNQUFNLEdBQUcsTUFBTSxFQUFFO1lBQy9CLE1BQU0sQ0FBQyxNQUFNLENBQ1gsQ0FBQyxHQUFHLENBQUMsRUFDTCxDQUFDLEVBQ0QsTUFBTTtnQkFDSixDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsUUFBUSxHQUFHLE1BQU0sQ0FBQyxHQUFHLE1BQU0sQ0FBQztnQkFDbEQsQ0FBQyxDQUFDLElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUNuQixDQUFDO1lBQ0YsUUFBUSxJQUFJLElBQUksQ0FBQztTQUNsQjthQUFNO1lBQ0wsTUFBTSxJQUFJLE1BQU0sQ0FBQztZQUNqQixDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ1I7S0FDRjtBQUNILENBQUM7QUFFRDs7Ozs7O0dBTUc7QUFFSCxTQUFTLHFCQUFxQixDQUM1QixNQUFpQixFQUNqQixTQUFvQixFQUNwQixNQUFjO0lBRWQsTUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztJQUMxQixJQUFJLFlBQVksR0FBRyxDQUFDLENBQUM7SUFFckIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRTtRQUM1QyxNQUFNLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUM7UUFDckMsTUFBTSxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3ZCLFlBQVksSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDO0tBQzNDO0lBRUQsT0FBTyxZQUFZLENBQUM7QUFDdEIsQ0FBQztBQUVEOzs7O0dBSUc7QUFFSCxTQUFTLGFBQWEsQ0FBQyxPQUF1QixFQUFFLFNBQXlCO0lBQ3ZFLE1BQU0sRUFBQyxNQUFNLEVBQUUsTUFBTSxFQUFDLEdBQUcsT0FBTyxDQUFDO0lBQ2pDLE1BQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7SUFFMUIsSUFBSSxDQUFDLE1BQU0sRUFBRTtRQUNYLE1BQU0sZ0JBQWdCLEdBQUcscUJBQXFCLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDNUUsTUFBTSxjQUFjLEdBQUcsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQzdDLE1BQU0sZ0JBQWdCLEdBQUcscUJBQXFCLENBQzVDLGNBQWMsRUFDZCxTQUFTLENBQUMsTUFBTSxFQUNoQixDQUFDLENBQ0YsQ0FBQztRQUNGLElBQUksZ0JBQWdCLEdBQUcsZ0JBQWdCO1lBQUUsT0FBTyxDQUFDLE1BQU0sR0FBRyxjQUFjLENBQUM7S0FDMUU7U0FBTTtRQUNMLElBQUksV0FBVyxHQUFHLFFBQVEsQ0FBQztRQUMzQixJQUFJLFVBQVUsR0FBRyxDQUFDLENBQUM7UUFDbkIsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBRTFCLG1EQUFtRDtRQUNuRCx5RkFBeUY7UUFDekYsK0ZBQStGO1FBQy9GLFNBQVM7UUFDVCw2Q0FBNkM7UUFDN0MsY0FBYztRQUNkLG9DQUFvQztRQUNwQywyQ0FBMkM7UUFDM0MsMkRBQTJEO1FBRTNELEtBQUssSUFBSSxNQUFNLEdBQUcsQ0FBQyxFQUFFLE1BQU0sR0FBRyxHQUFHLEVBQUUsTUFBTSxJQUFJLENBQUMsRUFBRTtZQUM5QyxNQUFNLFFBQVEsR0FBRyxxQkFBcUIsQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztZQUN6RSxJQUFJLFFBQVEsR0FBRyxXQUFXLEVBQUU7Z0JBQzFCLFdBQVcsR0FBRyxRQUFRLENBQUM7Z0JBQ3ZCLFVBQVUsR0FBRyxNQUFNLENBQUM7YUFDckI7U0FDRjtRQUVELElBQUksSUFBSTtZQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFNUIsSUFBSSxVQUFVLEVBQUU7WUFDZCxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDYixNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUM3QyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEdBQUcsT0FBTyxDQUFDLENBQUM7WUFDNUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUN4QjtLQUNGO0FBQ0gsQ0FBQztBQUVEOzs7OztHQUtHO0FBRUgsU0FBUyxZQUFZLENBQ25CLEVBQUMsTUFBTSxFQUFFLEdBQUcsSUFBSSxFQUFpQixFQUNqQyxLQUFhO0lBRWIsTUFBTSxHQUFHLEdBQUcsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3pDLE9BQU87UUFDTCxNQUFNLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUN6QixNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUM7WUFDdEUsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDM0IsQ0FBQyxDQUFDO1FBQ0YsR0FBRyxJQUFJO0tBQ1IsQ0FBQztBQUNKLENBQUM7QUFFRDs7Ozs7OztHQU9HO0FBRUgsU0FBUywrQkFBK0IsQ0FDdEMsSUFBcUIsRUFDckIsRUFBbUIsRUFDbkIsU0FBaUIsRUFDakIsS0FBYTtJQUViLE1BQU0sY0FBYyxHQUFHLFNBQVMsQ0FBQztJQUNqQyxNQUFNLFFBQVEsR0FBRyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsY0FBYyxDQUFDLENBQUM7SUFDekQsTUFBTSxNQUFNLEdBQUcsaUJBQWlCLENBQUMsRUFBRSxFQUFFLGNBQWMsQ0FBQyxDQUFDO0lBRXJELE1BQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO0lBRTNELFNBQVMsQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDckQsU0FBUyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUU5QyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sSUFBSSxFQUFFLENBQUMsTUFBTTtRQUFFLGFBQWEsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7O1FBQzFELGFBQWEsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFFckMsT0FBTztRQUNMLElBQUksRUFBRSxZQUFZLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQztRQUNuQyxFQUFFLEVBQUUsWUFBWSxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUM7S0FDaEMsQ0FBQztBQUNKLENBQUM7QUFFRDs7OztHQUlHO0FBRUgsU0FBUyxnQkFBZ0IsQ0FDdkIsU0FBNEIsRUFDNUIsU0FBNEI7SUFFNUIsS0FBSyxJQUFJLENBQUMsR0FBRyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQ3hELE1BQU0sS0FBSyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQztRQUM1RCxTQUFTLENBQUMsSUFBSSxDQUFDO1lBQ2IsU0FBUyxFQUFFLENBQUM7WUFDWixNQUFNLEVBQUUsS0FBSztZQUNiLE1BQU0sRUFBRSxDQUFDO1lBQ1QsUUFBUSxFQUFFLENBQUMsSUFBSSxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1NBQzFDLENBQUMsQ0FBQztLQUNKO0FBQ0gsQ0FBQztBQUVEOzs7Ozs7O0dBT0c7QUFFSCxTQUFTLHVCQUF1QixDQUM5QixJQUFrQixFQUNsQixFQUFnQixFQUNoQixTQUFpQixFQUNqQixLQUFhO0lBRWIsTUFBTSxPQUFPLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2pDLE1BQU0sS0FBSyxHQUFHLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUU3QixJQUFJLE9BQU8sQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLE1BQU07UUFBRSxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7O1FBQy9ELGdCQUFnQixDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQztJQUV0QyxPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FDNUIsK0JBQStCLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQ2pFLENBQUM7QUFDSixDQUFDO0FBRUQ7Ozs7R0FJRztBQUVILFNBQVMsZUFBZSxDQUFDLE1BQW9CLEVBQUUsTUFBb0I7SUFDakUsTUFBTSxFQUFDLFFBQVEsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFDLEdBQUcsTUFBTSxDQUFDO0lBQzdDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUM7SUFDbEMsTUFBTSxDQUFDLFNBQVMsSUFBSSxTQUFTLENBQUM7SUFDOUIsTUFBTSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDbEQsQ0FBQztBQUVEOzs7Ozs7R0FNRztBQUVILFNBQVMsaUJBQWlCLENBQ3hCLElBQWUsRUFDZixFQUFhLEVBQ2IsS0FBYTtJQUViLE1BQU0sTUFBTSxHQUFjLEVBQUUsQ0FBQztJQUM3QixJQUFJLEtBQUssS0FBSyxDQUFDO1FBQUUsT0FBTyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDbEMsSUFBSSxLQUFLLEtBQUssQ0FBQztRQUFFLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO0lBRWhDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQ3BDLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNsQixNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDaEIsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztLQUN4QztJQUNELE9BQU8sTUFBTSxDQUFDO0FBQ2hCLENBQUM7QUFFRDs7Ozs7R0FLRztBQUVILE1BQU0sVUFBVSxzQkFBc0IsQ0FBQyxDQUFlLEVBQUUsQ0FBZTtJQUNyRSxNQUFNLGNBQWMsR0FBRyx1QkFBdUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUUzRCxPQUFPLENBQUMsUUFBZ0IsRUFBRSxFQUFFO1FBQzFCLE1BQU0sS0FBSyxHQUFpQjtZQUMxQixRQUFRLEVBQUUsRUFBRTtZQUNaLFNBQVMsRUFBRSxDQUFDO1lBQ1osTUFBTSxFQUFFLENBQUM7U0FDVixDQUFDO1FBQ0YsS0FBSyxNQUFNLEVBQUMsSUFBSSxFQUFFLEVBQUUsRUFBQyxJQUFJLGNBQWMsRUFBRTtZQUN2QyxNQUFNLE1BQU0sR0FBRyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDbkUsZUFBZSxDQUFDLEtBQUssRUFBRSxrQkFBa0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7U0FDOUQ7UUFDRCxPQUFPLEtBQUssQ0FBQztJQUNmLENBQUMsQ0FBQztBQUNKLENBQUMifQ==