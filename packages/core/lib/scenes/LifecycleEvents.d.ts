import { CanvasRenderingContext2D } from 'skia-canvas';
import { EventDispatcher } from '../events';
import { Scene } from './Scene';
/**
 * Lifecycle events for {@link Scene} that are cleared on every reset.
 */
export declare class LifecycleEvents {
    private readonly scene;
    get onBeforeRender(): import("../events").Subscribable<CanvasRenderingContext2D, import("../events").EventHandler<CanvasRenderingContext2D>>;
    protected readonly beforeRender: EventDispatcher<CanvasRenderingContext2D>;
    get onBeginRender(): import("../events").Subscribable<CanvasRenderingContext2D, import("../events").EventHandler<CanvasRenderingContext2D>>;
    protected readonly beginRender: EventDispatcher<CanvasRenderingContext2D>;
    get onFinishRender(): import("../events").Subscribable<CanvasRenderingContext2D, import("../events").EventHandler<CanvasRenderingContext2D>>;
    protected readonly finishRender: EventDispatcher<CanvasRenderingContext2D>;
    get onAfterRender(): import("../events").Subscribable<CanvasRenderingContext2D, import("../events").EventHandler<CanvasRenderingContext2D>>;
    protected readonly afterRender: EventDispatcher<CanvasRenderingContext2D>;
    constructor(scene: Scene);
}
//# sourceMappingURL=LifecycleEvents.d.ts.map