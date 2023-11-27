import { PlaybackManager, PlaybackState } from './PlaybackManager';
import { AudioManager } from '../media';
import { clamp } from '../tweening';
import { AsyncEventDispatcher, EventDispatcher, ValueDispatcher, } from '../events';
import { Vector2 } from '../types';
import { PlaybackStatus } from './PlaybackStatus';
import { Semaphore } from '../utils';
import { EditableTimeEvents } from '../scenes/timeEvents';
const MAX_AUDIO_DESYNC = 1 / 50;
/**
 * The player logic used by the editor and embeddable player.
 *
 * @remarks
 * This class builds on top of the `PlaybackManager` to provide a simple
 * interface similar to other media players. It plays through the animation
 * using a real-time update loop and optionally synchronises it with audio.
 */
export class Player {
    /**
     * Triggered during each iteration of the update loop when the frame is ready
     * to be rendered.
     *
     * @remarks
     * Player does not perform any rendering on its own. For the animation to be
     * visible, another class must subscribe to this event and perform the
     * rendering itself. {@link Stage} can be used to display the animation.
     *
     * @eventProperty
     */
    get onRender() {
        return this.render.subscribable;
    }
    get onStateChanged() {
        return this.playerState.subscribable;
    }
    get onFrameChanged() {
        return this.frame.subscribable;
    }
    get onDurationChanged() {
        return this.duration.subscribable;
    }
    /**
     * Triggered right after recalculation finishes.
     *
     * @remarks
     * Can be used to provide visual feedback.
     *
     * @eventProperty
     */
    get onRecalculated() {
        return this.recalculated.subscribable;
    }
    get startFrame() {
        return Math.min(this.playback.duration, this.status.secondsToFrames(this.startTime));
    }
    get endFrame() {
        return Math.min(this.playback.duration, this.status.secondsToFrames(this.endTime));
    }
    get finished() {
        return this.playback.finished || this.playback.frame >= this.endFrame;
    }
    constructor(project, settings = {}, initialState = {}, initialFrame = -1) {
        this.project = project;
        this.settings = settings;
        this.initialState = initialState;
        this.initialFrame = initialFrame;
        this.render = new AsyncEventDispatcher();
        this.frame = new ValueDispatcher(0);
        this.duration = new ValueDispatcher(0);
        this.recalculated = new EventDispatcher();
        this.lock = new Semaphore();
        this.startTime = 0;
        this.endTime = Infinity;
        this.requestId = null;
        this.renderTime = 0;
        this.requestedSeek = -1;
        this.requestedRecalculation = true;
        this.active = false;
        this.playerState = new ValueDispatcher({
            loop: true,
            muted: true,
            speed: 1,
            ...initialState,
            paused: true,
        });
        this.requestedSeek = initialFrame;
        this.logger = this.project.logger;
        this.playback = new PlaybackManager();
        this.status = new PlaybackStatus(this.playback);
        this.audio = new AudioManager(this.logger);
        this.size = settings.size ?? new Vector2(1920, 1080);
        this.resolutionScale = settings.resolutionScale ?? 1;
        this.startTime = settings.range?.[0] ?? 0;
        this.endTime = settings.range?.[1] ?? Infinity;
        this.playback.fps = settings.fps ?? 60;
        this.audio.setOffset(settings.audioOffset ?? 0);
        if (project.audio) {
            this.audio.setSource(project.audio);
        }
        const scenes = [];
        for (const description of project.scenes) {
            const scene = new description.klass({
                ...description,
                playback: this.status,
                logger: this.project.logger,
                size: this.size,
                resolutionScale: this.resolutionScale,
                timeEventsClass: EditableTimeEvents,
            });
            description.onReplaced?.subscribe(description => {
                scene.reload(description);
            }, false);
            scene.onReloaded.subscribe(() => this.requestRecalculation());
            scene.variables.updateSignals(project.variables ?? {});
            scenes.push(scene);
        }
        this.playback.setup(scenes);
        this.activate();
    }
    async configure(settings) {
        await this.lock.acquire();
        let frame = this.playback.frame;
        let recalculate = false;
        this.startTime = settings.range[0];
        this.endTime = settings.range[1];
        if (this.playback.fps !== settings.fps) {
            const ratio = settings.fps / this.playback.fps;
            this.playback.fps = settings.fps;
            frame = Math.floor(frame * ratio);
            recalculate = true;
        }
        if (!settings.size.exactlyEquals(this.size) ||
            settings.resolutionScale !== this.resolutionScale) {
            this.size = settings.size;
            this.resolutionScale = settings.resolutionScale;
            this.playback.reload({
                size: this.size,
                resolutionScale: this.resolutionScale,
            });
        }
        if (settings.audioOffset !== undefined) {
            this.audio.setOffset(settings.audioOffset);
        }
        this.lock.release();
        if (recalculate) {
            this.playback.reload();
            this.frame.current = frame;
            this.requestRecalculation();
            this.requestedSeek = frame;
        }
    }
    /**
     * Whether the given frame is inside the animation range.
     *
     * @param frame - The frame to check.
     */
    isInRange(frame) {
        return frame >= 0 && frame <= this.playback.duration;
    }
    /**
     * Whether the given frame is inside the user-defined range.
     *
     * @param frame - The frame to check.
     */
    isInUserRange(frame) {
        return frame >= this.startFrame && frame <= this.endFrame;
    }
    requestSeek(value) {
        this.requestedSeek = this.clampRange(value);
    }
    requestPreviousFrame() {
        this.requestedSeek = this.frame.current - this.playback.speed;
    }
    requestNextFrame() {
        this.requestedSeek = this.frame.current + this.playback.speed;
    }
    requestReset() {
        this.requestedSeek = 0;
    }
    toggleLoop(value = !this.playerState.current.loop) {
        if (value !== this.playerState.current.loop) {
            this.playerState.current = {
                ...this.playerState.current,
                loop: value,
            };
        }
    }
    togglePlayback(value = this.playerState.current.paused) {
        if (value === this.playerState.current.paused) {
            this.playerState.current = {
                ...this.playerState.current,
                paused: !value,
            };
            // hitting play after the animation has finished should reset the
            // playback, even if looping is disabled.
            if (value &&
                !this.playerState.current.loop &&
                this.playback.frame === this.playback.duration) {
                this.requestReset();
            }
        }
    }
    toggleAudio(value = this.playerState.current.muted) {
        if (value === this.playerState.current.muted) {
            this.playerState.current = {
                ...this.playerState.current,
                muted: !value,
            };
        }
    }
    setSpeed(value) {
        if (value !== this.playerState.current.speed) {
            this.playback.speed = value;
            this.playback.reload();
            this.playerState.current = {
                ...this.playerState.current,
                speed: value,
            };
            this.requestRecalculation();
        }
    }
    setVariables(variables) {
        for (const scene of this.playback.onScenesRecalculated.current) {
            scene.variables.updateSignals(variables);
        }
    }
    /**
     * Activate the player.
     *
     * @remarks
     * A player needs to be active in order for the update loop to run. Each
     * player is active by default.
     */
    activate() {
        this.active = true;
        this.request();
    }
    /**
     * Deactivate the player.
     *
     * @remarks
     * Deactivating the player prevents its update loop from running. This should
     * be done before disposing the player, to prevent it from running in the
     * background.
     *
     * Just pausing the player does not stop the loop.
     */
    deactivate() {
        this.active = false;
        if (this.requestId !== null) {
            cancelAnimationFrame(this.requestId);
            this.requestId = null;
        }
    }
    requestRecalculation() {
        this.requestedRecalculation = true;
        this.request();
    }
    async prepare() {
        const state = {
            ...this.playerState.current,
            seek: this.requestedSeek,
        };
        this.requestedSeek = -1;
        // Recalculate the project if necessary
        if (this.requestedRecalculation) {
            if (state.seek < 0) {
                state.seek = this.playback.frame;
            }
            try {
                await this.playback.recalculate();
                this.duration.current = this.playback.frame;
                this.recalculated.dispatch();
            }
            catch (e) {
                this.requestSeek(state.seek);
                throw e;
            }
            finally {
                this.requestedRecalculation = false;
            }
        }
        // Pause if reached the end or the range is 0
        if ((!state.loop && this.finished && !state.paused && state.seek < 0) ||
            this.endFrame === this.startFrame) {
            this.togglePlayback(false);
            state.paused = true;
        }
        // Seek to the beginning if looping is enabled
        if (state.loop &&
            (state.seek > this.endFrame || (this.finished && !state.paused)) &&
            this.startFrame !== this.endTime) {
            state.seek = this.startFrame;
        }
        // Pause / play audio.
        const audioPaused = state.paused || this.finished || !this.audio.isInRange(this.status.time);
        if (await this.audio.setPaused(audioPaused)) {
            this.syncAudio(-3);
        }
        this.audio.setMuted(state.muted);
        return state;
    }
    async run() {
        const state = await this.prepare();
        const previousState = this.playback.state;
        this.playback.state = state.paused
            ? PlaybackState.Paused
            : PlaybackState.Playing;
        // Seek to the given frame
        if (state.seek >= 0 || !this.isInUserRange(this.status.frame)) {
            const seekFrame = state.seek < 0 ? this.status.frame : state.seek;
            const clampedFrame = this.clampRange(seekFrame);
            this.logger.profile('seek time');
            await this.playback.seek(clampedFrame);
            this.logger.profile('seek time');
            this.syncAudio(-3);
        }
        // Do nothing if paused or is ahead of the audio.
        else if (state.paused ||
            (state.speed === 1 &&
                this.audio.isReady() &&
                this.audio.isInRange(this.status.time) &&
                this.audio.getTime() < this.status.time)) {
            if (state.paused && previousState !== PlaybackState.Paused) {
                await this.render.dispatch();
            }
            // Sync the audio if the animation is too far ahead.
            if (!state.paused &&
                this.status.time > this.audio.getTime() + MAX_AUDIO_DESYNC) {
                this.syncAudio();
            }
            this.request();
            return;
        }
        // Seek to synchronize animation with audio.
        else if (this.audio.isReady() &&
            state.speed === 1 &&
            this.audio.isInRange(this.status.time) &&
            this.status.framesToSeconds(this.playback.frame + 1) <
                this.audio.getTime() - MAX_AUDIO_DESYNC) {
            const seekFrame = this.status.secondsToFrames(this.audio.getTime());
            await this.playback.seek(seekFrame);
        }
        // Simply move forward one frame
        else if (this.status.frame < this.endFrame) {
            await this.playback.progress();
            if (state.speed !== 1) {
                this.syncAudio();
            }
        }
        // Pause if a new slide has just started.
        if (!state.paused && this.playback.currentScene.slides.isWaiting()) {
            this.togglePlayback(false);
            state.paused = true;
        }
        // Draw the project
        await this.render.dispatch();
        this.frame.current = this.playback.frame;
        this.request();
    }
    request() {
        if (!this.active)
            return;
        this.requestId ?? (this.requestId = requestAnimationFrame(async (time) => {
            this.requestId = null;
            if (time - this.renderTime >= 1000 / (this.status.fps + 5)) {
                this.renderTime = time;
                await this.lock.acquire();
                try {
                    await this.run();
                }
                catch (e) {
                    this.logger.error(e);
                }
                this.lock.release();
            }
            else {
                this.request();
            }
        }));
    }
    clampRange(frame) {
        return clamp(this.startFrame, this.endFrame, frame);
    }
    syncAudio(frameOffset = 0) {
        this.audio.setTime(this.status.framesToSeconds(this.playback.frame + frameOffset));
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxheWVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2FwcC9QbGF5ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFDLGVBQWUsRUFBRSxhQUFhLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUNqRSxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sVUFBVSxDQUFDO0FBQ3RDLE9BQU8sRUFBQyxLQUFLLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFFbEMsT0FBTyxFQUNMLG9CQUFvQixFQUNwQixlQUFlLEVBQ2YsZUFBZSxHQUNoQixNQUFNLFdBQVcsQ0FBQztBQUVuQixPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sVUFBVSxDQUFDO0FBQ2pDLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUNoRCxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sVUFBVSxDQUFDO0FBQ25DLE9BQU8sRUFBQyxrQkFBa0IsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBaUJ4RCxNQUFNLGdCQUFnQixHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7QUFFaEM7Ozs7Ozs7R0FPRztBQUNILE1BQU0sT0FBTyxNQUFNO0lBQ2pCOzs7Ozs7Ozs7O09BVUc7SUFDSCxJQUFXLFFBQVE7UUFDakIsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQztJQUNsQyxDQUFDO0lBR0QsSUFBVyxjQUFjO1FBQ3ZCLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUM7SUFDdkMsQ0FBQztJQUdELElBQVcsY0FBYztRQUN2QixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDO0lBQ2pDLENBQUM7SUFHRCxJQUFXLGlCQUFpQjtRQUMxQixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDO0lBQ3BDLENBQUM7SUFHRDs7Ozs7OztPQU9HO0lBQ0gsSUFBVyxjQUFjO1FBQ3ZCLE9BQU8sSUFBSSxDQUFD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