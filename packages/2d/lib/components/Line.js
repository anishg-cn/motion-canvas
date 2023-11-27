var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { unwrap, } from '@motion-canvas/core/lib/signals';
import { BBox, Vector2 } from '@motion-canvas/core/lib/types';
import { useLogger } from '@motion-canvas/core/lib/utils';
import { getPolylineProfile } from '../curves';
import { computed, initial, signal } from '../decorators';
import { arc, drawLine, drawPivot, lineTo, moveTo } from '../utils';
import { Curve } from './Curve';
import { Layout } from './Layout';
export class Line extends Curve {
    constructor(props) {
        super(props);
        if (props.children === undefined && props.points === undefined) {
            useLogger().warn({
                message: 'No points specified for the line',
                remarks: "<p>The line won&#39;t be visible unless you specify at least two points:</p>\n<pre><code class=\"language-tsx\">&lt;<span class=\"hljs-title class_\">Line</span>\n  stroke=<span class=\"hljs-string\">&quot;#fff&quot;</span>\n  lineWidth={<span class=\"hljs-number\">8</span>}\n  points={[\n    [<span class=\"hljs-number\">100</span>, <span class=\"hljs-number\">0</span>],\n    [<span class=\"hljs-number\">0</span>, <span class=\"hljs-number\">0</span>],\n    [<span class=\"hljs-number\">0</span>, <span class=\"hljs-number\">100</span>],\n  ]}\n/&gt;\n</code></pre>\n<p>Alternatively, you can define the points using the children:</p>\n<pre><code class=\"language-tsx\">&lt;<span class=\"hljs-title class_\">Line</span> stroke=<span class=\"hljs-string\">&quot;#fff&quot;</span> lineWidth={<span class=\"hljs-number\">8</span>}&gt;\n  <span class=\"language-xml\"><span class=\"hljs-tag\">&lt;<span class=\"hljs-name\">Node</span> <span class=\"hljs-attr\">x</span>=<span class=\"hljs-string\">{100}</span> /&gt;</span></span>\n  <span class=\"language-xml\"><span class=\"hljs-tag\">&lt;<span class=\"hljs-name\">Node</span> /&gt;</span></span>\n  <span class=\"language-xml\"><span class=\"hljs-tag\">&lt;<span class=\"hljs-name\">Node</span> <span class=\"hljs-attr\">y</span>=<span class=\"hljs-string\">{100}</span> /&gt;</span></span>\n&lt;/<span class=\"hljs-title class_\">Line</span>&gt;\n</code></pre>\n<p>If you did this intentionally, and want to disable this message, set the\n<code>points</code> property to <code>null</code>:</p>\n<pre><code class=\"language-tsx\">&lt;<span class=\"hljs-title class_\">Line</span> stroke=<span class=\"hljs-string\">&quot;#fff&quot;</span> lineWidth={<span class=\"hljs-number\">8</span>} points={<span class=\"hljs-literal\">null</span>} /&gt;\n</code></pre>\n",
                inspect: this.key,
            });
        }
    }
    childrenBBox() {
        const custom = this.points();
        const points = custom
            ? custom.map(signal => new Vector2(unwrap(signal)))
            : this.children()
                .filter(child => !(child instanceof Layout) || child.isLayoutRoot())
                .map(child => child.position());
        return BBox.fromPoints(...points);
    }
    parsedPoints() {
        const custom = this.points();
        return custom
            ? custom.map(signal => new Vector2(unwrap(signal)))
            : this.children().map(child => child.position());
    }
    profile() {
        return getPolylineProfile(this.parsedPoints(), this.radius(), this.closed());
    }
    lineWidthCoefficient() {
        const radius = this.radius();
        const join = this.lineJoin();
        let coefficient = super.lineWidthCoefficient();
        if (radius === 0 && join === 'miter') {
            const { minSin } = this.profile();
            if (minSin > 0) {
                coefficient = Math.max(coefficient, 0.5 / minSin);
            }
        }
        return coefficient;
    }
    drawOverlay(context, matrix) {
        const box = this.childrenBBox().transformCorners(matrix);
        const size = this.computedSize();
        const offset = size.mul(this.offset()).scale(0.5).transformAsPoint(matrix);
        context.fillStyle = 'white';
        context.strokeStyle = 'black';
        context.lineWidth = 1;
        const path = new Path2D();
        const points = this.parsedPoints().map(point => point.transformAsPoint(matrix));
        if (points.length > 0) {
            moveTo(path, points[0]);
            for (const point of points) {
                lineTo(path, point);
                context.beginPath();
                arc(context, point, 4);
                context.closePath();
                context.fill();
                context.stroke();
            }
        }
        context.strokeStyle = 'white';
        context.stroke(path);
        context.beginPath();
        drawPivot(context, offset);
        context.stroke();
        context.beginPath();
        drawLine(context, box);
        context.closePath();
        context.stroke();
    }
}
__decorate([
    initial(0),
    signal()
], Line.prototype, "radius", void 0);
__decorate([
    initial(null),
    signal()
], Line.prototype, "points", void 0);
__decorate([
    computed()
], Line.prototype, "childrenBBox", null);
__decorate([
    computed()
], Line.prototype, "parsedPoints", null);
__decorate([
    computed()
], Line.prototype, "profile", null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTGluZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21wb25lbnRzL0xpbmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsT0FBTyxFQUdMLE1BQU0sR0FDUCxNQUFNLGlDQUFpQyxDQUFDO0FBQ3pDLE9BQU8sRUFBQyxJQUFJLEVBQW1CLE9BQU8sRUFBQyxNQUFNLCtCQUErQixDQUFDO0FBQzdFLE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSwrQkFBK0IsQ0FBQztBQUN4RCxPQUFPLEVBQWUsa0JBQWtCLEVBQUMsTUFBTSxXQUFXLENBQUM7QUFDM0QsT0FBTyxFQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3hELE9BQU8sRUFBQyxHQUFHLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFDLE1BQU0sVUFBVSxDQUFDO0FBQ2xFLE9BQU8sRUFBQyxLQUFLLEVBQWEsTUFBTSxTQUFTLENBQUM7QUFDMUMsT0FBTyxFQUFDLE1BQU0sRUFBQyxNQUFNLFVBQVUsQ0FBQztBQVFoQyxNQUFNLE9BQU8sSUFBSyxTQUFRLEtBQUs7SUFZN0IsWUFBbUIsS0FBZ0I7UUFDakMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRWIsSUFBSSxLQUFLLENBQUMsUUFBUSxLQUFLLFNBQVMsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLFNBQVMsRUFBRTtZQUM5RCxTQUFTLEVBQUUsQ0FBQyxJQUFJLENBQUM7Z0JBQ2YsT0FBTyxFQUFFLGtDQUFrQztnQkFDM0MsT0FBTywweERBQW1CO2dCQUMxQixPQUFPLEVBQUUsSUFBSSxDQUFDLEdBQUc7YUFDbEIsQ0FBQyxDQUFDO1NBQ0o7SUFDSCxDQUFDO0lBR1MsWUFBWTtRQUNwQixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDN0IsTUFBTSxNQUFNLEdBQUcsTUFBTTtZQUNuQixD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