var _a;
import { EventDispatcher } from '../events';
import { BoolMetaField, EnumMetaField, NumberMetaField, ObjectMetaField, } from '../meta';
import { clamp } from '../tweening';
import { FileTypes } from './presets';
const EXPORT_FRAME_LIMIT = 256;
const EXPORT_RETRY_DELAY = 1000;
/**
 * Image sequence exporter.
 *
 * @internal
 */
export class ImageExporter {
    static meta() {
        const meta = new ObjectMetaField(this.name, {
            fileType: new EnumMetaField('file type', FileTypes),
            quality: new NumberMetaField('quality', 100)
                .setRange(0, 100)
                .describe('A number between 0 and 100 indicating the image quality.'),
            groupByScene: new BoolMetaField('group by scene', false).describe('Group exported images by scene. When checked, separates the sequence into subdirectories for each scene in the project.'),
        });
        meta.fileType.onChanged.subscribe(value => {
            meta.quality.disable(value === 'image/png');
        });
        return meta;
    }
    static async create(project, settings) {
        return new ImageExporter(project.logger, settings);
    }
    constructor(logger, settings) {
        this.logger = logger;
        this.settings = settings;
        this.frameLookup = new Set();
        this.handleResponse = ({ frame }) => {
            this.frameLookup.delete(frame);
        };
        const options = settings.exporter.options;
        this.projectName = settings.name;
        this.quality = clamp(0, 1, options.quality / 100);
        this.fileType = options.fileType;
        this.groupByScene = options.groupByScene;
    }
    async start() {
        ImageExporter.response.subscribe(this.handleResponse);
    }
    async handleFrame(canvas, frame, sceneFrame, sceneName, signal) {
        if (this.frameLookup.has(frame)) {
            this.logger.warn(`Frame no. ${frame} is already being exported.`);
            return;
        }
        if (import.meta.hot) {
            while (this.frameLookup.size > EXPORT_FRAME_LIMIT) {
                await new Promise(resolve => setTimeout(resolve, EXPORT_RETRY_DELAY));
                if (signal.aborted) {
                    return;
                }
            }
            this.frameLookup.add(frame);
            let data;
            if (this.fileType === 'image/jpeg') {
                data = await canvas.toDataURL('jpeg', { quality: this.quality });
            }
            else {
                data = await canvas.toDataURL('png');
            }
            import.meta.hot.send('motion-canvas:export', {
                frame,
                sceneFrame,
                data,
                mimeType: this.fileType,
                subDirectories: this.groupByScene
                    ? [this.projectName, sceneName]
                    : [this.projectName],
                groupByScene: this.groupByScene,
            });
        }
    }
    async stop() {
        while (this.frameLookup.size > 0) {
            await new Promise(resolve => setTimeout(resolve, EXPORT_RETRY_DELAY));
        }
        ImageExporter.response.unsubscribe(this.handleResponse);
    }
}
_a = ImageExporter;
ImageExporter.id = '@motion-canvas/core/image-sequence';
ImageExporter.displayName = 'Image sequence';
ImageExporter.response = new EventDispatcher();
(() => {
    if (import.meta.hot) {
        import.meta.hot.on('motion-canvas:export-ack', response => {
            _a.response.dispatch(response);
        });
    }
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW1hZ2VFeHBvcnRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9hcHAvSW1hZ2VFeHBvcnRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0EsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLFdBQVcsQ0FBQztBQUMxQyxPQUFPLEVBQ0wsYUFBYSxFQUNiLGFBQWEsRUFDYixlQUFlLEVBQ2YsZUFBZSxHQUVoQixNQUFNLFNBQVMsQ0FBQztBQUNqQixPQUFPLEVBQUMsS0FBSyxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBTWxDLE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxXQUFXLENBQUM7QUFFcEMsTUFBTSxrQkFBa0IsR0FBRyxHQUFHLENBQUM7QUFDL0IsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLENBQUM7QUFRaEM7Ozs7R0FJRztBQUNILE1BQU0sT0FBTyxhQUFhO0lBSWpCLE1BQU0sQ0FBQyxJQUFJO1FBQ2hCLE1BQU0sSUFBSSxHQUFHLElBQUksZUFBZSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUU7WUFDMUMsUUFBUSxFQUFFLElBQUksYUFBYSxDQUFDLFdBQVcsRUFBRSxTQUFTLENBQUM7WUFDbkQsT0FBTyxFQUFFLElBQUksZUFBZSxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUM7aUJBQ3pDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDO2lCQUNoQixRQUFRLENBQUMsMERBQTBELENBQUM7WUFDdkUsWUFBWSxFQUFFLElBQUksYUFBYSxDQUFDLGdCQUFnQixFQUFFLEtBQUssQ0FBQyxDQUFDLFFBQVEsQ0FDL0QseUhBQXlILENBQzFIO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ3hDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssS0FBSyxXQUFXLENBQUMsQ0FBQztRQUM5QyxDQUFDLENBQUMsQ0FB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