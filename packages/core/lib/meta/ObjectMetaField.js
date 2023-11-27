import { MetaField } from './MetaField';
import { ValueDispatcher } from '../events';
/**
 * Represents an object with nested meta-fields.
 */
class ObjectMetaFieldInternal extends MetaField {
    /**
     * Triggered when the nested fields change.
     *
     * @eventProperty
     */
    get onFieldsChanged() {
        return this.event.subscribable;
    }
    constructor(name, fields) {
        const map = new Map(Object.entries(fields));
        super(name, Object.fromEntries(Array.from(map, ([name, field]) => [name, field.get()])));
        this.type = Object;
        this.ignoreChange = false;
        this.customFields = {};
        this.handleChange = () => {
            if (this.ignoreChange)
                return;
            this.value.current = this.transform('get');
        };
        this.event = new ValueDispatcher([...map.values()]);
        this.fields = map;
        for (const [key, field] of this.fields) {
            Object.defineProperty(this, key, { value: field });
            field.onChanged.subscribe(this.handleChange);
        }
    }
    set(value) {
        this.ignoreChange = true;
        for (const [key, fieldValue] of Object.entries(value)) {
            const field = this.fields.get(key);
            if (field) {
                field.set(fieldValue);
            }
            else {
                this.customFields[key] = fieldValue;
            }
        }
        this.ignoreChange = false;
        this.handleChange();
    }
    serialize() {
        return this.transform('serialize');
    }
    clone() {
        return new this.constructor(this.name, this.transform('clone'));
    }
    transform(fn) {
        const transformed = Object.fromEntries(Array.from(this.fields, ([name, field]) => [name, field[fn]()]));
        return {
            ...transformed,
            ...this.customFields,
        };
    }
}
/**
 * {@inheritDoc ObjectMetaFieldInternal}
 */
export const ObjectMetaField = ObjectMetaFieldInternal;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT2JqZWN0TWV0YUZpZWxkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL21ldGEvT2JqZWN0TWV0YUZpZWxkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFDdEMsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLFdBQVcsQ0FBQztBQW1CMUM7O0dBRUc7QUFDSCxNQUFNLHVCQUVKLFNBQVEsU0FBcUI7SUFHN0I7Ozs7T0FJRztJQUNILElBQVcsZUFBZTtRQUN4QixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDO0lBQ2pDLENBQUM7SUFPRCxZQUFtQixJQUFZLEVBQUUsTUFBUztRQUN4QyxNQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDNUMsS0FBSyxDQUNILElBQUksRUFDSixNQUFNLENBQUMsV0FBVyxDQUNoQixLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUMxQyxDQUNoQixDQUFDO1FBdkJZLFNBQUksR0FBRyxNQUFNLENBQUM7UUFXcEIsaUJBQVksR0FBRyxLQUFLLENBQUM7UUFDckIsaUJBQVksR0FBNEIsRUFBRSxDQUFDO1FBMkMzQyxpQkFBWSxHQUFHLEdBQUcsRUFBRTtZQUM1QixJQUFJLElBQUksQ0FBQyxZQUFZO2dCQUFFLE9BQU87WUFDOUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM3QyxDQUFDLENBQUM7UUFqQ0EsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLGVBQWUsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNwRCxJQUFJLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQztRQUNsQixLQUFLLE1BQU0sQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUN0QyxNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsRUFBQyxLQUFLLEVBQUUsS0FBSyxFQUFDLENBQUMsQ0FBQztZQUNqRCxLQUFLLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7U0FDOUM7SUFDSCxDQUFDO0lBRWUsR0FBRyxDQUFDLEtBQTBCO1FBQzVDLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO1FBQ3pCLEtBQUssTUFBTSxDQUFDLEdBQUcsRUFBRSxVQUFVLENBQUMsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ3JELE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ25DLElBQUksS0FBSyxFQUFFO2dCQUNULEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7YUFDdkI7aUJBQU07Z0JBQ0wsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsR0FBRyxVQUFVLENBQUM7YUFDckM7U0FDRjtRQUNELElBQUksQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDO1FBQzFCLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztJQUN0QixDQUFDO0lBRWUsU0FBUztRQUN2QixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDckMsQ0FBQztJQUVlLEtBQUs7UUFDbkIsT0FBTyxJQUFVLElBQUksQ0FBQyxXQUFZLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFDekUsQ0FBQztJQU9TLFNBQVMsQ0FDakIsRUFBUTtRQUVSLE1BQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQ3BDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQ25DLENBQUM7UUFFL0IsT0FBTztZQUNMLEdBQUcsV0FBVztZQUNkLEdBQUcsSUFBSSxDQUFDLFlBQVk7U0FDckIsQ0FBQztJQUNKLENBQUM7Q0FDRjtBQVFEOztHQUVHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sZUFBZSxHQUFHLHVCQUs5QixDQUFDIn0=