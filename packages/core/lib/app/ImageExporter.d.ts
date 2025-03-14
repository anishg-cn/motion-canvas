import { Canvas } from 'skia-canvas';
import { BoolMetaField, EnumMetaField, NumberMetaField, ObjectMetaField } from '../meta';
import { CanvasOutputMimeType } from '../types';
import type { Exporter } from './Exporter';
import type { Logger } from './Logger';
import type { Project } from './Project';
import type { RendererSettings } from './Renderer';
/**
 * Image sequence exporter.
 *
 * @internal
 */
export declare class ImageExporter implements Exporter {
    private readonly logger;
    private readonly settings;
    static readonly id = "@motion-canvas/core/image-sequence";
    static readonly displayName = "Image sequence";
    static meta(): ObjectMetaField<{
        fileType: EnumMetaField<CanvasOutputMimeType>;
        quality: NumberMetaField;
        groupByScene: BoolMetaField;
    }>;
    static create(project: Project, settings: RendererSettings): Promise<ImageExporter>;
    private static readonly response;
    private readonly frameLookup;
    private readonly projectName;
    private readonly quality;
    private readonly fileType;
    private readonly groupByScene;
    constructor(logger: Logger, settings: RendererSettings);
    start(): Promise<void>;
    handleFrame(canvas: Canvas, frame: number, sceneFrame: number, sceneName: string, signal: AbortSignal): Promise<void>;
    stop(): Promise<void>;
    private handleResponse;
}
//# sourceMappingURL=ImageExporter.d.ts.map