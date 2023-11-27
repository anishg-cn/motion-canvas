import { MetaField } from './MetaField';
import { EnumMetaField } from './EnumMetaField';
import { ValueDispatcher } from '../events';
/**
 * Represents the exporter configuration.
 */
export class ExporterMetaField extends MetaField {
    /**
     * Triggered when the nested fields change.
     *
     * @eventProperty
     */
    get onFieldsChanged() {
        return this.fields.subscribable;
    }
    get options() {
        return this.optionFields[this.current];
    }
    constructor(name, project, current = 0) {
        const exporters = project.plugins.flatMap(plugin => plugin.exporters?.(project) ?? []);
        const optionFields = exporters.map(exporter => exporter.meta(project));
        const exporterField = new EnumMetaField('exporter', exporters.map(exporter => ({
            value: exporter.id,
            text: exporter.displayName,
        })), exporters[current].id);
        super(name, {
            name: exporterField.get(),
            options: optionFields[current].get(),
        });
        this.current = current;
        this.type = Object;
        this.handleChange = () => {
            const value = this.exporterField.get();
            const index = Math.max(this.exporters.findIndex(exporter => exporter.id === value), 0);
            if (this.current !== index) {
                this.options.onChanged.unsubscribe(this.handleChange);
                this.current = index;
                this.options.onChanged.subscribe(this.handleChange, false);
                this.fields.current = [this.exporterField, this.options];
            }
            this.value.current = {
                name: this.exporterField.get(),
                options: this.options.get(),
            };
        };
        this.exporters = exporters;
        this.exporterField = exporterField;
        this.exporterField.onChanged.subscribe(this.handleChange, false);
        this.exporterField.disable(optionFields.length < 2).space();
        this.optionFields = optionFields;
        this.optionFields[current].onChanged.subscribe(this.handleChange, false);
        this.fields = new ValueDispatcher([this.exporterField, this.options]);
    }
    set(value) {
        this.exporterField.set(value.name);
        this.options.set(value.options);
    }
    serialize() {
        return {
            name: this.exporterField.serialize(),
            options: this.options.serialize(),
        };
    }
    clone() {
        return new this.constructor(this.name, this.exporters, this.current);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXhwb3J0ZXJNZXRhRmlsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tZXRhL0V4cG9ydGVyTWV0YUZpbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUV0QyxPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDOUMsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLFdBQVcsQ0FBQztBQUUxQzs7R0FFRztBQUNILE1BQU0sT0FBTyxpQkFBa0IsU0FBUSxTQUdyQztJQUdBOzs7O09BSUc7SUFDSCxJQUFXLGVBQWU7UUFDeEIsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQztJQUNsQyxDQUFDO0lBR0QsSUFBVyxPQUFPO1FBQ2hCLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDekMsQ0FBQztJQU1ELFlBQW1CLElBQVksRUFBRSxPQUFnQixFQUFVLFVBQVUsQ0FBQztRQUNwRSxNQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FDdkMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUM1QyxDQUFDO1FBQ0YsTUFBTSxZQUFZLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUN2RSxNQUFNLGFBQWEsR0FBRyxJQUFJLGFBQWEsQ0FDckMsVUFBVSxFQUNWLFNBQVMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3pCLEtBQUssRUFBRSxRQUFRLENBQUMsRUFBRTtZQUNsQixJQUFJLEVBQUUsUUFBUSxDQUFDLFdBQVc7U0FDM0IsQ0FBQyxDQUFD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