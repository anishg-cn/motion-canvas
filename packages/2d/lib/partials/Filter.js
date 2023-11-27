import { createSignal, } from '@motion-canvas/core/lib/signals';
import { map } from '@motion-canvas/core/lib/tweening';
import { transformScalar } from '@motion-canvas/core/lib/types';
/**
 * Definitions of all possible CSS filters.
 *
 * @internal
 */
export const FILTERS = {
    invert: {
        name: 'invert',
    },
    sepia: {
        name: 'sepia',
    },
    grayscale: {
        name: 'grayscale',
    },
    brightness: {
        name: 'brightness',
        default: 1,
    },
    contrast: {
        name: 'contrast',
        default: 1,
    },
    saturate: {
        name: 'saturate',
        default: 1,
    },
    hue: {
        name: 'hue-rotate',
        unit: 'deg',
        scale: 1,
    },
    blur: {
        name: 'blur',
        transform: true,
        unit: 'px',
        scale: 1,
    },
};
export class Filter {
    get name() {
        return this.props.name;
    }
    get default() {
        return this.props.default;
    }
    constructor(props) {
        this.props = {
            name: 'invert',
            default: 0,
            unit: '%',
            scale: 100,
            transform: false,
            ...props,
            value: props.value ?? props.default ?? 0,
        };
        this.value = createSignal(this.props.value, map, this);
    }
    isActive() {
        return this.value() !== this.props.default;
    }
    serialize(matrix) {
        let value = this.value();
        if (this.props.transform) {
            value = transformScalar(value, matrix);
        }
        return `${this.props.name}(${value * this.props.scale}${this.props.unit})`;
    }
}
/**
 * Create an {@link https://developer.mozilla.org/en-US/docs/Web/CSS/filter-function/invert | invert} filter.
 *
 * @param value - The value of the filter.
 */
export function invert(value) {
    return new Filter({ ...FILTERS.invert, value });
}
/**
 * Create a {@link https://developer.mozilla.org/en-US/docs/Web/CSS/filter-function/sepia | sepia} filter.
 *
 * @param value - The value of the filter.
 */
export function sepia(value) {
    return new Filter({ ...FILTERS.sepia, value });
}
/**
 * Create a {@link https://developer.mozilla.org/en-US/docs/Web/CSS/filter-function/grayscale | grayscale} filter.
 *
 * @param value - The value of the filter.
 */
export function grayscale(value) {
    return new Filter({ ...FILTERS.grayscale, value });
}
/**
 * Create a {@link https://developer.mozilla.org/en-US/docs/Web/CSS/filter-function/brightness | brightness} filter.
 *
 * @param value - The value of the filter.
 */
export function brightness(value) {
    return new Filter({ ...FILTERS.brightness, value });
}
/**
 * Create a {@link https://developer.mozilla.org/en-US/docs/Web/CSS/filter-function/contrast | contrast} filter.
 *
 * @param value - The value of the filter.
 */
export function contrast(value) {
    return new Filter({ ...FILTERS.contrast, value });
}
/**
 * Create a {@link https://developer.mozilla.org/en-US/docs/Web/CSS/filter-function/saturate | saturate} filter.
 *
 * @param value - The value of the filter.
 */
export function saturate(value) {
    return new Filter({ ...FILTERS.saturate, value });
}
/**
 * Create a {@link https://developer.mozilla.org/en-US/docs/Web/CSS/filter-function/hue-rotate | hue} filter.
 *
 * @param value - The value of the filter in degrees.
 */
export function hue(value) {
    return new Filter({ ...FILTERS.hue, value });
}
/**
 * Create a {@link https://developer.mozilla.org/en-US/docs/Web/CSS/filter-function/blur | blur} filter.
 *
 * @param value - The value of the filter in pixels.
 */
export function blur(value) {
    return new Filter({ ...FILTERS.blur, value });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRmlsdGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3BhcnRpYWxzL0ZpbHRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQ0wsWUFBWSxHQUdiLE1BQU0saUNBQWlDLENBQUM7QUFDekMsT0FBTyxFQUFDLEdBQUcsRUFBQyxNQUFNLGtDQUFrQyxDQUFDO0FBQ3JELE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSwrQkFBK0IsQ0FBQztBQWlCOUQ7Ozs7R0FJRztBQUNILE1BQU0sQ0FBQyxNQUFNLE9BQU8sR0FBeUM7SUFDM0QsTUFBTSxFQUFFO1FBQ04sSUFBSSxFQUFFLFFBQVE7S0FDZjtJQUNELEtBQUssRUFBRTtRQUNMLElBQUksRUFBRSxPQUFPO0tBQ2Q7SUFDRCxTQUFTLEVBQUU7UUFDVCxJQUFJLEVBQUUsV0FBVztLQUNsQjtJQUNELFVBQVUsRUFBRTtRQUNWLElBQUksRUFBRSxZQUFZO1FBQ2xCLE9BQU8sRUFBRSxDQUFDO0tBQ1g7SUFDRCxRQUFRLEVBQUU7UUFDUixJQUFJLEVBQUUsVUFBVTtRQUNoQixPQUFPLEVBQUUsQ0FBQztLQUNYO0lBQ0QsUUFBUSxFQUFFO1FBQ1IsSUFBSSxFQUFFLFVBQVU7UUFDaEIsT0FBTyxFQUFFLENBQUM7S0FDWDtJQUNELEdBQUcsRUFBRTtRQUNILElBQUksRUFBRSxZQUFZO1FBQ2xCLElBQUksRUFBRSxLQUFLO1FBQ1gsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNELElBQUksRUFBRTtRQUNKLElBQUksRUFBRSxNQUFNO1FBQ1osU0FBUyxFQUFFLElBQUk7UUFDZixJQUFJLEVBQUUsSUFBSTtRQUNWLEtBQUssRUFBRSxDQUFDO0tBQ1Q7Q0FDRixDQUFDO0FBY0YsTUFBTSxPQUFPLE1BQU07SUFDakIsSUFBVyxJQUFJO1FBQ2IsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQztJQUN6QixDQUFDO0lBRUQsSUFBVyxPQUFPO1FBQ2hCLE9BQU8sSUFB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