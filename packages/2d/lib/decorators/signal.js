import { deepLerp, } from '@motion-canvas/core/lib/tweening';
import { addInitializer, initialize } from './initializers';
import { capitalize, useLogger } from '@motion-canvas/core/lib/utils';
import { makeSignalExtensions } from '../utils/makeSignalExtensions';
import { SignalContext } from '@motion-canvas/core/lib/signals';
const PROPERTIES = Symbol.for('@motion-canvas/2d/decorators/properties');
export function getPropertyMeta(object, key) {
    return object[PROPERTIES]?.[key] ?? null;
}
export function getPropertyMetaOrCreate(object, key) {
    let lookup;
    if (!object[PROPERTIES]) {
        object[PROPERTIES] = lookup = {};
    }
    else if (object[PROPERTIES] &&
        !Object.prototype.hasOwnProperty.call(object, PROPERTIES)) {
        object[PROPERTIES] = lookup = Object.fromEntries(Object.entries(object[PROPERTIES]).map(([key, meta]) => [key, { ...meta }]));
    }
    else {
        lookup = object[PROPERTIES];
    }
    lookup[key] ?? (lookup[key] = {
        cloneable: true,
        inspectable: true,
        compoundEntries: [],
    });
    return lookup[key];
}
export function getPropertiesOf(value) {
    if (value && typeof value === 'object') {
        return value[PROPERTIES] ?? {};
    }
    return {};
}
export function initializeSignals(instance, props) {
    initialize(instance);
    for (const [key, meta] of Object.entries(getPropertiesOf(instance))) {
        const signal = instance[key];
        signal.reset();
        if (props[key] !== undefined) {
            signal(props[key]);
        }
        if (meta.compoundEntries !== undefined) {
            for (const [key, property] of meta.compoundEntries) {
                if (property in props) {
                    signal[key](props[property]);
                }
            }
        }
    }
}
/**
 * Create a signal decorator.
 *
 * @remarks
 * This decorator turns the given property into a signal.
 *
 * The class using this decorator can implement the following methods:
 * - `get[PropertyName]` - A property getter.
 * - `get[PropertyName]` - A property setter.
 * - `tween[PropertyName]` - A tween provider.
 *
 * @example
 * ```ts
 * class Example {
 *   \@property()
 *   public declare length: Signal<number, this>;
 * }
 * ```
 */
export function signal() {
    return (target, key) => {
        const meta = getPropertyMetaOrCreate(target, key);
        addInitializer(target, (instance) => {
            const getDefault = instance[`getDefault${capitalize(key)}`]?.bind(instance);
            const signal = new SignalContext(getDefault ?? meta.default, meta.interpolationFunction ?? deepLerp, instance, meta.parser?.bind(instance), makeSignalExtensions(meta, instance, key));
            instance[key] = signal.toSignal();
        });
    };
}
/**
 * Create an initial signal value decorator.
 *
 * @remarks
 * This decorator specifies the initial value of a property.
 *
 * Must be specified before the {@link signal} decorator.
 *
 * @example
 * ```ts
 * class Example {
 *   \@initial(1)
 *   \@property()
 *   public declare length: Signal<number, this>;
 * }
 * ```
 *
 * @param value - The initial value of the property.
 */
export function initial(value) {
    return (target, key) => {
        const meta = getPropertyMeta(target, key);
        if (!meta) {
            useLogger().error(`Missing property decorator for "${key.toString()}"`);
            return;
        }
        meta.default = value;
    };
}
/**
 * Create a signal interpolation function decorator.
 *
 * @remarks
 * This decorator specifies the interpolation function of a property.
 * The interpolation function is used when tweening between different values.
 *
 * Must be specified before the {@link signal} decorator.
 *
 * @example
 * ```ts
 * class Example {
 *   \@interpolation(textLerp)
 *   \@property()
 *   public declare text: Signal<string, this>;
 * }
 * ```
 *
 * @param value - The interpolation function for the property.
 */
export function interpolation(value) {
    return (target, key) => {
        const meta = getPropertyMeta(target, key);
        if (!meta) {
            useLogger().error(`Missing property decorator for "${key.toString()}"`);
            return;
        }
        meta.interpolationFunction = value;
    };
}
/**
 * Create a signal parser decorator.
 *
 * @remarks
 * This decorator specifies the parser of a property.
 * Instead of returning the raw value, its passed as the first parameter to the
 * parser and the resulting value is returned.
 *
 * If the wrapper class has a method called `lerp` it will be set as the
 * default interpolation function for the property.
 *
 * Must be specified before the {@link signal} decorator.
 *
 * @example
 * ```ts
 * class Example {
 *   \@wrapper(Vector2)
 *   \@property()
 *   public declare offset: Signal<Vector2, this>;
 * }
 * ```
 *
 * @param value - The wrapper class for the property.
 */
