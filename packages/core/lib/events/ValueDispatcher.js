import { Subscribable, EventDispatcherBase, } from './EventDispatcherBase';
/**
 * Dispatches a {@link SubscribableValueEvent}
 *
 * @remarks
 * Changing the value stored by a value dispatcher will immediately notify all
 * its subscribers.
 *
 * @example
 * ```ts
 * class Example {
 *   // expose the event to external classes
 *   public get onValueChanged {
 *     return this.value.subscribable;
 *   }
 *   // create a private dispatcher
 *   private value = new ValueDispatcher(0);
 *
 *   private changingValueExample() {
 *     // changing the value will notify all subscribers.
 *     this.value.current = 7;
 *   }
 * }
 * ```
 *
 * @typeParam T - The type of the value passed to subscribers.
 */
export class ValueDispatcher extends EventDispatcherBase {
    /**
     * {@inheritDoc SubscribableValueEvent.current}
     */
    get current() {
        return this.value;
    }
    /**
     * Set the current value of this dispatcher.
     *
     * @remarks
     * Setting the value will immediately notify all subscribers.
     *
     * @param value - The new value.
     */
    set current(value) {
        this.value = value;
        this.notifySubscribers(value);
    }
    /**
     * @param value - The initial value.
     */
    constructor(value) {
        super();
        this.value = value;
        this.subscribable = new SubscribableValueEvent(this);
    }
    /**
     * {@inheritDoc SubscribableValueEvent.subscribe}
     */
    subscribe(handler, dispatchImmediately = true) {
        const unsubscribe = super.subscribe(handler);
        if (dispatchImmediately) {
            handler(this.value);
        }
        return unsubscribe;
    }
}
/**
 * Provides safe access to the public interface of {@link ValueDispatcher}.
 *
 * @remarks
 * External classes can use it to subscribe to an event without being able to
 * dispatch it.
 *
 * @typeParam T - The type of the value passed to subscribers.
 */
export class SubscribableValueEvent extends Subscribable {
    /**
     * Get the most recent value of this dispatcher.
     */
    get current() {
        return this.dispatcher.current;
    }
    /**
     * Subscribe to the event.
     *
     * Subscribing will immediately invoke the handler with the most recent value.
     *
     * @param handler - The handler to invoke when the event occurs.
     * @param dispatchImmediately - Whether the handler should be immediately
     *                              invoked with the most recent value.
     *
     * @returns Callback function that cancels the subscription.
     */
    subscribe(handler, dispatchImmediately = true) {
        return this.dispatcher.subscribe(handler, dispatchImmediately);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmFsdWVEaXNwYXRjaGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2V2ZW50cy9WYWx1ZURpc3BhdGNoZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUNMLFlBQVksRUFDWixtQkFBbUIsR0FFcEIsTUFBTSx1QkFBdUIsQ0FBQztBQUUvQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXlCRztBQUNILE1BQU0sT0FBTyxlQUFtQixTQUFRLG1CQUFzQjtJQUk1RDs7T0FFRztJQUNILElBQVcsT0FBTztRQUNoQixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUM7SUFDcEIsQ0FBQztJQUVEOzs7Ozs7O09BT0c7SUFDSCxJQUFXLE9BQU8sQ0FBQyxLQUFRO1FBQ3pCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQ25CLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNoQyxDQUFDO0lBRUQ7O09BRUc7SUFDSCxZQUEyQixLQUFRO1FBQ2pDLEtBQUssRUFBRSxDQUFDO1FBRGlCLFVBQUssR0FBTCxLQUFLLENBQUc7UUExQm5CLGlCQUFZLEdBQzFCLElBQUksc0JBQXNCLENBQUMsSUFBSSxDQUFDLENBQUM7SUEyQm5DLENBQUM7SUFFRDs7T0FFRztJQUNJLFNBQVMsQ0FBQyxPQUF3QixFQUFFLG1CQUFtQixHQUFHLElBQUk7UUFDbkUsTUFBTSxXQUFXLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM3QyxJQUFJLG1CQUFtQixFQUFFO1lBQ3ZCLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDckI7UUFDRCxPQUFPLFdBQVcsQ0FBQztJQUNyQixDQUFDO0NBQ0Y7QUFFRDs7Ozs7Ozs7R0FRRztBQUNILE1BQU0sT0FBTyxzQkFBMEIsU0FBUSxZQUc5QztJQUNDOztPQUVHO0lBQ0gsSUFBVyxPQUFPO1FBQ2hCLE9BQTRCLElBQUksQ0FBQyxVQUFXLENBQUMsT0FBTyxDQUFDO0lBQ3ZELENBQUM7SUFFRDs7Ozs7Ozs7OztPQVVHO0lBQ0ksU0FBUyxDQUNkLE9BQXdCLEVBQ3hCLG1CQUFtQixHQUFHLElBQUk7UUFFMUIsT0FBNEIsSUFBSSxDQUFDLFVBQVcsQ0FBQyxTQUFTLENBQ3BELE9BQU8sRUFDUCxtQkFBbUIsQ0FDcEIsQ0FBQztJQUNKLENBQUM7Q0FDRiJ9