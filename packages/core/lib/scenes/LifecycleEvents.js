import { EventDispatcher } from '../events';
import { SceneRenderEvent } from './Scene';
/**
 * Lifecycle events for {@link Scene} that are cleared on every reset.
 */
export class LifecycleEvents {
    get onBeforeRender() {
        return this.beforeRender.subscribable;
    }
    get onBeginRender() {
        return this.beginRender.subscribable;
    }
    get onFinishRender() {
        return this.finishRender.subscribable;
    }
    get onAfterRender() {
        return this.afterRender.subscribable;
    }
    constructor(scene) {
        this.scene = scene;
        this.beforeRender = new EventDispatcher();
        this.beginRender = new EventDispatcher();
        this.finishRender = new EventDispatcher();
        this.afterRender = new EventDispatcher();
        this.scene.onRenderLifecycle.subscribe(([event, ctx]) => {
            switch (event) {
                case SceneRenderEvent.BeforeRender:
                    return this.beforeRender.dispatch(ctx);
                case SceneRenderEvent.BeginRender:
                    return this.beginRender.dispatch(ctx);
                case SceneRenderEvent.FinishRender:
                    return this.finishRender.dispatch(ctx);
                case SceneRenderEvent.AfterRender:
                    return this.afterRender.dispatch(ctx);
            }
        });
        this.scene.onReset.subscribe(() => {
            this.beforeRender.clear();
            this.beginRender.clear();
            this.finishRender.clear();
            this.afterRender.clear();
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTGlmZWN5Y2xlRXZlbnRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3NjZW5lcy9MaWZlY3ljbGVFdmVudHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLFdBQVcsQ0FBQztBQUMxQyxPQUFPLEVBQVEsZ0JBQWdCLEVBQUMsTUFBTSxTQUFTLENBQUM7QUFFaEQ7O0dBRUc7QUFDSCxNQUFNLE9BQU8sZUFBZTtJQUMxQixJQUFXLGNBQWM7UUFDdkIsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLFlBQVksQ0FBQztJQUN4QyxDQUFDO0lBSUQsSUFBVyxhQUFhO1FBQ3RCLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUM7SUFDdkMsQ0FBQztJQUlELElBQVcsY0FBYztRQUN2QixPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDO0lBQ3hDLENBQUM7SUFJRCxJQUFXLGFBQWE7UUFDdEIsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQztJQUN2QyxDQUFDO0lBSUQsWUFBb0MsS0FBWTtRQUFaLFVBQUssR0FBTCxLQUFLLENBQU87UUFyQjdCLGlCQUFZLEdBQzdCLElBQUksZUFBZSxFQUE0QixDQUFDO1FBSy9CLGdCQUFXLEdBQzVCLElBQUksZUFBZSxFQUE0QixDQUFDO1FBSy9CLGlCQUFZLEdBQzdCLElBQUksZUFBZSxFQUE0QixDQUFDO1FBSy9CLGdCQUFXLEdBQzVCLElBQUksZUFBZSxFQUE0QixDQUFDO1FBR2hELElBQUksQ0FBQyxLQUFLLENBQUMsaUJBQWlCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLEVBQUUsRUFBRTtZQUN0RCxRQUFRLEtBQUssRUFBRTtnQkFDYixLQUFLLGdCQUFnQixDQUFDLFlBQVk7b0JBQ2hDLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ3pDLEtBQUssZ0JBQWdCLENBQUMsV0FBVztvQkFDL0IsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDeEMsS0FBSyxnQkFBZ0IsQ0FBQyxZQUFZO29CQUNoQyxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUN6QyxLQUFLLGdCQUFnQixDQUFDLFdBQVc7b0JBQy9CLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDekM7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUU7WUFDaEMsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUMxQixJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ3pCLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDMUIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUMzQixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRiJ9