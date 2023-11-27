import { ColorMetaField, EnumMetaField, ExporterMetaField, MetaField, NumberMetaField, ObjectMetaField, RangeMetaField, Vector2MetaField, } from '../meta';
import { Vector2 } from '../types';
import { ColorSpaces, FrameRates, Scales } from './presets';
function createProjectMetadata(project) {
    const meta = {
        version: new MetaField('version', 1),
        shared: new ObjectMetaField('General', {
            background: new ColorMetaField('background', null),
            range: new RangeMetaField('range', [0, Infinity]),
            size: new Vector2MetaField('resolution', new Vector2(1920, 1080)),
            audioOffset: new NumberMetaField('audio offset', 0),
        }),
        preview: new ObjectMetaField('Preview', {
            fps: new NumberMetaField('frame rate', 30).setPresets(FrameRates),
            resolutionScale: new EnumMetaField('scale', Scales, 1),
        }),
        rendering: new ObjectMetaField('Rendering', {
            fps: new NumberMetaField('frame rate', 60).setPresets(FrameRates),
            resolutionScale: new EnumMetaField('scale', Scales, 1),
            colorSpace: new EnumMetaField('color space', ColorSpaces),
            exporter: new ExporterMetaField('exporter', project),
        }),
    };
    meta.shared.audioOffset.disable(!project.audio);
    return meta;
}
export class ProjectMetadata extends ObjectMetaField {
    constructor(project) {
        super('project', createProjectMetadata(project));
    }
    getFullPreviewSettings() {
        return {
            ...this.shared.get(),
            ...this.preview.get(),
        };
    }
    getFullRenderingSettings() {
        return {
            ...this.shared.get(),
            ...this.rendering.get(),
        };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJvamVjdE1ldGFkYXRhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2FwcC9Qcm9qZWN0TWV0YWRhdGEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUNMLGNBQWMsRUFDZCxhQUFhLEVBQ2IsaUJBQWlCLEVBQ2pCLFNBQVMsRUFDVCxlQUFlLEVBQ2YsZUFBZSxFQUNmLGNBQWMsRUFDZCxnQkFBZ0IsR0FDakIsTUFBTSxTQUFTLENBQUM7QUFDakIsT0FBTyxFQUEwQixPQUFPLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFDMUQsT0FBTyxFQUFDLFdBQVcsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFDLE1BQU0sV0FBVyxDQUFDO0FBRzFELFNBQVMscUJBQXFCLENBQUMsT0FBZ0I7SUFDN0MsTUFBTSxJQUFJLEdBQUc7UUFDWCxPQUFPLEVBQUUsSUFBSSxTQUFTLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQztRQUNwQyxNQUFNLEVBQUUsSUFBSSxlQUFlLENBQUMsU0FBUyxFQUFFO1lBQ3JDLFVBQVUsRUFBRSxJQUFJLGNBQWMsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDO1lBQ2xELEtBQUssRUFBRSxJQUFJLGNBQWMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDakQsSUFBSSxFQUFFLElBQUksZ0JBQWdCLENBQUMsWUFBWSxFQUFFLElBQUksT0FBTyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNqRSxXQUFXLEVBQUUsSUFBSSxlQUFlLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQztTQUNwRCxDQUFDO1FBQ0YsT0FBTyxFQUFFLElBQUksZUFBZSxDQUFDLFNBQVMsRUFBRTtZQUN0QyxHQUFHLEVBQUUsSUFBSSxlQUFlLENBQUMsWUFBWSxFQUFFLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUM7WUFDakUsZUFBZSxFQUFFLElBQUksYUFBYSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO1NBQ3ZELENBQUM7UUFDRixTQUFTLEVBQUUsSUFBSSxlQUFlLENBQUMsV0FBVyxFQUFFO1lBQzFDLEdBQUcsRUFBRSxJQUFJLGVBQWUsQ0FBQyxZQUFZLEVBQUUsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQztZQUNqRSxlQUFlLEVBQUUsSUFBSSxhQUFhLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7WUFDdEQsVUFBVSxFQUFFLElBQUksYUFBYSxDQUFDLGFBQWEsRUFBRSxXQUFXLENBQUM7WUFDekQsUUFBUSxFQUFFLElBQUksaUJBQWlCLENBQUMsVUFBVSxFQUFFLE9BQU8sQ0FBQztTQUNyRCxDQUFDO0tBQ0gsQ0FBQztJQUVGLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUVoRCxPQUFPLElBQUksQ0FBQztBQUNkLENBQUM7QUFFRCxNQUFNLE9BQU8sZUFBZ0IsU0FBUSxlQUVwQztJQUNDLFlBQW1CLE9BQWdCO1FBQ2pDLEtBQUssQ0FBQyxTQUFTLEVBQUUscUJBQXFCLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUNuRCxDQUFDO0lBRU0sc0JBQXNCO1FBUTNCLE9BQU87WUFDTCxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFO1lBQ3BCLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUU7U0FDdEIsQ0FBQztJQUNKLENBQUM7SUFFTSx3QkFBd0I7UUFhN0IsT0FBTztZQUNMLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUU7WUFDcEIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRTtTQUN4QixDQUFDO0lBQ0osQ0FBQztDQUNGIn0=