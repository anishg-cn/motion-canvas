import { PlaybackManager, PlaybackState } from './PlaybackManager';
import { Stage } from './Stage';
import { ValueDispatcher } from '../events';
import { Vector2 } from '../types';
import { PlaybackStatus } from './PlaybackStatus';
import { Semaphore } from '../utils';
import { ReadOnlyTimeEvents } from '../scenes/timeEvents';
export var PresenterState;
(function (PresenterState) {
    PresenterState[PresenterState["Initial"] = 0] = "Initial";
    PresenterState[PresenterState["Working"] = 1] = "Working";
    PresenterState[PresenterState["Aborting"] = 2] = "Aborting";
})(PresenterState || (PresenterState = {}));
const NextSlide = Symbol('@motion-canvas/core/app/NextSlide');
const PreviousSlide = Symbol('@motion-canvas/core/app/PreviousSlide');
export class Presenter {
    get onStateChanged() {
        return this.state.subscribable;
    }
    get onInfoChanged() {
        return this.info.subscribable;
    }
    get onSlidesChanged() {
        return this.slides.subscribable;
    }
    constructor(project) {
        this.project = project;
        this.state = new ValueDispatcher(PresenterState.Initial);
        this.info = new ValueDispatcher({
            currentSlideId: null,
            nextSlideId: null,
            hasNext: false,
            hasPrevious: false,
            isWaiting: false,
            index: null,
            count: 0,
        });
        this.slides = new ValueDispatcher([]);
        this.stage = new Stage();
        this.lock = new Semaphore();
        this.abortController = null;
        this.renderTime = 0;
        this.requestId = null;
        this.requestedResume = false;
        this.requestedSlide = null;
        this.logger = project.logger;
        this.playback = new PlaybackManager();
        this.status = new PlaybackStatus(this.playback);
        const scenes = [];
        for (const description of project.scenes) {
            const scene = new description.klass({
                ...description,
                meta: description.meta.clone(),
                logger: this.logger,
                playback: this.status,
                size: new Vector2(1920, 1080),
                resolutionScale: 1,
                timeEventsClass: ReadOnlyTimeEvents,
            });
            scenes.push(scene);
        }
        this.playback.setup(scenes);
    }
    /**
     * Present the animation.
     *
     * @param settings - The presentation settings.
     */
    async present(settings) {
        if (this.state.current !== PresenterState.Initial)
            return;
        await this.lock.acquire();
        this.state.current = PresenterState.Working;
        try {
            this.abortController = new AbortController();
            await this.run(settings, this.abortController.signal);
        }
        catch (e) {
            this.project.logger.error(e);
        }
        this.state.current = PresenterState.Initial;
        this.lock.release();
    }
    /**
     * Abort the ongoing presentation process.
     */
    abort() {
        if (this.state.current === PresenterState.Initial)
            return;
        this.abortController?.abort();
        this.state.current = PresenterState.Aborting;
    }
    /**
     * Resume the presentation if waiting for the next slide.
     */
    resume() {
        this.requestedResume = true;
    }
    requestFirstSlide() {
        const first = this.playback.slides[0];
        if (first) {
            this.requestedSlide = first.id;
        }
    }
    requestLastSlide() {
        const last = this.playback.slides.at(-1);
        if (last) {
            this.requestedSlide = last.id;
        }
    }
    requestPreviousSlide() {
        this.requestedSlide = PreviousSlide;
    }
    requestNextSlide() {
        this.requestedSlide = NextSlide;
    }
    requestSlide(id) {
        this.requestedSlide = id;
    }
    async run(settings, signal) {
        this.stage.configure(settings);
        this.playback.fps = settings.fps;
        await this.reloadScenes(settings);
        if (signal.aborted)
            return;
        this.playback.state = PlaybackState.Playing;
        await this.playback.recalculate();
        if (signal.aborted)
            return;
        this.slides.current = this.playback.slides;
        this.playback.state = PlaybackState.Presenting;
        await this.playback.reset();
        if (signal.aborted)
            return;
        if (settings.slide) {
            await this.playback.goTo(settings.slide);
            if (signal.aborted)
                return;
        }
        await new Promise(resolve => {
            signal.addEventListener('abort', resolve);
            this.request();
        });
    }
    async reloadScenes(settings) {
        for (let i = 0; i < this.project.scenes.length; i++) {
            const description = this.project.scenes[i];
            const scene = this.playback.onScenesRecalculated.current[i];
            scene.reload({
                config: description.onReplaced.current.config,
                size: settings.size,
                resolutionScale: settings.resolutionScale,
            });
            scene.meta.set(description.meta.get());
            scene.variables.updateSignals(this.project.variables ?? {});
        }
    }
    async loop() {
        const slide = this.requestedSlide;
        const resume = this.requestedResume;
        this.requestedResume = false;
        this.requestedSlide = null;
        // Resume the presentation
        if (resume) {
            this.playback.currentScene.slides.resume();
        }
        // Seek to the given slide
        if (slide !== null) {
            this.logger.profile('slide time');
            this.playback.state = PlaybackState.Playing;
            if (slide === PreviousSlide) {
                await this.playback.goBack();
            }
            else if (slide === NextSlide) {
                await this.playback.goForward();
            }
            else {
                await this.playback.goTo(slide);
            }
            this.logger.profile('slide time');
        }
        // Move forward one frame
        else if (!this.playback.finished) {
            this.playback.state = PlaybackState.Presenting;
            await this.playback.progress();
        }
        // Draw the project
        await this.stage.render(this.playback.currentScene, this.playback.previousScene);
        if (!this.abortController?.signal.aborted) {
            this.updateInfo();
            this.request();
        }
    }
    request() {
        if (this.abortController?.signal.aborted) {
            return;
        }
        this.requestId ?? (this.requestId = requestAnimationFrame(async (time) => {
            this.requestId = null;
            if (time - this.renderTime >= 1000 / (this.status.fps + 5)) {
                this.renderTime = time;
                try {
                    await this.loop();
                }
                catch (e) {
                    this.logger.error(e);
                    this.abortController?.abort();
                }
            }
            else {
                this.request();
            }
        }));
    }
    updateInfo() {
        const slides = this.playback.currentScene.slides;
        const currentSlide = slides.getCurrent() ?? null;
        const index = this.playback.slides.indexOf(currentSlide);
        const info = {
            currentSlideId: currentSlide?.id ?? null,
            nextSlideId: this.playback.slides[index + 1]?.id ?? null,
            hasNext: index !== null && index < this.playback.slides.length - 1,
            hasPrevious: index !== null && index > 0,
            isWaiting: slides.isWaiting(),
            count: this.playback.slides.length,
            index,
        };
        for (const [key, value] of Object.entries(info)) {
            if (this.info.current[key] !== value) {
                this.info.current = info;
                break;
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJlc2VudGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2FwcC9QcmVzZW50ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBR0EsT0FBTyxFQUFDLGVBQWUsRUFBRSxhQUFhLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUNqRSxPQUFPLEVBQUMsS0FBSyxFQUFnQixNQUFNLFNBQVMsQ0FBQztBQUM3QyxPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0sV0FBVyxDQUFDO0FBQzFDLE9BQU8sRUFBQyxPQUFPLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFDakMsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBQ2hELE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFDbkMsT0FBTyxFQUFDLGtCQUFrQixFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFrQnhELE1BQU0sQ0FBTixJQUFZLGNBSVg7QUFKRCxXQUFZLGNBQWM7SUFDeEIseURBQU8sQ0FBQTtJQUNQLHlEQUFPLENBQUE7SUFDUCwyREFBUSxDQUFBO0FBQ1YsQ0FBQyxFQUpXLGNBQWMsS0FBZCxjQUFjLFFBSXpCO0FBRUQsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLG1DQUFtQyxDQUFDLENBQUM7QUFDOUQsTUFBTSxhQUFhLEdBQUcsTUFBTSxDQUFDLHVDQUF1QyxDQUFDLENBQUM7QUFFdEUsTUFBTSxPQUFPLFNBQVM7SUFDcEIsSUFBVyxjQUFjO1FBQ3ZCLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUM7SUFDakMsQ0FBQztJQUdELElBQVcsYUFBYTtRQUN0QixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDO0lBQ2hDLENBQUM7SUFXRCxJQUFXLGVBQWU7UUFDeEIsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQztJQUNsQyxDQUFDO0lBbUJELFlBQTJCLE9BQWdCO1FBQWhCLFlBQU8sR0FBUCxP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