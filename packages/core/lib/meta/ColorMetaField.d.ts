import { MetaField } from './MetaField';
import { Color, PossibleColor } from '../types';
/**
 * Represents a color stored in a meta file.
 */
export declare class ColorMetaField extends MetaField<PossibleColor | null, Color | null> {
    readonly type: symbol;
    parse(value: PossibleColor | null): Color | null;
    serialize(): PossibleColor | null;
}
//# sourceMappingURL=ColorMetaField.d.ts.map