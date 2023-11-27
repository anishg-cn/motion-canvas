import { MetaField } from './MetaField';
import type { ExporterClass, Project } from '../app';
/**
 * Represents the exporter configuration.
 */
export declare class ExporterMetaField extends MetaField<{
    name: string;
    options: unknown;
}> {
    private current;
    readonly type: ObjectConstructor;
    /**
     * Triggered when the nested fields change.
     *
     * @eventProperty
     */
    get onFieldsChanged(): import("../events").SubscribableValueEvent<MetaField<any, any>[]>;
    private readonly fields;
    get options(): MetaField<unknown, unknown>;
    private readonly exporterField;
    private readonly optionFields;
    readonly exporters: ExporterClass[];
    constructor(name: string, project: Project, current?: number);
    set(value: {
        name: string;
        options: any;
    }): void;
    serialize(): {
        name: string;
        options: any;
    };
    clone(): this;
    private handleChange;
}
//# sourceMappingURL=ExporterMetaFile.d.ts.map