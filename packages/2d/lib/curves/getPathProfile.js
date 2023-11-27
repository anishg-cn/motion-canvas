import { clamp } from '@motion-canvas/core/lib/tweening';
import { Vector2 } from '@motion-canvas/core/lib/types';
import { ArcSegment } from './ArcSegment';
import { CubicBezierSegment } from './CubicBezierSegment';
import { LineSegment } from './LineSegment';
import { QuadBezierSegment } from './QuadBezierSegment';
import parse from 'parse-svg-path';
function addSegmentToProfile(profile, segment) {
    profile.segments.push(segment);
    profile.arcLength += segment.arcLength;
}
function getArg(command, argumentIndex) {
    return command[argumentIndex + 1];
}
function getVector2(command, argumentIndex) {
    return new Vector2(command[argumentIndex + 1], command[argumentIndex + 2]);
}
function getPoint(command, argumentIndex, isRelative, currentPoint) {
    const point = getVector2(command, argumentIndex);
    return isRelative ? currentPoint.add(point) : point;
}
function reflectControlPoint(control, currentPoint) {
    return currentPoint.add(currentPoint.sub(control));
}
function updateMinSin(profile) {
    for (let i = 0; i < profile.segments.length; i++) {
        const segmentA = profile.segments[i];
        const segmentB = profile.segments[(i + 1) % profile.segments.length];
        // In cubic bezier this equal p2.sub(p3)
        const startVector = segmentA.getPoint(1).tangent.scale(-1);
        // In cubic bezier this equal p1.sub(p0)
        const endVector = segmentB.getPoint(0).tangent;
        const dot = startVector.dot(endVector);
        const angleBetween = Math.acos(clamp(-1, 1, dot));
        const angleSin = Math.sin(angleBetween / 2);
        profile.minSin = Math.min(profile.minSin, Math.abs(angleSin));
    }
}
export function getPathProfile(data) {
    const profile = {
        segments: [],
        arcLength: 0,
        minSin: 1,
    };
    const segments = parse(data);
    let currentPoint = new Vector2(0, 0);
    let firstPoint = null;
    for (const segment of segments) {
        const command = segment[0].toLowerCase();
        const isRelative = segment[0] === command;
        if (command === 'm') {
            currentPoint = getPoint(segment, 0, isRelative, currentPoint);
            firstPoint = currentPoint;
        }
        else if (command === 'l') {
            const nextPoint = getPoint(segment, 0, isRelative, currentPoint);
            addSegmentToProfile(profile, new LineSegment(currentPoint, nextPoint));
            currentPoint = nextPoint;
        }
        else if (command === 'h') {
            const x = getArg(segment, 0);
            const nextPoint = isRelative
                ? currentPoint.addX(x)
                : new Vector2(x, currentPoint.y);
            addSegmentToProfile(profile, new LineSegment(currentPoint, nextPoint));
            currentPoint = nextPoint;
        }
        else if (command === 'v') {
            const y = getArg(segment, 0);
            const nextPoint = isRelative
                ? currentPoint.addY(y)
                : new Vector2(currentPoint.x, y);
            addSegmentToProfile(profile, new LineSegment(currentPoint, nextPoint));
            currentPoint = nextPoint;
        }
        else if (command === 'q') {
            const controlPoint = getPoint(segment, 0, isRelative, currentPoint);
            const nextPoint = getPoint(segment, 2, isRelative, currentPoint);
            addSegmentToProfile(profile, new QuadBezierSegment(currentPoint, controlPoint, nextPoint));
            currentPoint = nextPoint;
        }
        else if (command === 't') {
            const lastSegment = profile.segments.at(-1);
            const controlPoint = lastSegment instanceof QuadBezierSegment
                ? reflectControlPoint(lastSegment.p1, currentPoint)
                : currentPoint;
            const nextPoint = getPoint(segment, 0, isRelative, currentPoint);
            addSegmentToProfile(profile, new QuadBezierSegment(currentPoint, controlPoint, nextPoint));
            currentPoint = nextPoint;
        }
        else if (command === 'c') {
            const startControlPoint = getPoint(segment, 0, isRelative, currentPoint);
            const endControlPoint = getPoint(segment, 2, isRelative, currentPoint);
            const nextPoint = getPoint(segment, 4, isRelative, currentPoint);
            addSegmentToProfile(profile, new CubicBezierSegment(currentPoint, startControlPoint, endControlPoint, nextPoint));
            currentPoint = nextPoint;
        }
        else if (command === 's') {
            const lastSegment = profile.segments.at(-1);
            const startControlPoint = lastSegment instanceof CubicBezierSegment
                ? reflectControlPoint(lastSegment.p2, currentPoint)
                : currentPoint;
            const endControlPoint = getPoint(segment, 0, isRelative, currentPoint);
            const nextPoint = getPoint(segment, 2, isRelative, currentPoint);
            addSegmentToProfile(profile, new CubicBezierSegment(currentPoint, startControlPoint, endControlPoint, nextPoint));
            currentPoint = nextPoint;
        }
        else if (command === 'a') {
            const radius = getVector2(segment, 0);
            const angle = getArg(segment, 2);
            const largeArcFlag = getArg(segment, 3);
            const sweepFlag = getArg(segment, 4);
            const nextPoint = getPoint(segment, 5, isRelative, currentPoint);
            addSegmentToProfile(profile, new ArcSegment(currentPoint, radius, angle, largeArcFlag, sweepFlag, nextPoint));
            currentPoint = nextPoint;
        }
        else if (command === 'z') {
            if (!firstPoint)
                continue;
            if (currentPoint.equals(firstPoint))
                continue;
            addSegmentToProfile(profile, new LineSegment(currentPoint, firstPoint));
            currentPoint = firstPoint;
        }
    }
    updateMinSin(profile);
    return profile;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0UGF0aFByb2ZpbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY3VydmVzL2dldFBhdGhQcm9maWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBQyxLQUFLLEVBQUMsTUFBTSxrQ0FBa0MsQ0FBQztBQUN2RCxPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sK0JBQStCLENBQUM7QUFDdEQsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLGNBQWMsQ0FBQztBQUN4QyxPQUFPLEVBQUMsa0JBQWtCLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQUV4RCxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQzFDLE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBRXRELE9BQU8sS0FBb0IsTUFBTSxnQkFBZ0IsQ0FBQztBQUVsRCxTQUFTLG1CQUFtQixDQUFDLE9BQXFCLEVBQUUsT0FBZ0I7SUFDbEUsT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDL0IsT0FBTyxDQUFDLFNBQVMsSUFBSSxPQUFPLENBQUMsU0FBUyxDQUFDO0FBQ3pDLENBQUM7QUFFRCxTQUFTLE1BQU0sQ0FBQyxPQUFvQixFQUFFLGFBQXFCO0lBQ3pELE9BQU8sT0FBTyxDQUFDLGFBQWEsR0FBRyxDQUFDLENBQVcsQ0FBQztBQUM5QyxDQUFDO0FBRUQsU0FBUyxVQUFVLENBQUMsT0FBb0IsRUFBRSxhQUFxQjtJQUM3RCxPQUFPLElBQUksT0FBTyxDQUNoQixPQUFPLENBQUMsYUFBYSxHQUFHLENBQUMsQ0FBVyxFQUNwQyxPQUFPLENBQUMsYUFBYSxHQUFHLENBQUMsQ0FBVyxDQUNyQyxDQUFDO0FBQ0osQ0FBQztBQUVELFNBQVMsUUFBUSxDQUNmLE9BQW9CLEVBQ3BCLGFBQXFCLEVBQ3JCLFVBQW1CLEVBQ25CLFlBQXFCO0lBRXJCLE1BQU0sS0FBSyxHQUFHLFVBQVUs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