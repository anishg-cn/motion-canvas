import { EventDispatcher, ValueDispatcher } from '../events';
import { ReadOnlyTimeEvents } from '../scenes/timeEvents';
import { clampRemap } from '../tweening';
import { Vector2 } from '../types';
import { Semaphore } from '../utils';
import { PlaybackManager, PlaybackState } from './PlaybackManager';
import { PlaybackStatus } from './PlaybackStatus';
import { Stage } from './Stage';
import { TimeEstimator } from './TimeEstimator';
export var RendererState;
(function (RendererState) {
    RendererState[RendererState["Initial"] = 0] = "Initial";
    RendererState[RendererState["Working"] = 1] = "Working";
    RendererState[RendererState["Aborting"] = 2] = "Aborting";
})(RendererState || (RendererState = {}));
export var RendererResult;
(function (RendererResult) {
    RendererResult[RendererResult["Success"] = 0] = "Success";
    RendererResult[RendererResult["Error"] = 1] = "Error";
    RendererResult[RendererResult["Aborted"] = 2] = "Aborted";
})(RendererResult || (RendererResult = {}));
/**
 * The rendering logic used by the editor to export animations.
 *
 * @remarks
 * This class uses the `PlaybackManager` to render animations. In contrast to a
 * player, a renderer does not use an update loop. It plays through the
 * animation as fast as it can, occasionally pausing to keep the UI responsive.
 *
 * The actual exporting is outsourced to an {@link Exporter}.
 */
