var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Rect } from './Rect';
import { initial, signal } from '../decorators';
import { PlaybackState } from '@motion-canvas/core';
import { lazy } from '@motion-canvas/core/lib/decorators';
export class View2D extends Rect {
    constructor(props) {
        super({
            composite: true,
            fontFamily: 'Roboto',
            fontSize: 48,
            lineHeight: '120%',
            textWrap: false,
            fontStyle: 'normal',
            ...props,
        });
        this.view2D = this;
        View2D.shadowRoot.append(this.element);
        this.applyFlex();
    }
    transformContext() {
        // do nothing
    }
    dispose() {
        this.removeChildren();
        super.dispose();
    }
    render(context) {
        this.computedSize();
        this.computedPosition();
        super.render(context);
    }
    requestLayoutUpdate() {
        this.updateLayout();
    }
    requestFontUpdate() {
        this.applyFont();
    }
    view() {
        return this;
    }
}
__decorate([
    initial(PlaybackState.Paused),
    signal()
], View2D.prototype, "playbackState", void 0);
__decorate([
    signal()
], View2D.prototype, "assetHash", void 0);
__decorate([
    lazy(() => {
        const frameID = 'motion-canvas-2d-frame';
        let frame = document.querySelector(`#${frameID}`);
        if (!frame) {
            frame = document.createElement('div');
            frame.id = frameID;
            frame.style.position = 'absolute';
            frame.style.pointerEvents = 'none';
            frame.style.top = '0';
            frame.style.left = '0';
            frame.style.opacity = '0';
            frame.style.overflow = 'hidden';
            document.body.prepend(frame);
        }
        return frame.shadowRoot ?? frame.attachShadow({ mode: 'open' });
    })
], View2D, "shadowRoot", void 0);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmlldzJELmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbXBvbmVudHMvVmlldzJELnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLE9BQU8sRUFBQyxJQUFJLEVBQVksTUFBTSxRQUFRLENBQUM7QUFDdkMsT0FBTyxFQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDOUMsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBRWxELE9BQU8sRUFBQyxJQUFJLEVBQUMsTUFBTSxvQ0FBb0MsQ0FBQztBQU14RCxNQUFNLE9BQU8sTUFBTyxTQUFRLElBQUk7SUEwQjlCLFlBQW1CLEtBQWtCO1FBQ25DLEtBQUssQ0FBQztZQUNKLFNBQVMsRUFBRSxJQUFJO1lBQ2YsVUFBVSxFQUFFLFFBQVE7WUFDcEIsUUFBUSxFQUFFLEVBQUU7WUFDWixVQUFVLEVBQUUsTUFBTTtZQUNsQixRQUFRLEVBQUUsS0FBSztZQUNmLFNBQVMsRUFBRSxRQUFRO1lBQ25CLEdBQUcsS0FBSztTQUNULENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO1FBRW5CLE1BQU0sQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN2QyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7SUFDbkIsQ0FBQztJQUVrQixnQkFBZ0I7UUFDakMsYUFBYTtJQUNmLENBQUM7SUFFZSxPQUFPO1FBQ3JCLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUN0QixLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDbEIsQ0FBQztJQUVlLE1BQU0sQ0FBQyxPQUFpQztRQUN0RCxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDcEIsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFDeEIsS0FBSyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUN4QixDQUFDO0lBRWtCLG1CQUFtQjtRQUNwQyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7SUFDdEIsQ0FBQztJQUVrQixpQkFBaUI7UUFDbEMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO0lBQ25CLENBQUM7SUFFZSxJQUFJO1FBQ2xCLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztDQUNGO0FBL0NDO0lBRkMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUM7SUFDN0IsTUFBTSxFQUFFOzZDQUNnRTtBQUd6RTtJQURDLE1BQU0sRUFBRTt5Q0FDcUQ7QUFQaEQ7SUFoQmIsSUFBSSxDQUFDLEdBQUcsRUFBRTtRQUNULE1BQU0sT0FBTyxHQUFHLHdCQUF3QixDQUFDO1FBQ3pDLElBQUksS0FBSyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQWlCLElBQUksT0FBTyxFQUFFLENBQUMsQ0FBQztRQUNsRSxJQUFJLENBQUMsS0FBSyxFQUFFO1lBQ1YsS0FBSyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDdEMsS0FBSyxDQUFDLEVBQUUsR0FBRyxPQUFPLENBQUM7WUFDbkIsS0FBSyxDQUFDLEtBQUssQ0FBQyxRQUFRLEdBQUcsVUFBVSxDQUFDO1lBQ2xDLEtBQUssQ0FBQyxLQUFLLENBQUMsYUFBYSxHQUFHLE1BQU0sQ0FBQztZQUNuQyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7WUFDdEIsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDO1lBQ3ZCLEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLEdBQUcsQ0FBQztZQUMxQixLQUFLLENBQUMsS0FBSyxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7WUFDaEMsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDOUI7UUFDRCxPQUFPLEtBQUssQ0FBQyxVQUFVLElBQUksS0FBSyxDQUFDLFlBQVksQ0FBQyxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO0lBQ2hFLENBQUMsQ0FBQztnQ0FDbUMifQ==