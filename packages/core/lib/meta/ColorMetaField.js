import { MetaField } from './MetaField';
import { Color } from '../types';
/**
 * Represents a color stored in a meta file.
 */
export class ColorMetaField extends MetaField {
    constructor() {
        super(...arguments);
        this.type = Color.symbol;
    }
    parse(value) {
        return value === null ? null : new Color(value);
    }
    serialize() {
        return this.value.current?.serialize() ?? null;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29sb3JNZXRhRmllbGQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbWV0YS9Db2xvck1ldGFGaWVsZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBQ3RDLE9BQU8sRUFBQyxLQUFLLEVBQWdCLE1BQU0sVUFBVSxDQUFDO0FBRTlDOztHQUVHO0FBQ0gsTUFBTSxPQUFPLGNBQWUsU0FBUSxTQUduQztJQUhEOztRQUlrQixTQUFJLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQztJQVN0QyxDQUFDO0lBUGlCLEtBQUssQ0FBQyxLQUEyQjtRQUMvQyxPQUFPLEtBQUssS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDbEQsQ0FBQztJQUVlLFNBQVM7UUFDdkIsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsSUFBSSxJQUFJLENBQUM7SUFDakQsQ0FBQztDQUNGIn0=