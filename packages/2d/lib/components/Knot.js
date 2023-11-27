var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Vector2, } from '@motion-canvas/core/lib/types';
import { Node } from './Node';
import { cloneable, compound, computed, initial, parser, signal, wrapper, } from '../decorators';
/**
 * A node representing a knot of a {@link Spline}.
 */
export class Knot extends Node {
    get startHandleAuto() {
        return this.auto.startHandle;
    }
    get endHandleAuto() {
        return this.auto.endHandle;
    }
    constructor(props) {
        super(props.startHandle === undefined && props.endHandle === undefined
            ? { auto: 1, ...props }
            : props);
    }
    points() {
        const hasExplicitHandles = !this.startHandle.isInitial() || !this.endHandle.isInitial();
        const startHandle = hasExplicitHandles ? this.startHandle() : Vector2.zero;
        const endHandle = hasExplicitHandles ? this.endHandle() : Vector2.zero;
        return {
            position: this.position(),
            startHandle: startHandle.transformAsPoint(this.localToParent()),
            endHandle: endHandle.transformAsPoint(this.localToParent()),
            auto: { start: this.startHandleAuto(), end: this.endHandleAuto() },
        };
    }
    getDefaultEndHandle() {
        return this.startHandle().flipped;
    }
    getDefaultStartHandle() {
        return this.endHandle().flipped;
    }
}
__decorate([
    wrapper(Vector2),
    signal()
], Knot.prototype, "startHandle", void 0);
__decorate([
    wrapper(Vector2),
    signal()
], Knot.prototype, "endHandle", void 0);
__decorate([
    cloneable(false),
    initial(() => ({ startHandle: 0, endHandle: 0 })),
    parser((value) => {
        if (typeof value === 'object' && !Array.isArray(value)) {
            return value;
        }
        if (typeof value === 'number') {
            value = [value, value];
        }
        return { startHandle: value[0], endHandle: value[1] };
    }),
    compound({ startHandle: 'startHandleAuto', endHandle: 'endHandleAuto' })
], Knot.prototype, "auto", void 0);
__decorate([
    computed()
], Knot.prototype, "points", null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiS25vdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21wb25lbnRzL0tub3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQ0EsT0FBTyxFQUVMLE9BQU8sR0FFUixNQUFNLCtCQUErQixDQUFDO0FBRXZDLE9BQU8sRUFBQyxJQUFJLEVBQVksTUFBTSxRQUFRLENBQUM7QUFDdkMsT0FBTyxFQUNMLFNBQVMsRUFDVCxRQUFRLEVBQ1IsUUFBUSxFQUNSLE9BQU8sRUFDUCxNQUFNLEVBQ04sTUFBTSxFQUNOLE9BQU8sR0FDUixNQUFNLGVBQWUsQ0FBQztBQThCdkI7O0dBRUc7QUFDSCxNQUFNLE9BQU8sSUFBSyxTQUFRLElBQUk7SUFvRTVCLElBQVcsZUFBZTtRQUN4QixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDO0lBQy9CLENBQUM7SUFDRCxJQUFXLGFBQWE7UUFDdEIsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQztJQUM3QixDQUFDO0lBRUQsWUFBbUIsS0FBZ0I7UUFDakMsS0FBSyxDQUNILEtBQUssQ0FBQyxXQUFXLEtBQUssU0FBUyxJQUFJLEtBQUssQ0FBQyxTQUFTLEtBQUssU0FBUztZQUM5RCxDQUFDLENBQUMsRUFBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEdBQUcsS0FBSyxFQUFDO1lBQ3JCLENBQUMsQ0FBQyxLQUFLLENBQ1YsQ0FBQztJQUNKLENBQUM7SUFHTSxNQUFNO1FBQ1gsTUFBTSxrQkFBa0IsR0FDdEIsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUMvRCxNQUFNLFdBQVcsR0FBRyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDO1FBQzNFLE1BQU0sU0FBUyxHQUFHLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7UUFFdkUsT0FBTztZQUNMLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ3pCLFdBQVcsRUFBRSxXQUFXLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQy9ELFNBQVMsRUFBRSxTQUFTLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQzNELElBQUksRUFBRSxFQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsZUFBZSxFQUFFLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUUsRUFBQztTQUNqRSxDQUFDO0lBQ0osQ0FBQztJQUVPLG1CQUFtQjtRQUN6QixPQUFPLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxPQUFPLENBQUM7SUFDcEMsQ0FBQztJQUVPLHFCQUFxQjtRQUMzQixPQUFPLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxPQUFPLENBQUM7SUFDbEMsQ0FBQztDQUNGO0FBcEZDO0lBRkMsT0FBTyxDQUFDLE9BQU8sQ0FBQztJQUNoQixNQUFNLEVBQUU7eUNBQ2dEO0FBc0J6RDtJQUZDLE9BQU8sQ0FBQyxPQUFPLENBQUM7SUFDaEIsTUFBTSxFQUFFO3VDQUM4QztBQXdCdkQ7SUFaQyxTQUFTLENBQUMsS0FBSyxDQUFDO0lBQ2hCLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUMsV0FBVyxFQUFFLENBQUMsRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFDLENBQUMsQ0FBQztJQUMvQyxNQUFNLENBQUMsQ0FBQyxLQUF1QixFQUFFLEVBQUU7UUFDbEMsSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ3RELE9BQU8sS0FBSyxDQUFDO1NBQ2Q7UUFDRCxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFBRTtZQUM3QixLQUFLLEdBQUcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7U0FDeEI7UUFDRCxPQUFPLEVBQUMsV0FBVyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUM7SUFDdEQsQ0FBQyxDQUFDO0lBQ0QsUUFBUSxDQUFDLEVBQUMsV0FBVyxFQUFFLGlCQUFpQixFQUFFLFNBQVMsRUFBRSxlQUFlLEVBQUMsQ0FBQztrQ0FDcEI7QUFpQm5EO0lBREMsUUFBUSxFQUFFO2tDQWFWIn0=