export class Renderer {
    get onStateChanged() {
        return this.state.subscribable;
    }
    get onFinished() {
        return this.finished.subscribable;
    }
    get onFrameChanged() {
        return this.frame.subscribable;
    }
    constructor(project) {
        this.project = project;
        this.state = new ValueDispatcher(RendererState.Initial);
        this.finished = new EventDispatcher();
        this.frame = new ValueDispatcher(0);
        this.stage = new Stage();
        this.estimator = new TimeEstimator();
        this.lock = new Semaphore();
        this.exporter = null;
        this.abortController = null;
        this.playback = new PlaybackManager();
        this.status = new PlaybackStatus(this.playback);
        const scenes = [];
        for (const description of project.scenes) {
            const scene = new description.klass({
                ...description,
                meta: description.meta.clone(),
                logger: this.project.logger,
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
     * Render the animation using the provided settings.
     *
     * @param settings - The rendering settings.
     */
    async render(settings) {
        if (this.state.current !== RendererState.Initial)
            return;
        await this.lock.acquire();
        this.estimator.reset();
        this.state.current = RendererState.Working;
        let result;
        try {
            this.abortController = new AbortController();
            result = await this.run(settings, this.abortController.signal);
        }
        catch (e) {
            this.project.logger.error(e);
            result = RendererResult.Error;
            if (this.exporter) {
                try {
                    await this.exporter.stop?.(result);
                }
                catch (_) {
                    // do nothing
                }
                this.exporter = null;
            }
        }
        this.estimator.update(1);
        this.state.current = RendererState.Initial;
        this.finished.dispatch(result);
        this.lock.release();
    }
    /**
     * Abort the ongoing render process.
     */
    abort() {
        if (this.state.current !== RendererState.Working)
            return;
        this.abortController?.abort();
        this.state.current = RendererState.Aborting;
    }
    /**
     * Export an individual frame.
     *
     * @remarks
     * This method always uses the default `ImageExporter`.
     *
     * @param settings - The rendering settings.
     * @param time - The timestamp to export.
     */
    async renderFrame(settings, time) {
        await this.lock.acquire();
        try {
            const frame = this.status.secondsToFrames(time);
            this.stage.configure(settings);
            this.playback.fps = settings.fps;
            this.playback.state = PlaybackState.Rendering;
            await this.reloadScenes(settings);
            await this.playback.reset();
            await this.playback.seek(frame);
            await this.stage.render(this.playback.currentScene, this.playback.previousScene);
            if (import.meta.hot) {
                const data = await this.stage.finalBuffer.toDataURL('png');
                import.meta.hot.send('motion-canvas:export', {
                    frame,
                    data,
                    mimeType: 'image/png',
                    subDirectories: ['still', this.project.name],
                });
            }
        }
        catch (e) {
            this.project.logger.error(e);
        }
        this.lock.release();
    }
    async run(settings, signal) {
        const exporterClass = this.project.meta.rendering.exporter.exporters.find(exporter => exporter.id === settings.exporter.name);
        if (!exporterClass) {
            this.project.logger.error(`Could not find the "${settings.exporter.name}" exporter.`);
            return RendererResult.Error;
        }
        this.exporter = await exporterClass.create(this.project, settings);
        if (this.exporter.configuration) {
            settings = {
                ...settings,
                ...((await this.exporter.configuration()) ?? {}),
            };
        }
        this.stage.configure(settings);
        this.playback.fps = settings.fps;
        this.playback.state = PlaybackState.Rendering;
        const from = this.status.secondsToFrames(settings.range[0]);
        this.frame.current = from;
        await this.reloadScenes(settings);
        await this.playback.recalculate();
        if (signal.aborted)
            return RendererResult.Aborted;
        await this.playback.reset();
        if (signal.aborted)
            return RendererResult.Aborted;
        const to = Math.min(this.playback.duration, this.status.secondsToFrames(settings.range[1]));
        await this.playback.seek(from);
        if (signal.aborted)
            return RendererResult.Aborted;
        await this.exporter.start?.();
        let lastRefresh = performance.now();
        let result = RendererResult.Success;
        try {
            this.estimator.reset(1 / (to - from));
            await this.exportFrame(signal);
            this.estimator.update(clampRemap(from, to, 0, 1, this.playback.frame));
            if (signal.aborted) {
                result = RendererResult.Aborted;
            }
            else {
                let finished = false;
                while (!finished) {
                    await this.playback.progress();
                    await this.exportFrame(signal);
                    this.estimator.update(clampRemap(from, to, 0, 1, this.playback.frame));
                    if (performance.now() - lastRefresh > 1 / 30) {
                        lastRefresh = performance.now();
                        await new Promise(resolve => setTimeout(resolve, 0));
                    }
                    if (this.playback.finished || this.playback.frame >= to) {
                        finished = true;
                    }
                    if (signal.aborted) {
                        result = RendererResult.Aborted;
                        finished = true;
                    }
                }
            }
        }
        catch (e) {
            this.project.logger.error(e);
            result = RendererResult.Error;
        }
        await this.exporter.stop?.(result);
        this.exporter = null;
        return result;
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
    async exportFrame(signal) {
        this.frame.current = this.playback.frame;
        await this.stage.render(this.playback.currentScene, this.playback.previousScene);
        const sceneFrame = this.playback.frame - this.playback.currentScene.firstFrame;
        await this.exporter.handleFrame(this.stage.finalBuffer, this.playback.frame, sceneFrame, this.playback.currentScene.name, signal);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVuZGVyZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvYXBwL1JlbmRlcmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBQyxlQUFlLEVBQUUsZUFBZSxFQUFDLE1BQU0sV0FBVyxDQUFDO0FBRTNELE9BQU8sRUFBQyxrQkFBa0IsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBQ3hELE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFDdkMsT0FBTyxFQUFDLE9BQU8sRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUNqQyxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sVUFBVSxDQUFDO0FBRW5DLE9BQU8sRUFBQyxlQUFlLEVBQUUsYUFBYSxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDakUsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBRWhELE9BQU8sRUFBQyxLQUFLLEVBQWdCLE1BQU0sU0FBUyxDQUFDO0FBQzdDLE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQVk5QyxNQUFNLENBQU4sSUFBWSxhQUlYO0FBSkQsV0FBWSxhQUFhO0lBQ3ZCLHVEQUFPLENBQUE7SUFDUCx1REFBTyxDQUFBO0lBQ1AseURBQVEsQ0FBQTtBQUNWLENBQUMsRUFKVyxhQUFhLEtBQWIsYUFBYSxRQUl4QjtBQUVELE1BQU0sQ0FBTixJQUFZLGNBSVg7QUFKRCxXQUFZLGNBQWM7SUFDeEIseURBQU8sQ0FBQTtJQUNQLHFEQUFLLENBQUE7SUFDTCx5REFBTyxDQUFBO0FBQ1QsQ0FBQyxFQUpXLGNBQWMsS0FBZCxjQUFjLFFBSXpCO0FBRUQ7Ozs7Ozs7OztHQVNHO0FBQ0gsTUFBTSxPQUFPLFFBQVE7SUFDbkIsSUFBVyxjQUFjO1FBQ3ZCLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUM7SUFDakMsQ0FBQztJQUdELElBQVcsVUFBVTtRQUNuQixPQUFPLElBQUks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