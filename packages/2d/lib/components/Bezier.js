var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { BBox } from '@motion-canvas/core/lib/types';
import { Curve } from './Curve';
import { arc, drawLine, drawPivot, moveTo } from '../utils';
import { computed } from '../decorators';
export class Bezier extends Curve {
    profile() {
        const segment = this.segment();
        return {
            segments: [segment],
            arcLength: segment.arcLength,
            minSin: 0,
        };
    }
    childrenBBox() {
        return BBox.fromPoints(...this.segment().points);
    }
    desiredSize() {
        return this.segment().getBBox().size;
    }
    offsetComputedLayout(box) {
        box.position = box.position.sub(this.segment().getBBox().center);
        return box;
    }
    drawOverlay(context, matrix) {
        const size = this.computedSize();
        const box = this.childrenBBox().transformCorners(matrix);
        const offset = size.mul(this.offset()).scale(0.5).transformAsPoint(matrix);
        const overlayInfo = this.overlayInfo(matrix);
        context.lineWidth = 1;
        context.strokeStyle = 'white';
        context.fillStyle = 'white';
        // Draw the curve itself first so everything else gets drawn on top of it
        context.stroke(overlayInfo.curve);
        context.fillStyle = 'white';
        context.globalAlpha = 0.5;
        context.beginPath();
        context.stroke(overlayInfo.handleLines);
        context.globalAlpha = 1;
        context.lineWidth = 2;
        // Draw start and end points
        for (const point of [overlayInfo.startPoint, overlayInfo.endPoint]) {
            moveTo(context, point);
            context.beginPath();
            arc(context, point, 4);
            context.closePath();
            context.stroke();
            context.fill();
        }
        // Draw the control points
        context.fillStyle = 'black';
        for (const point of overlayInfo.controlPoints) {
            moveTo(context, point);
            context.beginPath();
            arc(context, point, 4);
            context.closePath();
            context.fill();
            context.stroke();
        }
        // Draw the offset marker
        context.lineWidth = 1;
        context.beginPath();
        drawPivot(context, offset);
        context.stroke();
        // Draw the bounding box
        context.beginPath();
        drawLine(context, box);
        context.closePath();
        context.stroke();
    }
}
__decorate([
    computed()
], Bezier.prototype, "childrenBBox", null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmV6aWVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbXBvbmVudHMvQmV6aWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLE9BQU8sRUFBQyxJQUFJLEVBQTZCLE1BQU0sK0JBQStCLENBQUM7QUFDL0UsT0FBTyxFQUFDLEtBQUssRUFBQyxNQUFNLFNBQVMsQ0FBQztBQUk5QixPQUFPLEVBQUMsR0FBRyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFDLE1BQU0sVUFBVSxDQUFDO0FBQzFELE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFVdkMsTUFBTSxPQUFnQixNQUFPLFNBQVEsS0FBSztJQUN4QixPQUFPO1FBQ3JCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUMvQixPQUFPO1lBQ0wsUUFBUSxFQUFFLENBQUMsT0FBTyxDQUFDO1lBQ25CLFNBQVMsRUFBRSxPQUFPLENBQUMsU0FBUztZQUM1QixNQUFNLEVBQUUsQ0FBQztTQUNWLENBQUM7SUFDSixDQUFDO0lBT1MsWUFBWTtRQUNwQixPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDbkQsQ0FBQztJQUVrQixXQUFXO1FBQzVCLE9BQU8sSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQztJQUN2QyxDQUFDO0lBRWtCLG9CQUFvQixDQUFDLEdBQVM7UUFDL0MsR0FBRyxDQUFDLFFBQVEsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDakUsT0FBTyxHQUFHLENBQUM7SUFDYixDQUFDO0lBRWUsV0FBVyxDQUN6QixPQUFpQyxFQUNqQyxNQUFpQjtR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