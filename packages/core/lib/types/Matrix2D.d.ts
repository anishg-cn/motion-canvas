import { Type } from './Type';
import { PossibleVector2, Vector2 } from './Vector';
export type PossibleMatrix2D = Matrix2D | DOMMatrix | [number, number, number, number, number, number] | [PossibleVector2, PossibleVector2, PossibleVector2] | undefined;
/**
 * A specialized 2x3 Matrix representing a 2D transformation.
 *
 * A Matrix2D contains six elements defined as
 * [a, b,
 *  c, d,
 *  tx, ty]
 *
 * This is a shortcut for a 3x3 matrix of the form
 * [a, b, 0,
 *  c, d, 0
 *  tx, ty, 1]
 *
 * Note that because a Matrix2D ignores the z-values of each component vectors,
 * it does not satisfy all properties of a "real" 3x3 matrix.
 *
 *   - A Matrix2D has no transpose
 *   - A(B + C) = AB + AC does not hold for a Matrix2D
 *   - (rA)^-1 = r^-1 A^-1, r != 0 does not hold for a Matrix2D
 *   - r(AB) = (rA)B = A(rB) does not hold for a Matrix2D
 */
export declare class Matrix2D implements Type {
    static readonly symbol: unique symbol;
    readonly values: Float32Array;
    static readonly identity: Matrix2D;
    static readonly zero: Matrix2D;
    static fromRotation(angle: number): Matrix2D;
    static fromTranslation(translation: PossibleVector2): Matrix2D;
    static fromScaling(scale: PossibleVector2): Matrix2D;
    get x(): Vector2;
    get y(): Vector2;
    get scaleX(): number;
    set scaleX(value: number);
    get skewX(): number;
    set skewX(value: number);
    get scaleY(): number;
    set scaleY(value: number);
    get skewY(): number;
    set skewY(value: number);
    get translateX(): number;
    set translateX(value: number);
    get translateY(): number;
    set translateY(value: number);
    get rotation(): number;
    set rotation(angle: number);
    get translation(): Vector2;
    set translation(translation: PossibleVector2);
    get scaling(): Vector2;
    set scaling(value: PossibleVector2);
    /**
     * Get the inverse of the matrix.
     *
     * @remarks
     * If the matrix is not invertible, i.e. its determinant is `0`, this will
     * return `null`, instead.
     *
     * @example
     * ```ts
     * const matrix = new Matrix2D(
     *   [1, 2],
     *   [3, 4],
     *   [5, 6],
     * );
     *
     * const inverse = matrix.inverse;
     * // => Matrix2D(
     * //      [-2, 1],
     * //      [1.5, -0.5],
     * //      [1, -2],
     * //   )
     * ```
     */
    get inverse(): Matrix2D | null;
    /**
     * Get the determinant of the matrix.
     */
    get determinant(): number;
    get domMatrix(): DOMMatrix;
    constructor();
    constructor(matrix: PossibleMatrix2D);
    constructor(x: PossibleVector2, y: PossibleVector2, z: PossibleVector2);
    constructor(a: number, b: number, c: number, d: number, tx: number, ty: number);
    /**
     * Get the nth component vector of the matrix. Only defined for 0, 1, and 2.
     *
     * @example
     * ```ts
     * const matrix = new Matrix2D(
     *   [1, 0],
     *   [0, 0],
     *   [1, 0],
     * );
     *
     * const x = matrix.column(0);
     * // Vector2(1, 0)
     *
     * const y = matrix.column(1);
     * // Vector2(0, 0)
     *
     * const z = matrix.column(1);
     * // Vector2(1, 0)
     * ```
     *
     * @param index - The index of the component vector to retrieve.
     */
    column(index: number): Vector2;
    /**
     * Returns the nth row of the matrix. Only defined for 0 and 1.
     *
     * @example
     * ```ts
     * const matrix = new Matrix2D(
     *   [1, 0],
     *   [0, 0],
     *   [1, 0],
     * );
     *
     * const firstRow = matrix.column(0);
     * // [1, 0, 1]
     *
     * const secondRow = matrix.column(1);
     * // [0, 0, 0]
     * ```
     *
     * @param index - The index of the row to retrieve.
     */
    row(index: number): [number, number, number];
    /**
     * Returns the matrix product of this matrix with the provided matrix.
     *
     * @remarks
     * This method returns a new matrix representing the result of the
     * computation. It will not modify the source matrix.
     *
     * @example
     * ```ts
     * const a = new Matrix2D(
     *   [1, 2],
     *   [0, 1],
     *   [1, 1],
     * );
     * const b = new Matrix2D(
     *   [2, 1],
     *   [1, 1],
     *   [1, 1],
     * );
     *
     * const result = a.mul(b);
     * // => Matrix2D(
     * //     [2, 5],
     * //     [1, 3],
     * //     [2, 4],
     * //   )
     * ```
     *
     * @param other - The matrix to multiply with
     */
    mul(other: Matrix2D): Matrix2D;
    /**
     * Rotate the matrix by the provided angle. By default, the angle is
     * provided in degrees.
     *
     * @remarks
     * This method returns a new matrix representing the result of the
     * computation. It will not modify the source matrix.
     *
     * @example
     * ```ts
     * const a = new Matrix2D(
     *   [1, 2],
     *   [3, 4],
     *   [5, 6],
     * );
     *
     * const result = a.rotate(90);
     * // => Matrix2D(
     * //     [3, 4],
     * //     [-1, -2],
     * //     [5, 6],
     * //   )
     *
     * // Provide the angle in radians
     * const result = a.rotate(Math.PI * 0.5, true);
     * // => Matrix2D(
     * //     [3, 4],
     * //     [-1, -2],
     * //     [5, 6],
     * //   )
     * ```
     *
     * @param angle - The angle by which to rotate the matrix.
     * @param degrees - Whether the angle is provided in degrees.
     */
    rotate(angle: number, degrees?: boolean): Matrix2D;
    /**
     * Scale the x and y component vectors of the matrix.
     *
     * @remarks
     * If `vec` is provided as a vector, the x and y component vectors of the
     * matrix will be scaled by the x and y parts of the vector, respectively.
     *
     * If `vec` is provided as a scalar, the x and y component vectors will be
     * scaled uniformly by this factor.
     *
     * This method returns a new matrix representing the result of the
     * computation. It will not modify the source matrix.
     *
     * @example
     * ```ts
     * const matrix = new Matrix2D(
     *   [1, 2],
     *   [3, 4],
     *   [5, 6],
     * );
     *
     * const result1 = matrix.scale([2, 3]);
     * // => new Matrix2D(
     * //      [2, 4],
     * //      [9, 12],
     * //      [5, 6],
     * //    )
     *
     * const result2 = matrix.scale(2);
     * // => new Matrix2D(
     * //      [2, 4],
     * //      [6, 8],
     * //      [5, 6],
     * //    )
     * ```
     *
     * @param vec - The factor by which to scale the matrix
     */
    scale(vec: PossibleVector2): Matrix2D;
    /**
     * Multiply each value of the matrix by a scalar.
     *
     * * @example
     * ```ts
     * const matrix = new Matrix2D(
     *   [1, 2],
     *   [3, 4],
     *   [5, 6],
     * );
     *
     * const result1 = matrix.mulScalar(2);
     * // => new Matrix2D(
     * //      [2, 4],
     * //      [6, 8],
     * //      [10, 12],
     * //    )
     * ```
     *
     * @param s - The value by which to scale each term
     */
    mulScalar(s: number): Matrix2D;
    /**
     * Translate the matrix by the dimensions of the provided vector.
     *
     * @remarks
     * If `vec` is provided as a scalar, matrix will be translated uniformly
     * by this factor.
     *
     * This method returns a new matrix representing the result of the
     * computation. It will not modify the source matrix.
     *
     * @example
     * ```ts
     * const matrix = new Matrix2D(
     *   [1, 2],
     *   [3, 4],
     *   [5, 6],
     * );
     *
     * const result1 = matrix.translate([2, 3]);
     * // => new Matrix2D(
     * //      [1, 2],
     * //      [3, 4],
     * //      [16, 22],
     * //    )
     *
     * const result2 = matrix.translate(2);
     * // => new Matrix2D(
     * //      [1, 2],
     * //      [3, 4],
     * //      [13, 18],
     * //    )
     * ```
     *
     * @param vec - The vector by which to translate the matrix
     */
    translate(vec: PossibleVector2): Matrix2D;
    /**
     * Add the provided matrix to this matrix.
     *
     * @remarks
     * This method returns a new matrix representing the result of the
     * computation. It will not modify the source matrix.
     *
     * @example
     * ```ts
     * const a = new Matrix2D(
     *   [1, 2],
     *   [3, 4],
     *   [5, 6],
     * );
     * const a = new Matrix2D(
     *   [7, 8],
     *   [9, 10],
     *   [11, 12],
     * );
     *
     * const result = a.add(b);
     * // => Matrix2D(
     * //      [8, 10],
     * //      [12, 14],
     * //      [16, 18],
     * //    )
     * ```
     *
     * @param other - The matrix to add
     */
    add(other: Matrix2D): Matrix2D;
    /**
     * Subtract the provided matrix from this matrix.
     *
     * @remarks
     * This method returns a new matrix representing the result of the
     * computation. It will not modify the source matrix.
     *
     * @example
     * ```ts
     * const a = new Matrix2D(
     *   [1, 2],
     *   [3, 4],
     *   [5, 6],
     * );
     * const a = new Matrix2D(
     *   [7, 8],
     *   [9, 10],
     *   [11, 12],
     * );
     *
     * const result = a.sub(b);
     * // => Matrix2D(
     * //      [-6, -6],
     * //      [-6, -6],
     * //      [-6, -6],
     * //    )
     * ```
     *
     * @param other - The matrix to subract
     */
    sub(other: Matrix2D): Matrix2D;
    toSymbol(): symbol;
    equals(other: Matrix2D, threshold?: number): boolean;
    exactlyEquals(other: Matrix2D): boolean;
}
//# sourceMappingURL=Matrix2D.d.ts.map