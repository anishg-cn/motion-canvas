import { Reference } from './createRef';
export type ReferenceMap<T> = Map<string, Reference<T>> & Record<string, Reference<T>> & {
    /**
     * Maps the references in this group to a new array.
     *
     * @param callback - The function to transform each reference.
     *
     * @returns An array of the transformed references.
     */
    mapRefs<TValue>(callback: (value: T, index: number) => TValue): TValue[];
};
/**
 * Create a group of references.
 *
 * @remarks
 * The returned object lets you easily create multiple references to the same
 * type without initializing them individually.
 *
 * You can retrieve references by accessing the object's properties. If the
 * reference for a given property does not exist, it will be created
 * automatically.
 *
 * @example
 * ```tsx
 * const labels = createRefMap<Txt>();
 *
 * view.add(
 *   <>
 *     <Txt ref={labels.a}>A</Txt>
 *     <Txt ref={labels.b}>B</Txt>
 *     <Txt ref={labels.c}>C</Txt>
 *   </>,
 * );
 *
 * // accessing the references individually:
 * yield* labels.a().text('A changes', 0.3);
 * yield* labels.b().text('B changes', 0.3);
 * yield* labels.c().text('C changes', 0.3);
 *
 * // checking if the given reference exists:
 * if ('d' in labels) {
 *   yield* labels.d().text('D changes', 0.3);
 * }
 *
 * // accessing all references at once:
 * yield* all(...labels.mapRefs(label => label.fill('white', 0.3)));
 * ```
 */
export declare function createRefMap<T>(): ReferenceMap<T>;
//# sourceMappingURL=createRefMap.d.ts.map