import { decorate, threadable } from '../decorators';
import { EventDispatcher, ValueDispatcher } from '../events';
import { DependencyContext } from '../signals';
import { isPromisable, isPromise, threads, } from '../threading';
import { BBox } from '../types';
import { endPlayback, endScene, startPlayback, startScene } from '../utils';
import { LifecycleEvents } from './LifecycleEvents';
import { Random } from './Random';
import { SceneState } from './SceneState';
import { Slides } from './Slides';
import { Variables } from './Variables';
/**
 * The default implementation of the {@link Scene} interface.
 *
 * Uses generators to control the animation.
 */
export class GeneratorScene {
    get firstFrame() {
        return this.cache.current.firstFrame;
    }
    get lastFrame() {
        return this.firstFrame + this.cache.current.duration;
    }
    get onCacheChanged() {
        return this.cache.subscribable;
    }
    get onReloaded() {
        return this.reloaded.subscribable;
    }
    get onRecalculated() {
        return this.recalculated.subscribable;
    }
    get onThreadChanged() {
        return this.thread.subscribable;
    }
    get onRenderLifecycle() {
        return this.renderLifecycle.subscribable;
    }
    get onReset() {
        return this.afterReset.subscribable;
    }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    get LifecycleEvents() {
        this.logger.warn('LifecycleEvents is deprecated. Use lifecycleEvents instead.');
        return this.lifecycleEvents;
    }
    get previous() {
        return this.previousScene;
    }
    constructor(description) {
        this.cache = new ValueDispatcher({
            firstFrame: 0,
            transitionDuration: 0,
            duration: 0,
            lastFrame: 0,
        });
        this.reloaded = new EventDispatcher();
        this.recalculated = new EventDispatcher();
        this.thread = new ValueDispatcher(null);
        this.renderLifecycle = new EventDispatcher();
        this.afterReset = new EventDispatcher();
        this.lifecycleEvents = new LifecycleEvents(this);
        this.previousScene = null;
        this.runner = null;
        this.state = SceneState.Initial;
        this.cached = false;
        this.counters = {};
        this.name = description.name;
        this.size = description.size;
        this.resolutionScale = description.resolutionScale;
        this.logger = description.logger;
        this.playback = description.playback;
        this.meta = description.meta;
        this.runnerFactory = description.config;
        this.creationStack = description.stack;
        decorate(this.runnerFactory, threadable(this.name));
        this.timeEvents = new description.timeEventsClass(this);
        this.variables = new Variables(this);
        this.slides = new Slides(this);
        this.random = new Random(this.meta.seed.get());
        this.previousOnTop = false;
    }
    /**
     * Update the view.
     *
     * Invoked after each step of the main generator.
     * Can be used for calculating layout.
     *
     * Can modify the state of the view.
     */
    update() {
        // do nothing
    }
    async render(context) {
        let iterations = 0;
        do {
            iterations++;
            await DependencyContext.consumePromises();
            context.save();
            const box = BBox.fromSizeCentered(this.getSize());
            context.clearRect(box.x, box.y, box.width, box.height);
            this.execute(() => this.draw(context));
            context.restore();
        } while (DependencyContext.hasPromises() && iterations < 10);
        if (iterations > 1) {
            this.logger.debug(`render iterations: ${iterations}`);
        }
    }
    reload({ config, size, stack, resolutionScale, } = {}) {
        if (config) {
            this.runnerFactory = config;
        }
        if (size) {
            this.size = size;
        }
        if (resolutionScale) {
            this.resolutionScale = resolutionScale;
        }
        if (stack) {
            this.creationStack = stack;
        }
        this.cached = false;
        this.reloaded.dispatch();
    }
    async recalculate(setFrame) {
        const cached = this.cache.current;
        cached.firstFrame = this.playback.frame;
        cached.lastFrame = cached.firstFrame + cached.duration;
        if (this.isCached()) {
            setFrame(cached.lastFrame);
            this.cache.current = { ...cached };
            return;
        }
        cached.transitionDuration = -1;
        await this.reset();
        while (!this.canTransitionOut()) {
            if (cached.transitionDuration < 0 &&
                this.state === SceneState.AfterTransitionIn) {
                cached.transitionDuration = this.playback.frame - cached.firstFrame;
            }
            setFrame(this.playback.frame + 1);
            await this.next();
        }
        if (cached.transitionDuration === -1) {
            cached.transitionDuration = 0;
        }
        cached.lastFrame = this.playback.frame;
        cached.duration = cached.lastFrame - cached.firstFrame;
        // Prevent the page from becoming unresponsive.
        await new Promise(resolve => setTimeout(resolve, 0));
        this.cached = true;
        this.cache.current = { ...cached };
        this.recalculated.dispatch();
    }
    async next() {
        if (!this.runner) {
            return;
        }
        let result = this.execute(() => this.runner.next());
        this.update();
        while (result.value) {
            if (isPromisable(result.value)) {
                const value = await result.value.toPromise();
                result = this.execute(() => this.runner.next(value));
            }
            else if (isPromise(result.value)) {
                const value = await result.value;
                result = this.execute(() => this.runner.next(value));
            }
            else {
                this.logger.warn({
                    message: 'Invalid value yielded by the scene.',
                    object: result.value,
                });
                result = this.execute(() => this.runner.next(result.value));
            }
            this.update();
        }
        if (DependencyContext.hasPromises()) {
            const promises = await DependencyContext.consumePromises();
            this.logger.error({
                message: 'Tried to access an asynchronous property before the node was ready. ' +
                    'Make sure to yield the node before accessing the property.',
                stack: promises[0].stack,
                inspect: promises[0].owner?.key ?? undefined,
            });
        }
        if (result.done) {
            this.state = SceneState.Finished;
        }
    }
    async reset(previousScene = null) {
        this.counters = {};
        this.previousScene = previousScene;
        this.previousOnTop = false;
        this.random = new Random(this.meta.seed.get());
        this.runner = threads(() => this.runnerFactory(this.getView()), thread => {
            this.thread.current = thread;
        });
        this.state = SceneState.AfterTransitionIn;
        this.afterReset.dispatch();
        await this.next();
    }
    getSize() {
        return this.size;
    }
    isAfterTransitionIn() {
        return this.state === SceneState.AfterTransitionIn;
    }
    canTransitionOut() {
        return (this.state === SceneState.CanTransitionOut ||
            this.state === SceneState.Finished);
    }
    isFinished() {
        return this.state === SceneState.Finished;
    }
    enterInitial() {
        if (this.state === SceneState.AfterTransitionIn) {
            this.state = SceneState.Initial;
        }
        else {
            this.logger.warn(`Scene ${this.name} entered initial in an unexpected state: ${this.state}`);
        }
    }
    enterAfterTransitionIn() {
        if (this.state === SceneState.Initial) {
            this.state = SceneState.AfterTransitionIn;
        }
        else {
            this.logger.warn(`Scene ${this.name} transitioned in an unexpected state: ${this.state}`);
        }
    }
    enterCanTransitionOut() {
        if (this.state === SceneState.AfterTransitionIn ||
            this.state === SceneState.Initial // only on recalculate
        ) {
            this.state = SceneState.CanTransitionOut;
        }
        else {
            this.logger.warn(`Scene ${this.name} was marked as finished in an unexpected state: ${this.state}`);
        }
    }
    isCached() {
        return this.cached;
    }
    /**
     * Invoke the given callback in the context of this scene.
     *
     * @remarks
     * This method makes sure that the context of this scene is globally available
     * during the execution of the callback.
     *
     * @param callback - The callback to invoke.
     */
    execute(callback) {
        let result;
        startScene(this);
        startPlayback(this.playback);
        try {
            result = callback();
        }
        finally {
            endPlayback(this.playback);
            endScene(this);
        }
        return result;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2VuZXJhdG9yU2NlbmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2NlbmVzL0dlbmVyYXRvclNjZW5lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE9BQU8sRUFBQyxRQUFRLEVBQUUsVUFBVSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ25ELE9BQU8sRUFBQyxlQUFlLEVBQUUsZUFBZSxFQUFDLE1BQU0sV0FBVyxDQUFDO0FBQzNELE9BQU8sRUFBQyxpQkFBaUIsRUFBYyxNQUFNLFlBQVksQ0FBQztBQUMxRCxPQUFPLEVBQ0wsWUFBWSxFQUNaLFNBQVMsRUFHVCxPQUFPLEdBQ1IsTUFBTSxjQUFjLENBQUM7QUFDdEIsT0FBTyxFQUFDLElBQUksRUFBVSxNQUFNLFVBQVUsQ0FBQztBQUN2QyxPQUFPLEVBQUMsV0FBVyxFQUFFLFFBQVEsRUFBRSxhQUFhLEVBQUUsVUFBVSxFQUFDLE1BQU0sVUFBVSxDQUFDO0FBQzFFLE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUNsRCxPQUFPLEVBQUMsTUFBTSxFQUFDLE1BQU0sVUFBVSxDQUFDO0FBU2hDLE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFDeEMsT0FBTyxFQUFDLE1BQU0sRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUdoQyxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBTXRDOzs7O0dBSUc7QUFDSCxNQUFNLE9BQWdCLGNBQWM7SUFjbEMsSUFBVyxVQUFVO1FBQ25CLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDO0lBQ3ZDLENBQUM7SUFFRCxJQUFXLFNBQVM7UUFDbEIsT0FBTyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQztJQUN2RCxDQUFDO0lBRUQsSUFBVyxjQUFjO1FBQ3ZCLE9BQU8sSUFBSSxDQUFDLEtB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