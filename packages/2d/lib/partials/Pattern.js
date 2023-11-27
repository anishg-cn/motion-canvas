var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { initial, initializeSignals, signal } from '../decorators/signal';
import { computed } from '../decorators/computed';
export class Pattern {
    constructor(props) {
        initializeSignals(this, props);
    }
    canvasPattern(context) {
        return context.createPattern(this.image(), this.repetition());
    }
}
__decorate([
    signal()
], Pattern.prototype, "image", void 0);
__decorate([
    initial(null),
    signal()
], Pattern.prototype, "repetition", void 0);
__decorate([
    computed()
], Pattern.prototype, "canvasPattern", null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGF0dGVybi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wYXJ0aWFscy9QYXR0ZXJuLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLE9BQU8sRUFBQyxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFDeEUsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBZ0JoRCxNQUFNLE9BQU8sT0FBTztJQU9sQixZQUFtQixLQUFtQjtRQUNwQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDakMsQ0FBQztJQUdNLGFBQWEsQ0FDbEIsT0FBaUM7UUFFakMsT0FBTyxPQUFPLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztJQUNoRSxDQUFDO0NBQ0Y7QUFmQztJQURDLE1BQU0sRUFBRTtzQ0FDNEQ7QUFHckU7SUFGQyxPQUFPLENBQUMsSUFBSSxDQUFDO0lBQ2IsTUFBTSxFQUFFOzJDQUNnRTtBQU96RTtJQURDLFFBQVEsRUFBRTs0Q0FLViJ9