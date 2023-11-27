import { capitalize } from '@motion-canvas/core/lib/utils';
export function defaultStyle(styleName, parse = value => value) {
    return (target, key) => {
        target[`getDefault${capitalize(key)}`] = function () {
            this.requestLayoutUpdate();
            const old = this.element.style[styleName];
            this.element.style[styleName] = '';
            const ret = parse.call(this, this.styles.getPropertyValue(styleName));
            this.element.style[styleName] = old;
            return ret;
        };
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmYXVsdFN0eWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2RlY29yYXRvcnMvZGVmYXVsdFN0eWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSwrQkFBK0IsQ0FBQztBQUd6RCxNQUFNLFVBQVUsWUFBWSxDQUMxQixTQUFpQixFQUNqQixRQUE4QixLQUFLLENBQUMsRUFBRSxDQUFDLEtBQVU7SUFFakQsT0FBTyxDQUFDLE1BQVcsRUFBRSxHQUFHLEVBQUUsRUFBRTtRQUMxQixNQUFNLENBQUMsYUFBYSxVQUFVLENBQVMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHO1lBQy9DLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1lBQzNCLE1BQU0sR0FBRyxHQUFTLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzNDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUMxQyxNQUFNLEdBQUcsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDaEUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsR0FBRyxDQUFDO1lBQzNDLE9BQU8sR0FBRyxDQUFDO1FBQ2IsQ0FBQyxDQUFDO0lBQ0osQ0FBQyxDQUFDO0FBQ0osQ0FBQyJ9