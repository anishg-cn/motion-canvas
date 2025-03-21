import { useScene } from '../utils';
/**
 * Transition to the current scene by altering the Context2D before scenes are rendered.
 *
 * @param current - The callback to use before the current scene is rendered.
 * @param previous - The callback to use before the previous scene is rendered.
 * @param previousOnTop - Whether the previous scene should be rendered on top.
 */
export function useTransition(current, previous, previousOnTop) {
    if (previous == null) {
        previous = () => {
            // do nothing
        };
    }
    const scene = useScene();
    const prior = scene.previous;
    scene.previousOnTop = previousOnTop ?? false;
    const unsubPrev = prior?.lifecycleEvents.onBeforeRender.subscribe(previous);
    const unsubNext = scene.lifecycleEvents.onBeforeRender.subscribe(current);
    scene.enterInitial();
    return () => {
        scene.enterAfterTransitionIn();
        unsubPrev?.();
        unsubNext();
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlVHJhbnNpdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90cmFuc2l0aW9ucy91c2VUcmFuc2l0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFFbEM7Ozs7OztHQU1HO0FBQ0gsTUFBTSxVQUFVLGFBQWEsQ0FDM0IsT0FBZ0QsRUFDaEQsUUFBa0QsRUFDbEQsYUFBb0M7SUFFcEMsSUFBSSxRQUFRLElBQUksSUFBSSxFQUFFO1FBQ3BCLFFBQVEsR0FBRyxHQUFHLEVBQUU7WUFDZCxhQUFhO1FBQ2YsQ0FBQyxDQUFDO0tBQ0g7SUFFRCxNQUFNLEtBQUssR0FBRyxRQUFRLEVBQUUsQ0FBQztJQUN6QixNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDO0lBQzdCLEtBQUssQ0FBQyxhQUFhLEdBQUcsYUFBYSxJQUFJLEtBQUssQ0FBQztJQUU3QyxNQUFNLFNBQVMsR0FBRyxLQUFLLEVBQUUsZUFBZSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDNUUsTUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLGVBQWUsQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBRTFFLEtBQUssQ0FBQyxZQUFZLEVBQUUsQ0FBQztJQUVyQixPQUFPLEdBQUcsRUFBRTtRQUNWLEtBQUssQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO1FBQy9CLFNBQVMsRUFBRSxFQUFFLENBQUM7UUFDZCxTQUFTLEVBQUUsQ0FBQztJQUNkLENBQUMsQ0FBQztBQUNKLENBQUMifQ==