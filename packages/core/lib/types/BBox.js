import { Vector2 } from './Vector';
import { arcLerp, map } from '../tweening';
import { CompoundSignalContext } from '../signals';
export class BBox {
    static createSignal(initial, interpolation = BBox.lerp) {
        return new CompoundSignalContext(['x', 'y', 'width', 'height'], (value) => new BBox(value), initial, interpolation).toSignal();
    }
    static lerp(from, to, value) {
        let valueX;
        let valueY;
        let valueWidth;
        let valueHeight;
        if (typeof value === 'number') {
            valueX = valueY = valueWidth = valueHeight = value;
        }
        else if (value instanceof Vector2) {
            valueX = valueWidth = value.x;
            valueY = valueHeight = value.y;
        }
        else {
            valueX = value.x;
            valueY = value.y;
            valueWidth = value.width;
            valueHeight = value.height;
        }
        return new BBox(map(from.x, to.x, valueX), map(from.y, to.y, valueY), map(from.width, to.width, valueWidth), map(from.height, to.height, valueHeight));
    }
    static arcLerp(from, to, value, reverse = false, ratio) {
        ratio ?? (ratio = (from.position.sub(to.position).ctg + from.size.sub(to.size).ctg) / 2);
        return BBox.lerp(from, to, arcLerp(value, reverse, ratio));
    }
    static fromSizeCentered(size) {
        return new BBox(-size.width / 2, -size.height / 2, size.width, size.height);
    }
    static fromPoints(...points) {
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;
        for (const point of points) {
            if (point.x > maxX) {
                maxX = point.x;
            }
            if (point.x < minX) {
                minX = point.x;
            }
            if (point.y > maxY) {
                maxY = point.y;
            }
            if (point.y < minY) {
                minY = point.y;
            }
        }
        return new BBox(minX, minY, maxX - minX, maxY - minY);
    }
    static fromBBoxes(...boxes) {
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;
        for (const box of boxes) {
            const right = box.x + box.width;
            if (right > maxX) {
                maxX = right;
            }
            if (box.x < minX) {
                minX = box.x;
            }
            const bottom = box.y + box.height;
            if (bottom > maxY) {
                maxY = bottom;
            }
            if (box.y < minY) {
                minY = box.y;
            }
        }
        return new BBox(minX, minY, maxX - minX, maxY - minY);
    }
    lerp(to, value) {
        return BBox.lerp(this, to, value);
    }
    get position() {
        return new Vector2(this.x, this.y);
    }
    set position(value) {
        this.x = value.x;
        this.y = value.y;
    }
    get size() {
        return new Vector2(this.width, this.height);
    }
    get center() {
        return new Vector2(this.x + this.width / 2, this.y + this.height / 2);
    }
    get left() {
        return this.x;
    }
    set left(value) {
        this.width += this.x - value;
        this.x = value;
    }
    get right() {
        return this.x + this.width;
    }
    set right(value) {
        this.width = value - this.x;
    }
    get top() {
        return this.y;
    }
    set top(value) {
        this.height += this.y - value;
        this.y = value;
    }
    get bottom() {
        return this.y + this.height;
    }
    set bottom(value) {
        this.height = value - this.y;
    }
    get topLeft() {
        return this.position;
    }
    get topRight() {
        return new Vector2(this.x + this.width, this.y);
    }
    get bottomLeft() {
        return new Vector2(this.x, this.y + this.height);
    }
    get bottomRight() {
        return new Vector2(this.x + this.width, this.y + this.height);
    }
    get corners() {
        return [this.topLeft, this.topRight, this.bottomRight, this.bottomLeft];
    }
    get pixelPerfect() {
        return new BBox(Math.floor(this.x), Math.floor(this.y), Math.ceil(this.width + 1), Math.ceil(this.height + 1));
    }
    constructor(one, two = 0, three = 0, four = 0) {
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
        if (one === undefined || one === null) {
            return;
        }
        if (typeof one === 'number') {
            this.x = one;
            this.y = two;
            this.width = three;
            this.height = four;
            return;
        }
        if (one instanceof Vector2) {
            this.x = one.x;
            this.y = one.y;
            if (two instanceof Vector2) {
                this.width = two.x;
                this.height = two.y;
            }
            return;
        }
        if (Array.isArray(one)) {
            this.x = one[0];
            this.y = one[1];
            this.width = one[2];
            this.height = one[3];
            return;
        }
        this.x = one.x;
        this.y = one.y;
        this.width = one.width;
        this.height = one.height;
    }
    transform(matrix) {
        return new BBox(this.position.transformAsPoint(matrix), this.size.transform(matrix));
    }
    transformCorners(matrix) {
        return this.corners.map(corner => corner.transformAsPoint(matrix));
    }
    expand(amount) {
        return new BBox(this.x - amount, this.y - amount, this.width + amount * 2, this.height + amount * 2);
    }
    addSpacing(spacing) {
        const result = new BBox(this);
        result.left -= spacing.left;
        result.top -= spacing.top;
        result.right += spacing.right;
        result.bottom += spacing.bottom;
        return result;
    }
    includes(point) {
        return (point.x >= this.x &&
            point.x <= this.x + this.width &&
            point.y >= this.y &&
            point.y <= this.y + this.height);
    }
    intersects(other) {
        return (this.left < other.right &&
            this.right > other.left &&
            this.top < other.bottom &&
            this.bottom > other.top);
    }
    intersection(other) {
        const bbox = new BBox();
        if (this.intersects(other)) {
            bbox.left = Math.max(this.left, other.left);
            bbox.top = Math.max(this.top, other.top);
            bbox.right = Math.min(this.right, other.right);
            bbox.bottom = Math.min(this.bottom, other.bottom);
        }
        return bbox;
    }
    toSymbol() {
        return BBox.symbol;
    }
    toString() {
        return `BBox(${this.x}, ${this.y}, ${this.width}, ${this.height})`;
    }
    serialize() {
        return { x: this.x, y: this.y, width: this.width, height: this.height };
    }
}
BBox.symbol = Symbol.for('@motion-canvas/core/types/Rect');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQkJveC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90eXBlcy9CQm94LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBQyxPQUFPLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFDakMsT0FBTyxFQUFDLE9BQU8sRUFBeUIsR0FBRyxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBR2hFLE9BQU8sRUFBaUIscUJBQXFCLEVBQWMsTUFBTSxZQUFZLENBQUM7QUF1QjlFLE1BQU0sT0FBTyxJQUFJO0lBUVIsTUFBTSxDQUFDLFlBQVksQ0FDeEIsT0FBbUMsRUFDbkMsZ0JBQTZDLElBQUksQ0FBQyxJQUFJO1FBRXRELE9BQU8sSUFBSSxxQkFBcUIsQ0FDOUIsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRSxRQUFRLENBQUMsRUFDN0IsQ0FBQyxLQUFtQixFQUFFLEVBQUUsQ0FBQyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsRUFDeEMsT0FBTyxFQUNQLGFBQWEsQ0FDZCxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ2YsQ0FBQztJQUVNLE1BQU0sQ0FBQyxJQUFJLENBQ2hCLElBQVUsRUFDVixFQUFRLEVBQ1IsS0FBOEI7UUFFOUIsSUFBSSxNQUFNLENBQUM7UUFDWCxJQUFJLE1BQU0sQ0FBQztRQUNYLElBQUksVUFBVSxDQUFDO1FBQ2YsSUFBSSxXQUFXLENBQUM7UUFDaEIsSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLEVBQUU7WUFDN0IsTUFBTSxHQUFHLE1BQU0sR0FBRyxVQUFVLEdBQUcsV0FBVyxHQUFHLEtBQUssQ0FBQztTQUNwRDthQUFNLElBQUksS0FBSyxZQUFZLE9BQU8sRUFBRTtZQUNuQyxNQUFNLEdBQUcsVUFBVSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDOUIsTUFBTSxHQUFHLFdBQVcsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDO1NBQ2hDO2FBQU07WUFDTCxNQUFNLEdBQUcsS0FBSyxDQUFD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