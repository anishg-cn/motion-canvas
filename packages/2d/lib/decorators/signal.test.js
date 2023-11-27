var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { initial, initializeSignals, parser, signal } from './signal';
import { DEFAULT } from '@motion-canvas/core/lib/signals';
class Owner {
    getCustom() {
        return 4;
    }
    setCustom() {
        // do nothing
    }
    constructor(props = {}) {
        initializeSignals(this, props);
    }
}
__decorate([
    initial(2.2),
    parser((value) => Math.round(value)),
    signal()
], Owner.prototype, "integer", void 0);
__decorate([
    initial(0),
    signal()
], Owner.prototype, "custom", void 0);
const GetterMock = vi.spyOn(Owner.prototype, 'getCustom');
const SetterMock = vi.spyOn(Owner.prototype, 'setCustom');
describe('signal', () => {
    beforeEach(() => {
        GetterMock.mockClear();
        SetterMock.mockClear();
    });
    test('Has initial value', () => {
        const instance = new Owner();
        expect(instance.integer()).toBe(2);
        expect(instance.integer.isInitial()).toBe(true);
    });
    test('Overrides the value', () => {
        const instance = new Owner({ integer: 4 });
        expect(instance.integer()).toBe(4);
        expect(instance.integer.isInitial()).toBe(false);
    });
    test('Resets the value to default', () => {
        const instance = new Owner({ integer: 4 });
        instance.integer(DEFAULT);
        expect(instance.integer()).toBe(2);
        expect(instance.integer.isInitial()).toBe(true);
    });
    test('Parses the value', () => {
        const instance = new Owner();
        instance.integer(2.7);
        expect(instance.integer()).toBe(3);
    });
    test('Uses the custom getter', () => {
        const instance = new Owner();
        const value = instance.custom();
        expect(value).toBe(4);
        expect(GetterMock).toBeCalledTimes(1);
    });
    test('Calls the setter with the initial value', () => {
        new Owner();
        expect(SetterMock).toBeCalledWith(0);
    });
    test('Uses the setter', () => {
        const instance = new Owner({ custom: 1 });
        instance.custom(2);
        expect(SetterMock).toBeCalledTimes(3);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2lnbmFsLnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZGVjb3JhdG9ycy9zaWduYWwudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxPQUFPLEVBQUMsVUFBVSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBQyxNQUFNLFFBQVEsQ0FBQztBQUM5RCxPQUFPLEVBQUMsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFDcEUsT0FBTyxFQUFDLE9BQU8sRUFBZSxNQUFNLGlDQUFpQyxDQUFDO0FBT3RFLE1BQU0sS0FBSztJQVNGLFNBQVM7UUFDZCxPQUFPLENBQUMsQ0FBQztJQUNYLENBQUM7SUFDTSxTQUFTO1FBQ2QsYUFBYTtJQUNmLENBQUM7SUFFRCxZQUFtQixRQUFvQixFQUFFO1FBQ3ZDLGlCQUFpQixDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNqQyxDQUFDO0NBQ0Y7QUFmQztJQUhDLE9BQU8sQ0FBQyxHQUFHLENBQUM7SUFDWixNQUFNLENBQUMsQ0FBQyxLQUFhLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDNUMsTUFBTSxFQUFFO3NDQUM2QztBQUl0RDtJQUZDLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFDVixNQUFNLEVBQUU7cUNBQzRDO0FBYXZELE1BQU0sVUFBVSxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxXQUFXLENBQUMsQ0FBQztBQUMxRCxNQUFNLFVBQVUsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsV0FBVyxDQUFDLENBQUM7QUFFMUQsUUFBUSxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUU7SUFDdEIsVUFBVSxDQUFDLEdBQUcsRUFBRTtRQUNkLFVBQVUs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