export function parser(value) {
    return (target, key) => {
        const meta = getPropertyMeta(target, key);
        if (!meta) {
            useLogger().error(`Missing property decorator for "${key.toString()}"`);
            return;
        }
        meta.parser = value;
    };
}
/**
 * Create a signal wrapper decorator.
 *
 * @remarks
 * This is a shortcut decorator for setting both the {@link parser} and
 * {@link interpolation}.
 *
 * The interpolation function will be set only if the wrapper class has a method
 * called `lerp`, which will be used as said function.
 *
 * Must be specified before the {@link signal} decorator.
 *
 * @example
 * ```ts
 * class Example {
 *   \@wrapper(Vector2)
 *   \@property()
 *   public declare offset: Signal<Vector2, this>;
 *
 *   // same as:
 *   \@parser(value => new Vector2(value))
 *   \@interpolation(Vector2.lerp)
 *   \@property()
 *   public declare offset: Signal<Vector2, this>;
 * }
 * ```
 *
 * @param value - The wrapper class for the property.
 */
export function wrapper(value) {
    return (target, key) => {
        const meta = getPropertyMeta(target, key);
        if (!meta) {
            useLogger().error(`Missing property decorator for "${key.toString()}"`);
            return;
        }
        meta.parser = raw => new value(raw);
        if ('lerp' in value) {
            meta.interpolationFunction ?? (meta.interpolationFunction = value.lerp);
        }
    };
}
/**
 * Create a cloneable property decorator.
 *
 * @remarks
 * This decorator specifies whether the property should be copied over when
 * cloning the node.
 *
 * By default, any property is cloneable.
 *
 * Must be specified before the {@link signal} decorator.
 *
 * @example
 * ```ts
 * class Example {
 *   \@clone(false)
 *   \@property()
 *   public declare length: Signal<number, this>;
 * }
 * ```
 *
 * @param value - Whether the property should be cloneable.
 */
export function cloneable(value = true) {
    return (target, key) => {
        const meta = getPropertyMeta(target, key);
        if (!meta) {
            useLogger().error(`Missing property decorator for "${key.toString()}"`);
            return;
        }
        meta.cloneable = value;
    };
}
/**
 * Create an inspectable property decorator.
 *
 * @remarks
 * This decorator specifies whether the property should be visible in the
 * inspector.
 *
 * By default, any property is inspectable.
 *
 * Must be specified before the {@link signal} decorator.
 *
 * @example
 * ```ts
 * class Example {
 *   \@inspectable(false)
 *   \@property()
 *   public declare hiddenLength: Signal<number, this>;
 * }
 * ```
 *
 * @param value - Whether the property should be inspectable.
 */
export function inspectable(value = true) {
    return (target, key) => {
        const meta = getPropertyMeta(target, key);
        if (!meta) {
            useLogger().error(`Missing property decorator for "${key.toString()}"`);
            return;
        }
        meta.inspectable = value;
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2lnbmFsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2RlY29yYXRvcnMvc2lnbmFsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFDTCxRQUFRLEdBR1QsTUFBTSxrQ0FBa0MsQ0FBQztBQUMxQyxPQUFPLEVBQUMsY0FBYyxFQUFFLFVBQVUsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQzFELE9BQU8sRUFBQyxVQUFVLEVBQUUsU0FBUyxFQUFDLE1BQU0sK0JBQStCLENBQUM7QUFDcEUsT0FBTyxFQUFDLG9CQUFvQixFQUFDLE1BQU0sK0JBQStCLENBQUM7QUFDbkUsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLGlDQUFpQyxDQUFDO0FBcUI5RCxNQUFNLFVBQVUsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLHlDQUF5QyxDQUFDLENBQUM7QUFFekUsTUFBTSxVQUFVLGVBQWUsQ0FDN0IsTUFBVyxFQUNYLEdBQW9CO0lBRXBCLE9BQU8sTUFBTSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDO0FBQzNDLENBQUM7QUFFRCxNQUFNLFVBQVUsdUJBQXVCLENBQ3JDLE1BQVcsRUFDWCxHQUFvQjtJQUVwQixJQUFJLE1BQW9ELENBQUM7SUFDekQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsRUFBRTtRQUN2QixNQUFNLENBQUMsVUFBVSxDQUFDLEdBQUcsTUFBTSxHQUFHLEVBQUUsQ0FBQztLQUNsQztTQUFNLElBQ0wsTUFBTSxDQUFDLFVBQVUsQ0FBQztRQUNsQixDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLEVBQ3pEO1FBQ0EsTUFBTSxDQUFDLFVBQVUsQ0FBQyxHQUFHLE1BQU0sR0FBRyxNQUFNLENBQUMsV0FBVyxDQUM5QyxNQUFNLENBQUMsT0FBTyxDQUNrQyxNQUFNLENBQUMsVUFBVSxD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