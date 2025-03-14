import { BoolMetaField, ColorMetaField, MetaField, ObjectMetaField, Vector2MetaField, } from '../meta';
import { Vector2, Color } from '../types';
/**
 * Create a runtime representation of the settings metadata.
 */
export function createSettingsMetadata() {
    return new ObjectMetaField('Application Settings', {
        version: new MetaField('version', 1),
        appearance: new ObjectMetaField('Appearance', {
            color: new ColorMetaField('accent color', new Color('#33a6ff')).describe('The accent color for the user interface. (Leave empty to use the default color)'),
            font: new BoolMetaField('legacy font', false).describe("Use the 'JetBrains Mono' font for the user interface."),
            coordinates: new BoolMetaField('coordinates', true).describe('Display mouse coordinates within the preview window.'),
        }),
        defaults: new ObjectMetaField('Defaults', {
            background: new ColorMetaField('background', null).describe('The default background color used in new projects.'),
            size: new Vector2MetaField('resolution', new Vector2(1920, 1080)).describe('The default resolution used in new projects.'),
        }),
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2V0dGluZ3NNZXRhZGF0YS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9hcHAvU2V0dGluZ3NNZXRhZGF0YS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQ0wsYUFBYSxFQUNiLGNBQWMsRUFDZCxTQUFTLEVBQ1QsZUFBZSxFQUNmLGdCQUFnQixHQUNqQixNQUFNLFNBQVMsQ0FBQztBQUNqQixPQUFPLEVBQUMsT0FBTyxFQUFFLEtBQUssRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUV4Qzs7R0FFRztBQUNILE1BQU0sVUFBVSxzQkFBc0I7SUFDcEMsT0FBTyxJQUFJLGVBQWUsQ0FBQyxzQkFBc0IsRUFBRTtRQUNqRCxPQUFPLEVBQUUsSUFBSSxTQUFTLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQztRQUNwQyxVQUFVLEVBQUUsSUFBSSxlQUFlLENBQUMsWUFBWSxFQUFFO1lBQzVDLEtBQUssRUFBRSxJQUFJLGNBQWMsQ0FBQyxjQUFjLEVBQUUsSUFBSSxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQ3RFLGlGQUFpRixDQUNsRjtZQUNELElBQUksRUFBRSxJQUFJLGFBQWEsQ0FBQyxhQUFhLEVBQUUsS0FBSyxDQUFDLENBQUMsUUFBUSxDQUNwRCx1REFBdUQsQ0FDeEQ7WUFDRCxXQUFXLEVBQUUsSUFBSSxhQUFhLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FDMUQsc0RBQXNELENBQ3ZEO1NBQ0YsQ0FBQztRQUNGLFFBQVEsRUFBRSxJQUFJLGVBQWUsQ0FBQyxVQUFVLEVBQUU7WUFDeEMsVUFBVSxFQUFFLElBQUksY0FBYyxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQ3pELG9EQUFvRCxDQUNyRDtZQUNELElBQUksRUFBRSxJQUFJLGdCQUFnQixDQUN4QixZQUFZLEVBQ1osSUFBSSxPQUFPLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUN4QixDQUFDLFFBQVEsQ0FBQyw4Q0FBOEMsQ0FBQztTQUMzRCxDQUFDO0tBQ0gsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyJ9