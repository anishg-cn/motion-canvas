import { endThread, startThread } from '../utils';
import { createSignal } from '../signals';
import { setTaskName } from './names';
/**
 * A class representing an individual thread.
 *
 * @remarks
 * Thread is a wrapper for a generator that can be executed concurrently.
 *
 * Aside from the main thread, all threads need to have a parent.
 * If a parent finishes execution, all of its child threads are terminated.
 */
export class Thread {
    /**
     * The fixed time of this thread.
     *
     * @remarks
     * Fixed time is a multiple of the frame duration. It can be used to account
     * for the difference between this thread's {@link time} and the time of the
     * current animation frame.
     */
    get fixed() {
        return this.fixedTime;
    }
    /**
     * Check if this thread or any of its ancestors has been canceled.
     */
    get canceled() {
        return this.isCanceled || (this.parent?.canceled ?? false);
    }
    get paused() {
        return this.isPaused || (this.parent?.paused ?? false);
    }
    constructor(
    /**
     * The generator wrapped by this thread.
     */
    runner) {
        this.runner = runner;
        this.children = [];
        /**
         * The current time of this thread.
         *
         * @remarks
         * Used by {@link flow.waitFor} and other time-based functions to properly
         * support durations shorter than one frame.
         */
        this.time = createSignal(0);
        this.parent = null;
        this.isCanceled = false;
        this.isPaused = false;
        this.fixedTime = 0;
    }
    /**
     * Progress the wrapped generator once.
     */
    next() {
        if (this.paused) {
            return {
                value: null,
                done: false,
            };
        }
        startThread(this);
        const result = this.runner.next(this.value);
        endThread(this);
        this.value = null;
        return result;
    }
    /**
     * Prepare the thread for the next update cycle.
     *
     * @param dt - The delta time of the next cycle.
     */
    update(dt) {
        if (!this.paused) {
            this.time(this.time() + dt);
            this.fixedTime += dt;
        }
        this.children = this.children.filter(child => !child.canceled);
    }
    add(child) {
        child.cancel();
        child.parent = this;
        child.isCanceled = false;
        child.time(this.time());
        child.fixedTime = this.fixedTime;
        this.children.push(child);
        setTaskName(child.runner, `unknown ${this.children.length}`);
    }
    cancel() {
        this.isCanceled = true;
        this.parent = null;
    }
    pause(value) {
        this.isPaused = value;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGhyZWFkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3RocmVhZGluZy9UaHJlYWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFDLFNBQVMsRUFBRSxXQUFXLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFDaEQsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLFlBQVksQ0FBQztBQUN4QyxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sU0FBUyxDQUFDO0FBRXBDOzs7Ozs7OztHQVFHO0FBQ0gsTUFBTSxPQUFPLE1BQU07SUFnQmpCOzs7Ozs7O09BT0c7SUFDSCxJQUFXLEtBQUs7UUFDZCxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUM7SUFDeEIsQ0FBQztJQUVEOztPQUVHO0lBQ0gsSUFBVyxRQUFRO1FBQ2pCLE9BQU8sSUFBSSxDQUFDLFVBQVUsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsUUFBUSxJQUFJLEtBQUssQ0FBQyxDQUFDO0lBQzdELENBQUM7SUFFRCxJQUFXLE1BQU07UUFDZixPQUFPLElBQUksQ0FBQyxRQUFRLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsQ0FBQztJQUN6RCxDQUFDO0lBT0Q7SUFDRTs7T0FFRztJQUNhLE1BQXVCO1FBQXZCLFdBQU0sR0FBTixNQUFNLENBQWlCO1FBL0NsQyxhQUFRLEdBQWEsRUFBRSxDQUFDO1FBTS9COzs7Ozs7V0FNRztRQUNhLFNBQUksR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7UUF5QmhDLFdBQU0sR0FBa0IsSUFBSSxDQUFDO1FBQzVCLGVBQVUsR0FBRyxLQUFLLENBQUM7UUFDbkIsYUFBUSxHQUFHLEtBQUssQ0FBQztRQUNqQixjQUFTLEdBQUcsQ0FBQyxDQUFDO0lBT25CLENBQUM7SUFFSjs7T0FFRztJQUNJLElBQUk7UUFDVCxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDZixPQUFPO2dCQUNMLEtBQUssRUFBRSxJQUFJO2dCQUNYLElBQUksRUFBRSxLQUFLO2FBQ1osQ0FBQztTQUNIO1FBRUQsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2xCLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM1QyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDaEIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDbEIsT0FBTyxNQUFNLENBQUM7SUFDaEIsQ0FBQztJQUVEOzs7O09BSUc7SUFDSSxNQUFNLENBQUMsRUFBVTtRQUN0QixJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNoQixJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztZQUM1QixJQUFJLENBQUMsU0FBUyxJQUFJLEVBQUUsQ0FBQztTQUN0QjtRQUNELElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNqRSxDQUFDO0lBRU0sR0FBRyxDQUFDLEtBQWE7UUFDdEIsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ2YsS0FBSyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7UUFDcEIsS0FBSyxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUM7UUFDekIsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUN4QixLQUFLLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7UUFDakMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFMUIsV0FBVyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsV0FBVyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7SUFDL0QsQ0FBQztJQUVNLE1BQU07UUFDWCxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztRQUN2QixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztJQUNyQixDQUFDO0lBRU0sS0FBSyxDQUFDLEtBQWM7UUFDekIsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7SUFDeEIsQ0FBQztDQUNGIn0=