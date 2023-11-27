var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { computed, initial, signal } from '../decorators';
import { Layout } from './Layout';
import { threadable } from '@motion-canvas/core/lib/decorators';
import { easeOutExpo, linear, map } from '@motion-canvas/core/lib/tweening';
import { resolveCanvasStyle } from '../utils';
import { canvasStyleSignal, } from '../decorators/canvasStyleSignal';
import { createSignal, } from '@motion-canvas/core/lib/signals';
export class Shape extends Layout {
    rippleSize() {
        return easeOutExpo(this.rippleStrength(), 0, 50);
    }
    constructor(props) {
        super(props);
        this.rippleStrength = createSignal(0);
    }
    applyText(context) {
        context.direction = this.textDirection();
        this.element.dir = this.textDirection();
    }
    applyStyle(context) {
        context.fillStyle = resolveCanvasStyle(this.fill(), context);
        context.strokeStyle = resolveCanvasStyle(this.stroke(), context);
        context.lineWidth = this.lineWidth();
        context.lineJoin = this.lineJoin();
        context.lineCap = this.lineCap();
        context.setLineDash(this.lineDash());
        context.lineDashOffset = this.lineDashOffset();
        if (!this.antialiased()) {
            // from https://stackoverflow.com/a/68372384
            context.filter =
                'url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxmaWx0ZXIgaWQ9ImZpbHRlciIgeD0iMCIgeT0iMCIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgY29sb3ItaW50ZXJwb2xhdGlvbi1maWx0ZXJzPSJzUkdCIj48ZmVDb21wb25lbnRUcmFuc2Zlcj48ZmVGdW5jUiB0eXBlPSJpZGVudGl0eSIvPjxmZUZ1bmNHIHR5cGU9ImlkZW50aXR5Ii8+PGZlRnVuY0IgdHlwZT0iaWRlbnRpdHkiLz48ZmVGdW5jQSB0eXBlPSJkaXNjcmV0ZSIgdGFibGVWYWx1ZXM9IjAgMSIvPjwvZmVDb21wb25lbnRUcmFuc2Zlcj48L2ZpbHRlcj48L3N2Zz4=#filter)';
        }
    }
    draw(context) {
        this.drawShape(context);
        if (this.clip()) {
            context.clip(this.getPath());
        }
        this.drawChildren(context);
    }
    drawShape(context) {
        const path = this.getPath();
        const hasStroke = this.lineWidth() > 0 && this.stroke() !== null;
        const hasFill = this.fill() !== null;
        context.save();
        this.applyStyle(context);
        this.drawRipple(context);
        if (this.strokeFirst()) {
            hasStroke && context.stroke(path);
            hasFill && context.fill(path);
        }
        else {
            hasFill && context.fill(path);
            hasStroke && context.stroke(path);
        }
        context.restore();
    }
    getCacheBBox() {
        return super.getCacheBBox().expand(this.lineWidth() / 2);
    }
    getPath() {
        return new Path2D();
    }
    getRipplePath() {
        return new Path2D();
    }
    drawRipple(context) {
        const rippleStrength = this.rippleStrength();
        if (rippleStrength > 0) {
            const ripplePath = this.getRipplePath();
            context.save();
            context.globalAlpha *= map(0.54, 0, rippleStrength);
            context.fill(ripplePath);
            context.restore();
        }
    }
    *ripple(duration = 1) {
        this.rippleStrength(0);
        yield* this.rippleStrength(1, duration, linear);
        this.rippleStrength(0);
    }
}
__decorate([
    canvasStyleSignal()
], Shape.prototype, "fill", void 0);
__decorate([
    canvasStyleSignal()
], Shape.prototype, "stroke", void 0);
__decorate([
    initial(false),
    signal()
], Shape.prototype, "strokeFirst", void 0);
__decorate([
    initial(0),
    signal()
], Shape.prototype, "lineWidth", void 0);
__decorate([
    initial('miter'),
    signal()
], Shape.prototype, "lineJoin", void 0);
__decorate([
    initial('butt'),
    signal()
], Shape.prototype, "lineCap", void 0);
__decorate([
    initial([]),
    signal()
], Shape.prototype, "lineDash", void 0);
__decorate([
    initial(0),
    signal()
], Shape.prototype, "lineDashOffset", void 0);
__decorate([
    initial(true),
    signal()
], Shape.prototype, "antialiased", void 0);
__decorate([
    computed()
], Shape.prototype, "rippleSize", null);
__decorate([
    computed()
], Shape.prototype, "getPath", null);
__decorate([
    threadable()
], Shape.prototype, "ripple", null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2hhcGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29tcG9uZW50cy9TaGFwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFDQSxPQUFPLEVBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFeEQsT0FBTyxFQUFDLE1BQU0sRUFBYyxNQUFNLFVBQVUsQ0FBQztBQUM3QyxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sb0NBQW9DLENBQUM7QUFDOUQsT0FBTyxFQUFDLFdBQVcsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFDLE1BQU0sa0NBQWtDLENBQUM7QUFDMUUsT0FBTyxFQUFDLGtCQUFrQixFQUFDLE1BQU0sVUFBVSxDQUFDO0FBQzVDLE9BQU8sRUFDTCxpQkFBaUIsR0FFbEIsTUFBTSxpQ0FBaUMsQ0FBQztBQUN6QyxPQUFPLEVBQ0wsWUFBWSxHQUdiLE1BQU0saUNBQWlDLENBQUM7QUFjekMsTUFBTSxPQUFnQixLQUFNLFNBQVEsTUFBTTtJQThCOUIsVUFBVTtRQUNsQixPQUFPLFdBQVcsQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ25ELENBQUM7SUFFRCxZQUFtQixLQUFpQjtRQUNsQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7UUFSSSxtQkFBYyxHQUFHLFlBQVksQ0FBZSxDQUFDLENBQUMsQ0FBQztJQVNsRSxDQUFDO0lBRVMsU0FBUyxDQUFDLE9BQWlDO1FBQ25ELE9BQU8sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQ3pDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztJQUMxQyxDQUFDO0lBRVMsVUFBVSxDQUFDLE9BQWlDO1FBQ3BELE9BQU8sQ0FBQyxTQUFTLEdBQUcsa0JBQWtCLENBQUMsSUFBSSxDQUFDLElB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