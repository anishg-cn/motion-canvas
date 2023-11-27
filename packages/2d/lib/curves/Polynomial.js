import { clamp } from '@motion-canvas/core/lib/tweening';
/**
 * A polynomial in the form ax^3 + bx^2 + cx + d up to a cubic polynomial.
 *
 * Source code liberally taken from:
 * https://github.com/FreyaHolmer/Mathfs/blob/master/Runtime/Curves/Polynomial.cs
 */
export class Polynomial {
    /**
     * Constructs a constant polynomial
     *
     * @param c0 - The constant coefficient
     */
    static constant(c0) {
        return new Polynomial(c0);
    }
    /**
     * Constructs a linear polynomial
     *
     * @param c0 - The constant coefficient
     * @param c1 - The linear coefficient
     */
    static linear(c0, c1) {
        return new Polynomial(c0, c1);
    }
    /**
     * Constructs a quadratic polynomial
     *
     * @param c0 - The constant coefficient
     * @param c1 - The linear coefficient
     * @param c2 - The quadratic coefficient
     */
    static quadratic(c0, c1, c2) {
        return new Polynomial(c0, c1, c2);
    }
    /**
     * Constructs a cubic polynomial
     *
     * @param c0 - The constant coefficient
     * @param c1 - The linear coefficient
     * @param c2 - The quadratic coefficient
     * @param c3 - The cubic coefficient
     */
    static cubic(c0, c1, c2, c3) {
        return new Polynomial(c0, c1, c2, c3);
    }
    /**
     * The degree of the polynomial
     */
    get degree() {
        if (this.c3 !== 0) {
            return 3;
        }
        else if (this.c2 !== 0) {
            return 2;
        }
        else if (this.c1 !== 0) {
            return 1;
        }
        return 0;
    }
    constructor(c0, c1, c2, c3) {
        this.c0 = c0;
        this.c1 = c1 ?? 0;
        this.c2 = c2 ?? 0;
        this.c3 = c3 ?? 0;
    }
    /**
     * Return the nth derivative of the polynomial.
     *
     * @param n - The number of times to differentiate the polynomial.
     */
    differentiate(n = 1) {
        switch (n) {
            case 0:
                return this;
            case 1:
                return new Polynomial(this.c1, 2 * this.c2, 3 * this.c3, 0);
            case 2:
                return new Polynomial(2 * this.c2, 6 * this.c3, 0, 0);
            case 3:
                return new Polynomial(6 * this.c3, 0, 0, 0);
            default:
                throw new Error('Unsupported derivative');
        }
    }
    eval(t, derivative = 0) {
        if (derivative !== 0) {
            return this.differentiate(derivative).eval(t);
        }
        return this.c3 * (t * t * t) + this.c2 * (t * t) + this.c1 * t + this.c0;
    }
    /**
     * Split the polynomial into two polynomials of the same overall shape.
     *
     * @param u - The point at which to split the polynomial.
     */
    split(u) {
        const d = 1 - u;
        const pre = new Polynomial(this.c0, this.c1 * u, this.c2 * u * u, this.c3 * u * u * u);
        const post = new Polynomial(this.eval(0), d * this.differentiate(1).eval(u), ((d * d) / 2) * this.differentiate(2).eval(u), ((d * d * d) / 6) * this.differentiate(3).eval(u));
        return [pre, post];
    }
    /**
     * Calculate the roots (values where this polynomial = 0).
     *
     * @remarks
     * Depending on the degree of the polynomial, returns between 0 and 3 results.
     */
    roots() {
        switch (this.degree) {
            case 3:
                return this.solveCubicRoots();
            case 2:
                return this.solveQuadraticRoots();
            case 1:
                return this.solveLinearRoot();
            case 0:
                return [];
            default:
                throw new Error(`Unsupported polynomial degree: ${this.degree}`);
        }
    }
    /**
     * Calculate the local extrema of the polynomial.
     */
    localExtrema() {
        return this.differentiate().roots();
    }
    /**
     * Calculate the local extrema of the polynomial in the unit interval.
     */
    localExtrema01() {
        const all = this.localExtrema();
        const valids = [];
        for (let i = 0; i < all.length; i++) {
            const t = all[i];
            if (t >= 0 && t <= 1) {
                valids.push(all[i]);
            }
        }
        return valids;
    }
    /**
     * Return the output value range within the unit interval.
     */
    outputRange01() {
        let range = [this.eval(0), this.eval(1)];
        // Expands the minimum or maximum value of the range to contain the given
        // value.
        const encapsulate = (value) => {
            if (range[1] > range[0]) {
                range = [Math.min(range[0], value), Math.max(range[1], value)];
            }
            else {
                range = [Math.min(range[1], value), Math.max(range[0], value)];
            }
        };
        this.localExtrema01().forEach(t => encapsulate(this.eval(t)));
        return range;
    }
    solveCubicRoots() {
        const a = this.c0;
        const b = this.c1;
        const c = this.c2;
        const d = this.c3;
        // First, depress the cubic to make it easier to solve
        const aa = a * a;
        const ac = a * c;
        const bb = b * b;
        const p = (3 * ac - bb) / (3 * aa);
        const q = (2 * bb * b - 9 * ac * b + 27 * aa * d) / (27 * aa * a);
        const dpr = this.solveDepressedCubicRoots(p, q);
        // We now have the roots of the depressed cubic, now convert back to the
        // normal cubic
        const undepressRoot = (r) => r - b / (3 * a);
        switch (dpr.length) {
            case 1:
                return [undepressRoot(dpr[0])];
            case 2:
                return [undepressRoot(dpr[0]), undepressRoot(dpr[1])];
            case 3:
                return [
                    undepressRoot(dpr[0]),
                    undepressRoot(dpr[1]),
                    undepressRoot(dpr[2]),
                ];
            default:
                return [];
        }
    }
    solveDepressedCubicRoots(p, q) {
        // t³+pt+q = 0
        // Triple root - one solution. solve x³+q = 0 => x = cr(-q)
        if (this.almostZero(p)) {
            return [Math.cbrt(-q)];
        }
        const TAU = Math.PI * 2;
        const discriminant = 4 * p * p * p + 27 * q * q;
        if (discriminant < 0.00001) {
            // Two or three roots guaranteed, use trig solution
            const pre = 2 * Math.sqrt(-p / 3);
            const acosInner = ((3 * q) / (2 * p)) * Math.sqrt(-3 / p);
            const getRoot = (k) => pre *
                Math.cos((1 / 3) * Math.acos(clamp(-1, 1, acosInner)) - (TAU / 3) * k);
            // If acos hits 0 or TAU/2, the offsets will have the same value,
            // which means we have a double root plus one regular root on our hands
            if (acosInner >= 0.9999) {
                // two roots - one single and one double root
                return [getRoot(0), getRoot(2)];
            }
            if (acosInner <= -0.9999) {
                // two roots - one single and one double root
                return [getRoot(1), getRoot(2)];
            }
            return [getRoot(0), getRoot(1), getRoot(2)];
        }
        if (discriminant > 0 && p < 0) {
            // one root
            const coshInner = (1 / 3) *
                Math.acosh(((-3 * Math.abs(q)) / (2 * p)) * Math.sqrt(-3 / p));
            const r = -2 * Math.sign(q) * Math.sqrt(-p / 3) * Math.cosh(coshInner);
            return [r];
        }
        if (p > 0) {
            // one root
            const sinhInner = (1 / 3) * Math.asinh(((3 * q) / (2 * p)) * Math.sqrt(3 / p));
            const r = -2 * Math.sqrt(p / 3) * Math.sinh(sinhInner);
            return [r];
        }
        // no roots
        return [];
    }
    solveQuadraticRoots() {
        const a = this.c2;
        const b = this.c1;
        const c = this.c0;
        const rootContent = b * b - 4 * a * c;
        if (this.almostZero(rootContent)) {
            // two equivalent solutions at one point
            return [-b / (2 * a)];
        }
        if (rootContent >= 0) {
            const root = Math.sqrt(rootContent);
            // crosses at two points
            const r0 = (-b - root) / (2 * a);
            const r1 = (-b + root) / (2 * a);
            return [Math.min(r0, r1), Math.max(r0, r1)];
        }
        return [];
    }
    solveLinearRoot() {
        return [-this.c0 / this.c1];
    }
    almostZero(value) {
        return Math.abs(0 - value) <= Number.EPSILON;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUG9seW5vbWlhbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jdXJ2ZXMvUG9seW5vbWlhbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUMsS0FBSyxFQUFDLE1BQU0sa0NBQWtDLENBQUM7QUFFdkQ7Ozs7O0dBS0c7QUFDSCxNQUFNLE9BQU8sVUFBVTtJQUtyQjs7OztPQUlHO0lBQ0ksTUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUFVO1FBQy9CLE9BQU8sSUFBSSxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDNUIsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0ksTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFVLEVBQUUsRUFBVTtRQUN6QyxPQUFPLElBQUksVUFBVSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUNoQyxDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0ksTUFBTSxDQUFDLFNBQVMsQ0FBQyxFQUFVLEVBQUUsRUFBVSxFQUFFLEVBQVU7UUFDeEQsT0FBTyxJQUFJLFVBQVUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ3BDLENBQUM7SUFFRDs7Ozs7OztPQU9HO0lBQ0ksTUFBTSxDQUFDLEtBQUssQ0FDakIsRUFBVSxFQUNWLEVBQVUsRUFDVixFQUFVLEVBQ1YsRUFBVTtRQUVWLE9BQU8sSUFBSSxVQUFVLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDeEMsQ0FBQztJQUVEOztPQUVHO0lBQ0gsSUFBVyxNQUFNO1FBQ2YsSUFBSSxJQUFJLENBQUMsRUFBRSxLQUFLLENBQUMsRUFBRTtZQUNqQixPQUFPLENBQUMsQ0FBQztTQUNWO2FBQU0sSUFBSSxJQUFJLENBQUMsRUFBRSxLQUFLLENBQUMsRUFBRTtZQUN4QixPQUFPLENBQUMsQ0FBQztTQUNWO2FBQU0sSUFBSSxJQUFJLENBQUMsRUFBRSxLQUFLLENBQUMsRUFB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