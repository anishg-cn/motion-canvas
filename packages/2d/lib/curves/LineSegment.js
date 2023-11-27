import { lineTo, moveTo } from '../utils';
import { Segment } from './Segment';
export class LineSegment extends Segment {
    constructor(from, to) {
        super();
        this.from = from;
        this.to = to;
        this.vector = to.sub(from);
        this.length = this.vector.magnitude;
        this.normal = this.vector.perpendicular.normalized.safe;
        this.points = [from, to];
    }
    get arcLength() {
        return this.length;
    }
    draw(context, start = 0, end = 1, move = false) {
        const from = this.from.add(this.vector.scale(start));
        const to = this.from.add(this.vector.scale(end));
        if (move) {
            moveTo(context, from);
        }
        lineTo(context, to);
        return [
            {
                position: from,
                tangent: this.normal.flipped,
                normal: this.normal,
            },
            {
                position: to,
                tangent: this.normal,
                normal: this.normal,
            },
        ];
    }
    getPoint(distance) {
        const point = this.from.add(this.vector.scale(distance));
        return {
            position: point,
            tangent: this.normal.flipped,
            normal: this.normal,
        };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTGluZVNlZ21lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY3VydmVzL0xpbmVTZWdtZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBQyxNQUFNLEVBQUUsTUFBTSxFQUFDLE1BQU0sVUFBVSxDQUFDO0FBQ3hDLE9BQU8sRUFBQyxPQUFPLEVBQUMsTUFBTSxXQUFXLENBQUM7QUFHbEMsTUFBTSxPQUFPLFdBQVksU0FBUSxPQUFPO0lBTXRDLFlBQ2tCLElBQWEsRUFDYixFQUFXO1FBRTNCLEtBQUssRUFBRSxDQUFDO1FBSFEsU0FBSSxHQUFKLElBQUksQ0FBUztRQUNiLE9BQUUsR0FBRixFQUFFLENBQVM7UUFHM0IsSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzNCLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUM7UUFDcEMsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDO1FBQ3hELElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDM0IsQ0FBQztJQUVELElBQVcsU0FBUztRQUNsQixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7SUFDckIsQ0FBQztJQUVNLElBQUksQ0FDVCxPQUEwQyxFQUMxQyxLQUFLLEdBQUcsQ0FBQyxFQUNULEdBQUcsR0FBRyxDQUFDLEVBQ1AsSUFBSSxHQUFHLEtBQUs7UUFFWixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ3JELE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDakQsSUFBSSxJQUFJLEVBQUU7WUFDUixNQUFNLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQ3ZCO1FBQ0QsTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztRQUVwQixPQUFPO1lBQ0w7Z0JBQ0UsUUFBUSxFQUFFLElBQUk7Z0JBQ2QsT0FBTyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTztnQkFDNUIsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNO2FBQ3BCO1lBQ0Q7Z0JBQ0UsUUFBUSxFQUFFLEVBQUU7Z0JBQ1osT0FBTyxFQUFFLElBQUksQ0FBQyxNQUFNO2dCQUNwQixNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU07YUFDcEI7U0FDRixDQUFDO0lBQ0osQ0FBQztJQUVNLFFBQVEsQ0FBQyxRQUFnQjtRQUM5QixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQ3pELE9BQU87WUFDTCxRQUFRLEVBQUUsS0FBSztZQUNmLE9BQU8sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU87WUFDNUIsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNO1NBQ3BCLENBQUM7SUFDSixDQUFDO0NBQ0YifQ==