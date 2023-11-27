var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { initial, initializeSignals, signal } from '../decorators/signal';
import { vector2Signal } from '../decorators/vector2Signal';
import { computed } from '../decorators/computed';
import { Color, } from '@motion-canvas/core/lib/types';
import { unwrap, } from '@motion-canvas/core/lib/signals';
export class Gradient {
    constructor(props) {
        initializeSignals(this, props);
    }
    canvasGradient(context) {
        let gradient;
        switch (this.type()) {
            case 'linear':
                gradient = context.createLinearGradient(this.from.x(), this.from.y(), this.to.x(), this.to.y());
                break;
            case 'conic':
                gradient = context.createConicGradient(this.angle(), this.from.x(), this.from.y());
                break;
            case 'radial':
                gradient = context.createRadialGradient(this.from.x(), this.from.y(), this.fromRadius(), this.to.x(), this.to.y(), this.toRadius());
                break;
        }
        for (const { offset, color } of this.stops()) {
            gradient.addColorStop(unwrap(offset), new Color(unwrap(color)).serialize());
        }
        return gradient;
    }
}
__decorate([
    initial('linear'),
    signal()
], Gradient.prototype, "type", void 0);
__decorate([
    vector2Signal('from')
], Gradient.prototype, "from", void 0);
__decorate([
    vector2Signal('to')
], Gradient.prototype, "to", void 0);
__decorate([
    initial(0),
    signal()
], Gradient.prototype, "angle", void 0);
__decorate([
    initial(0),
    signal()
], Gradient.prototype, "fromRadius", void 0);
__decorate([
    initial(0),
    signal()
], Gradient.prototype, "toRadius", void 0);
__decorate([
    initial([]),
    signal()
], Gradient.prototype, "stops", void 0);
__decorate([
    computed()
], Gradient.prototype, "canvasGradient", null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR3JhZGllbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcGFydGlhbHMvR3JhZGllbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsT0FBTyxFQUFDLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQUN4RSxPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0sNkJBQTZCLENBQUM7QUFDMUQsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBQ2hELE9BQU8sRUFDTCxLQUFLLEdBSU4sTUFBTSwrQkFBK0IsQ0FBQztBQUN2QyxPQUFPLEVBR0wsTUFBTSxHQUNQLE1BQU0saUNBQWlDLENBQUM7QUF1QnpDLE1BQU0sT0FBTyxRQUFRO0lBd0JuQixZQUFtQixLQUFvQjtRQUNyQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDakMsQ0FBQztJQUdNLGNBQWMsQ0FBQyxPQUFpQztRQUNyRCxJQUFJLFFBQXdCLENBQUM7UUFDN0IsUUFBUSxJQUFJLENBQUMsSUFBSSxFQUFFLEVBQUU7WUFDbkIsS0FBSyxRQUFRO2dCQUNYLFFBQVEsR0FBRyxPQUFPLENBQUMsb0JBQW9CLENBQ3JDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLEVBQ2IsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsRUFDYixJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUNYLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQ1osQ0FBQztnQkFDRixNQUFNO1lBQ1IsS0FBSyxPQUFPO2dCQUNWLFFBQVEsR0FBRyxPQUFPLENBQUMsbUJBQW1CLENBQ3BDLElBQUksQ0FBQyxLQUFLLEVBQUUsRUFDWixJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxFQUNiLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQ2QsQ0FBQztnQkFDRixNQUFNO1lBQ1IsS0FBSyxRQUFRO2dCQUNYLFFBQVEsR0FBRyxPQUFPLENBQUMsb0JBQW9CLENBQ3JDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLEVBQ2IsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsRUFDYixJQUFJLENBQUMsVUFBVSxFQUFFLEVBQ2pCLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQ1gsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFDWCxJQUFJLENBQUMsUUFBUSxFQUFFLENBQ2hCLENBQUM7Z0JBQ0YsTUFBTTtTQUNUO1FBRUQsS0FBSyxNQUFNLEVBQUMsTUFBTSxFQUFFLEtBQUssRUFBQyxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUUsRUFBRTtZQUMxQyxRQUFRLENBQUMsWUFBWSxDQUNuQixNQUFNLENBQUMsTUFBTSxDQUFDLEVBQ2QsSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFLENBQ3JDLENBQUM7U0FDSDtRQUVELE9BQU8sUUFBUSxDQUFDO0lBQ2xCLENBQUM7Q0FDRjtBQWpFQztJQUZDLE9BQU8sQ0FBQyxRQUFRLENBQUM7SUFDakIsTUFBTSxFQUFFO3NDQUNzRDtBQUcvRDtJQURDLGFBQWEsQ0FBQyxNQUFNLENBQUM7c0NBQzRCO0FBR2xEO0lBREMsYUFBYSxDQUFDLElBQUksQ0FBQztvQ0FDNEI7QUFJaEQ7SUFGQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBQ1YsTUFBTSxFQUFFO3VDQUNpRDtBQUcxRDtJQUZDLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFDVixNQUFNLEVBQUU7NENBQ3NEO0FBRy9EO0lBRkMsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUNWLE1BQU0sRUFBRTswQ0FDb0Q7QUFHN0Q7SUFGQyxPQUFPLENBQUMsRUFBRSxDQUFDO0lBQ1gsTUFBTSxFQUFFO3VDQUN5RDtBQU9sRTtJQURDLFFBQVEsRUFBRTs4Q0F1Q1YifQ==