import type { Project } from './Project';
import { Stage, StageSettings } from './Stage';
import { TimeEstimator } from './TimeEstimator';
export interface RendererSettings extends StageSettings {
    name: string;
    range: [number, number];
    fps: number;
    exporter: {
        name: string;
        options: unknown;
    };
}
export declare enum RendererState {
    Initial = 0,
    Working = 1,
    Aborting = 2
}
export declare enum RendererResult {
    Success = 0,
    Error = 1,
    Aborted = 2
}
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
export declare class Renderer {
    private project;
    get onStateChanged(): import("../events").SubscribableValueEvent<RendererState>;
    private readonly state;
    get onFinished(): import("../events").Subscribable<RendererResult, import("../events").EventHandler<RendererResult>>;
    private readonly finished;
    get onFrameChanged(): import("../events").SubscribableValueEvent<number>;
    private readonly frame;
    readonly stage: Stage;
    readonly estimator: TimeEstimator;
    private readonly lock;
    private readonly playback;
    private readonly status;
    private exporter;
    private abortController;
    constructor(project: Project);
    /**
     * Render the animation using the provided settings.
     *
     * @param settings - The rendering settings.
     */
    render(settings: RendererSettings): Promise<void>;
    /**
     * Abort the ongoing render process.
     */
    abort(): void;
    /**
     * Export an individual frame.
     *
     * @remarks
     * This method always uses the default `ImageExporter`.
     *
     * @param settings - The rendering settings.
     * @param time - The timestamp to export.
     */
    renderFrame(settings: RendererSettings, time: number): Promise<void>;
    private run;
    private reloadScenes;
    private exportFrame;
}
//# sourceMappingURL=Renderer.d.ts.map