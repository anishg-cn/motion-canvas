import { Canvas, CanvasRenderingContext2D } from 'skia-canvas';
import { Scene } from '../scenes';
import type { Color } from '../types';
import { CanvasColorSpace, Vector2 } from '../types';
export interface StageSettings {
    size: Vector2;
    resolutionScale: number;
    colorSpace: CanvasColorSpace;
    background: Color | string | null;
}
/**
 * Manages canvases on which an animation can be displayed.
 */
export declare class Stage {
    private background;
    private resolutionScale;
    private colorSpace;
    private size;
    readonly finalBuffer: Canvas;
    private readonly currentBuffer;
    private readonly previousBuffer;
    private context;
    private currentContext;
    private previousContext;
    private get canvasSize();
    constructor();
    configure({ colorSpace, size, resolutionScale, background, }: Partial<StageSettings>): void;
    render(currentScene: Scene, previousScene: Scene | null): Promise<void>;
    transformCanvas(context: CanvasRenderingContext2D): void;
    resizeCanvas(context: CanvasRenderingContext2D): void;
}
//# sourceMappingURL=Stage.d.ts.map