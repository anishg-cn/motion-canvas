import { Project } from './Project';
import { PlaybackManager } from './PlaybackManager';
import { AudioManager } from '../media';
import { Logger } from './Logger';
import { Vector2 } from '../types';
import { PlaybackStatus } from './PlaybackStatus';
export interface PlayerState extends Record<string, unknown> {
    paused: boolean;
    loop: boolean;
    muted: boolean;
    speed: number;
}
export interface PlayerSettings {
    range: [number, number];
    fps: number;
    size: Vector2;
    audioOffset: number;
    resolutionScale: number;
}
/**
 * The player logic used by the editor and embeddable player.
 *
 * @remarks
 * This class builds on top of the `PlaybackManager` to provide a simple
 * interface similar to other media players. It plays through the animation
 * using a real-time update loop and optionally synchronises it with audio.
 */
export declare class Player {
    private project;
    private settings;
    private initialState;
    private initialFrame;
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
    get onRender(): import("../events").Subscribable<void, import("../events").AsyncEventHandler<void>>;
    private readonly render;
    get onStateChanged(): import("../events").SubscribableValueEvent<PlayerState>;
    private readonly playerState;
    get onFrameChanged(): import("../events").SubscribableValueEvent<number>;
    private readonly frame;
    get onDurationChanged(): import("../events").SubscribableValueEvent<number>;
    private readonly duration;
    /**
     * Triggered right after recalculation finishes.
     *
     * @remarks
     * Can be used to provide visual feedback.
     *
     * @eventProperty
     */
    get onRecalculated(): import("../events").Subscribable<void, import("../events").EventHandler<void>>;
    private readonly recalculated;
    readonly playback: PlaybackManager;
    readonly status: PlaybackStatus;
    readonly audio: AudioManager;
    readonly logger: Logger;
    private readonly lock;
    private startTime;
    private endTime;
    private requestId;
    private renderTime;
    private requestedSeek;
    private requestedRecalculation;
    private size;
    private resolutionScale;
    private active;
    private get startFrame();
    private get endFrame();
    private get finished();
    constructor(project: Project, settings?: Partial<PlayerSettings>, initialState?: Partial<PlayerState>, initialFrame?: number);
    configure(settings: PlayerSettings): Promise<void>;
    /**
     * Whether the given frame is inside the animation range.
     *
     * @param frame - The frame to check.
     */
    isInRange(frame: number): boolean;
    /**
     * Whether the given frame is inside the user-defined range.
     *
     * @param frame - The frame to check.
     */
    isInUserRange(frame: number): boolean;
    requestSeek(value: number): void;
    requestPreviousFrame(): void;
    requestNextFrame(): void;
    requestReset(): void;
    toggleLoop(value?: boolean): void;
    togglePlayback(value?: boolean): void;
    toggleAudio(value?: boolean): void;
    setSpeed(value: number): void;
    setVariables(variables: Record<string, unknown>): void;
    /**
     * Activate the player.
     *
     * @remarks
     * A player needs to be active in order for the update loop to run. Each
     * player is active by default.
     */
    activate(): void;
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
    deactivate(): void;
    private requestRecalculation;
    private prepare;
    private run;
    private request;
    private clampRange;
    private syncAudio;
}
//# sourceMappingURL=Player.d.ts.map