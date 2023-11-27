import { arcLerp } from '../tweening';
import { clamp, map } from '../tweening/interpolationFunctions';
import { Direction, Origin } from './Origin';
import { EPSILON } from './Type';
import { CompoundSignalContext, } from '../signals';
import { DEG2RAD, RAD2DEG } from '../utils';
import { Matrix2D } from './Matrix2D';
/**
 * Represents a two-dimensional vector.
 */
export class Vector2 {
    static createSignal(initial, interpolation = Vector2.lerp, owner) {
        return new CompoundSignalContext(['x', 'y'], (value) => new Vector2(value), initial, interpolation, owner).toSignal();
    }
    static lerp(from, to, value) {
        let valueX;
        let valueY;
        if (typeof value === 'number') {
            valueX = valueY = value;
        }
        else {
            valueX = value.x;
            valueY = value.y;
        }
        return new Vector2(map(from.x, to.x, valueX), map(from.y, to.y, valueY));
    }
    static arcLerp(from, to, value, reverse = false, ratio) {
        ratio ?? (ratio = from.sub(to).ctg);
        return Vector2.lerp(from, to, arcLerp(value, reverse, ratio));
    }
    static createArcLerp(reverse, ratio) {
        return (from, to, value) => Vector2.arcLerp(from, to, value, reverse, ratio);
    }
    /**
     * Interpolates between two vectors on the polar plane by interpolating
     * the angles and magnitudes of the vectors individually.
     *
     * @param from - The starting vector.
     * @param to - The target vector.
     * @param value - The t-value of the interpolation.
     * @param counterclockwise - Whether the vector should get rotated
     *                           counterclockwise. Defaults to `false`.
     * @param origin - The center of rotation. Defaults to the origin.
     *
     * @remarks
     * This function is useful when used in conjunction with {@link rotate} to
     * animate an object's position on a circular arc (see examples).
     *
     * @example
     * Animating an object in a circle around the origin
     * ```tsx
     * circle().position(
     *   circle().position().rotate(180),
     *   1,
     *   easeInOutCubic,
     *   Vector2.polarLerp
     * );
     * ```
     * @example
     * Rotating an object around the point `[-200, 100]`
     * ```ts
     * circle().position(
     *   circle().position().rotate(180, [-200, 100]),
     *   1,
     *   easeInOutCubic,
     *   Vector2.createPolarLerp(false, [-200, 100]),
     * );
     * ```
     * @example
     * Rotating an object counterclockwise around the origin
     * ```ts
     * circle().position(
     *   circle().position().rotate(180),
     *   1,
     *   easeInOutCubic,
     *   Vector2.createPolarLerp(true),
     * );
     * ```
     */
    static polarLerp(from, to, value, counterclockwise = false, origin = Vector2.zero) {
        from = from.sub(origin);
        to = to.sub(origin);
        const fromAngle = from.degrees;
        let toAngle = to.degrees;
        const isCounterclockwise = fromAngle > toAngle;
        if (isCounterclockwise !== counterclockwise) {
            toAngle = toAngle + (counterclockwise ? -360 : 360);
        }
        const angle = map(fromAngle, toAngle, value) * DEG2RAD;
        const magnitude = map(from.magnitude, to.magnitude, value);
        return new Vector2(magnitude * Math.cos(angle) + origin.x, magnitude * Math.sin(angle) + origin.y);
    }
    /**
     * Helper function to create a {@link Vector2.polarLerp} interpolation
     * function with additional parameters.
     *
     * @param counterclockwise - Whether the point should get rotated
     *                           counterclockwise.
     * @param center - The center of rotation. Defaults to the origin.
     */
    static createPolarLerp(counterclockwise = false, center = Vector2.zero) {
        return (from, to, value) => Vector2.polarLerp(from, to, value, counterclockwise, new Vector2(center));
    }
    static fromOrigin(origin) {
        const position = new Vector2();
        if (origin === Origin.Middle) {
            return position;
        }
        if (origin & Direction.Left) {
            position.x = -1;
        }
        else if (origin & Direction.Right) {
            position.x = 1;
        }
        if (origin & Direction.Top) {
            position.y = -1;
        }
        else if (origin & Direction.Bottom) {
            position.y = 1;
        }
        return position;
    }
    static fromScalar(value) {
        return new Vector2(value, value);
    }
    static fromRadians(radians) {
        return new Vector2(Math.cos(radians), Math.sin(radians));
    }
    static fromDegrees(degrees) {
        return Vector2.fromRadians(degrees * DEG2RAD);
    }
    /**
     * Return the angle in radians between the vector described by x and y and the
     * positive x-axis.
     *
     * @param x - The x component of the vector.
     * @param y - The y component of the vector.
     */
    static radians(x, y) {
        return Math.atan2(y, x);
    }
    /**
     * Return the angle in degrees between the vector described by x and y and the
     * positive x-axis.
     *
     * @param x - The x component of the vector.
     * @param y - The y component of the vector.
     *
     * @remarks
     * The returned angle will be between -180 and 180 degrees.
     */
    static degrees(x, y) {
        return Vector2.radians(x, y) * RAD2DEG;
    }
    static magnitude(x, y) {
        return Math.sqrt(x * x + y * y);
    }
    static squaredMagnitude(x, y) {
        return x * x + y * y;
    }
    static angleBetween(u, v) {
        return (Math.acos(clamp(-1, 1, u.dot(v) / (u.magnitude * v.magnitude))) *
            (u.cross(v) >= 0 ? 1 : -1));
    }
    get width() {
        return this.x;
    }
    set width(value) {
        this.x = value;
    }
    get height() {
        return this.y;
    }
    set height(value) {
        this.y = value;
    }
    get magnitude() {
        return Vector2.magnitude(this.x, this.y);
    }
    get squaredMagnitude() {
        return Vector2.squaredMagnitude(this.x, this.y);
    }
    get normalized() {
        return this.scale(1 / Vector2.magnitude(this.x, this.y));
    }
    get safe() {
        return new Vector2(isNaN(this.x) ? 0 : this.x, isNaN(this.y) ? 0 : this.y);
    }
    get flipped() {
        return new Vector2(-this.x, -this.y);
    }
    get floored() {
        return new Vector2(Math.floor(this.x), Math.floor(this.y));
    }
    get perpendicular() {
        return new Vector2(this.y, -this.x);
    }
    /**
     * Return the angle in radians between the vector and the positive x-axis.
     */
    get radians() {
        return Vector2.radians(this.x, this.y);
    }
    /**
     * Return the angle in degrees between the vector and the positive x-axis.
     *
     * @remarks
     * The returned angle will be between -180 and 180 degrees.
     */
    get degrees() {
        return Vector2.degrees(this.x, this.y);
    }
    get ctg() {
        return this.x / this.y;
    }
    constructor(one, two) {
        this.x = 0;
        this.y = 0;
        if (one === undefined || one === null) {
            return;
        }
        if (typeof one !== 'object') {
            this.x = one;
            this.y = two ?? one;
            return;
        }
        if (Array.isArray(one)) {
            this.x = one[0];
            this.y = one[1];
            return;
        }
        if ('width' in one) {
            this.x = one.width;
            this.y = one.height;
            return;
        }
        this.x = one.x;
        this.y = one.y;
    }
    lerp(to, value) {
        return Vector2.lerp(this, to, value);
    }
    getOriginOffset(origin) {
        const offset = Vector2.fromOrigin(origin);
        offset.x *= this.x / 2;
        offset.y *= this.y / 2;
        return offset;
    }
    scale(value) {
        return new Vector2(this.x * value, this.y * value);
    }
    transformAsPoint(matrix) {
        const m = new Matrix2D(matrix);
        return new Vector2(this.x * m.scaleX + this.y * m.skewY + m.translateX, this.x * m.skewX + this.y * m.scaleY + m.translateY);
    }
    transform(matrix) {
        const m = new Matrix2D(matrix);
        return new Vector2(this.x * m.scaleX + this.y * m.skewY, this.x * m.skewX + this.y * m.scaleY);
    }
    mul(possibleVector) {
        const vector = new Vector2(possibleVector);
        return new Vector2(this.x * vector.x, this.y * vector.y);
    }
    div(possibleVector) {
        const vector = new Vector2(possibleVector);
        return new Vector2(this.x / vector.x, this.y / vector.y);
    }
    add(possibleVector) {
        const vector = new Vector2(possibleVector);
        return new Vector2(this.x + vector.x, this.y + vector.y);
    }
    sub(possibleVector) {
        const vector = new Vector2(possibleVector);
        return new Vector2(this.x - vector.x, this.y - vector.y);
    }
    dot(possibleVector) {
        const vector = new Vector2(possibleVector);
        return this.x * vector.x + this.y * vector.y;
    }
    cross(possibleVector) {
        const vector = new Vector2(possibleVector);
        return this.x * vector.y - this.y * vector.x;
    }
    mod(possibleVector) {
        const vector = new Vector2(possibleVector);
        return new Vector2(this.x % vector.x, this.y % vector.y);
    }
    /**
     * Rotates the vector around a point by the provided angle.
     *
     * @param angle - The angle by which to rotate in degrees.
     * @param center - The center of rotation. Defaults to the origin.
     */
    rotate(angle, center = Vector2.zero) {
        const originVector = new Vector2(center);
        const matrix = Matrix2D.fromTranslation(originVector)
            .rotate(angle)
            .translate(originVector.flipped);
        return this.transformAsPoint(matrix);
    }
    addX(value) {
        return new Vector2(this.x + value, this.y);
    }
    addY(value) {
        return new Vector2(this.x, this.y + value);
    }
    toSymbol() {
        return Vector2.symbol;
    }
    toString() {
        return `Vector2(${this.x}, ${this.y})`;
    }
    serialize() {
        return { x: this.x, y: this.y };
    }
    /**
     * Check if two vectors are exactly equal to each other.
     *
     * @remarks
     * If you need to compensate for floating point inaccuracies, use the
     * {@link equals} method, instead.
     *
     * @param other - The vector to compare.
     */
    exactlyEquals(other) {
        return this.x === other.x && this.y === other.y;
    }
    /**
     * Check if two vectors are equal to each other.
     *
     * @remarks
     * This method allows passing an allowed error margin when comparing vectors
     * to compensate for floating point inaccuracies. To check if two vectors are
     * exactly equal, use the {@link exactlyEquals} method, instead.
     *
     * @param other - The vector to compare.
     * @param threshold - The allowed error threshold when comparing the vectors.
     */
    equals(other, threshold = EPSILON) {
        return (Math.abs(this.x - other.x) <= threshold + Number.EPSILON &&
            Math.abs(this.y - other.y) <= threshold + Number.EPSILON);
    }
}
Vector2.symbol = Symbol.for('@motion-canvas/core/types/Vector2');
Vector2.zero = new Vector2();
Vector2.one = new Vector2(1, 1);
Vector2.right = new Vector2(1, 0);
Vector2.left = new Vector2(-1, 0);
Vector2.up = new Vector2(0, 1);
Vector2.down = new Vector2(0, -1);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmVjdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3R5cGVzL1ZlY3Rvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUMsT0FBTyxFQUF3QixNQUFNLGFBQWEsQ0FBQztBQUMzRCxPQUFPLEVBQUMsS0FBSyxFQUFFLEdBQUcsRUFBQyxNQUFNLG9DQUFvQyxDQUFDO0FBQzlELE9BQU8sRUFBQyxTQUFTLEVBQUUsTUFBTSxFQUFDLE1BQU0sVUFBVSxDQUFDO0FBQzNDLE9BQU8sRUFBQyxPQUFPLEVBQU8sTUFBTSxRQUFRLENBQUM7QUFDckMsT0FBTyxFQUVMLHFCQUFxQixHQUd0QixNQUFNLFlBQVksQ0FBQztBQUNwQixPQUFPLEVBQUMsT0FBTyxFQUFFLE9BQU8sRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUMxQyxPQUFPLEVBQUMsUUFBUSxFQUFtQixNQUFNLFlBQVksQ0FBQztBQXVCdEQ7O0dBRUc7QUFDSCxNQUFNLE9BQU8sT0FBTztJQWVYLE1BQU0sQ0FBQyxZQUFZLENBQ3hCLE9BQXNDLEVBQ3RDLGdCQUFnRCxPQUFPLENBQUMsSUFBSSxFQUM1RCxLQUFXO1FBRVgsT0FBTyxJQUFJLHFCQUFxQixDQUM5QixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFDVixDQUFDLEtBQXNCLEVBQUUsRUFBRSxDQUFDLElBQUksT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUM5QyxPQUFPLEVBQ1AsYUFBYSxFQUNiLEtBQUssQ0FDTixDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ2YsQ0FBQztJQUVNLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBYSxFQUFFLEVBQVcsRUFBRSxLQUF1QjtRQUNwRSxJQUFJLE1BQU0sQ0FBQztRQUNYLElBQUksTUFBTSxDQUFDO1FBRVgsSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLEVBQUU7WUFDN0IsTUFBTSxHQUFHLE1BQU0sR0FBRyxLQUFLLENBQUM7U0FDekI7YUFBTTtZQUNMLE1BQU0sR0FB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