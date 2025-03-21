import { ValueDispatcher } from '../../events';
/**
 * Manages time events during editing.
 */
export class EditableTimeEvents {
    get onChanged() {
        return this.events.subscribable;
    }
    constructor(scene) {
        this.scene = scene;
        this.events = new ValueDispatcher([]);
        this.registeredEvents = new Map();
        this.lookup = new Map();
        this.collisionLookup = new Set();
        this.previousReference = [];
        this.didEventsChange = false;
        this.preserveTiming = true;
        /**
         * Called when the parent scene gets reloaded.
         */
        this.handleReload = () => {
            this.registeredEvents.clear();
            this.collisionLookup.clear();
        };
        /**
         * Called when the parent scene gets recalculated.
         */
        this.handleRecalculated = () => {
            this.preserveTiming = true;
            this.events.current = [...this.registeredEvents.values()];
            if (this.didEventsChange ||
                (this.previousReference?.length ?? 0) !== this.events.current.length) {
                this.didEventsChange = false;
                this.previousReference = [...this.registeredEvents.values()].map(event => ({
                    name: event.name,
                    targetTime: event.targetTime,
                }));
                this.scene.meta.timeEvents.set(this.previousReference);
            }
        };
        this.handleReset = () => {
            this.collisionLookup.clear();
        };
        /**
         * Called when the meta of the parent scene changes.
         */
        this.handleMetaChanged = (data) => {
            // Ignore the event if `timeEvents` hasn't changed.
            // This may happen when another part of metadata has changed triggering
            // this event.
            if (data === this.previousReference)
                return;
            this.previousReference = data;
            this.load(data);
            this.scene.reload();
        };
        this.previousReference = scene.meta.timeEvents.get();
        this.load(this.previousReference);
        scene.onReloaded.subscribe(this.handleReload);
        scene.onRecalculated.subscribe(this.handleRecalculated);
        scene.onReset.subscribe(this.handleReset);
        scene.meta.timeEvents.onChanged.subscribe(this.handleMetaChanged, false);
    }
    set(name, offset, preserve = true) {
        let event = this.lookup.get(name);
        if (!event || event.offset === offset) {
            return;
        }
        this.preserveTiming = preserve;
        event = {
            ...event,
            targetTime: event.initialTime + offset,
            offset,
        };
        this.lookup.set(name, event);
        this.registeredEvents.set(name, event);
        this.events.current = [...this.registeredEvents.values()];
        this.didEventsChange = true;
        this.scene.reload();
    }
    register(name, initialTime) {
        if (this.collisionLookup.has(name)) {
            this.scene.logger.error({
                message: `name "${name}" has already been used for another event name.`,
                stack: new Error().stack,
            });
            return 0;
        }
        this.collisionLookup.add(name);
        let event = this.lookup.get(name);
        if (!event) {
            this.didEventsChange = true;
            event = {
                name,
                initialTime,
                targetTime: initialTime,
                offset: 0,
                stack: new Error().stack,
            };
            this.lookup.set(name, event);
        }
        else {
            let changed = false;
            const newEvent = { ...event };
            const stack = new Error().stack;
            if (newEvent.stack !== stack) {
                newEvent.stack = stack;
                changed = true;
            }
            if (newEvent.initialTime !== initialTime) {
                newEvent.initialTime = initialTime;
                changed = true;
            }
            const offset = Math.max(0, newEvent.targetTime - newEvent.initialTime);
            if (this.preserveTiming && newEvent.offset !== offset) {
                newEvent.offset = offset;
                changed = true;
            }
            const target = newEvent.initialTime + newEvent.offset;
            if (!this.preserveTiming && newEvent.targetTime !== target) {
                this.didEventsChange = true;
                newEvent.targetTime = target;
                changed = true;
            }
            if (changed) {
                event = newEvent;
                this.lookup.set(name, event);
            }
        }
        this.registeredEvents.set(name, event);
        return event.offset;
    }
    load(events) {
        for (const event of events) {
            const previous = this.lookup.get(event.name) ?? {
                name: event.name,
                initialTime: 0,
                offset: 0,
            };
            this.lookup.set(event.name, {
                ...previous,
                targetTime: event.targetTime,
            });
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRWRpdGFibGVUaW1lRXZlbnRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3NjZW5lcy90aW1lRXZlbnRzL0VkaXRhYmxlVGltZUV2ZW50cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFJQSxPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0sY0FBYyxDQUFDO0FBRTdDOztHQUVHO0FBQ0gsTUFBTSxPQUFPLGtCQUFrQjtJQUM3QixJQUFXLFNBQVM7UUFDbEIsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQztJQUNsQyxDQUFDO0lBVUQsWUFBb0MsS0FBWTtRQUFaLFVBQUssR0FBTCxLQUFLLENBQU87UUFUL0IsV0FBTSxHQUFHLElBQUksZUFBZSxDQUFjLEVBQUUsQ0FBQyxDQUFDO1FBRXZELHFCQUFnQixHQUFHLElBQUksR0FBRyxFQUFxQixDQUFDO1FBQ2hELFdBQU0sR0FBRyxJQUFJLEdBQUcsRUFBcUIsQ0FBQztRQUN0QyxvQkFBZSxHQUFHLElBQUksR0FBRyxFQUFVLENBQUM7UUFDcEMsc0JBQWlCLEdBQTBCLEVBQUUsQ0FBQztRQUM5QyxvQkFBZSxHQUFHLEtBQUssQ0FBQztRQUN4QixtQkFBYyxHQUFHLElBQUksQ0FBQztRQTBGOUI7O1dBRUc7UUFDSyxpQkFBWSxHQUFHLEdBQUcsRUFBRTtZQUMxQixJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDOUIsSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUMvQixDQUFDLENBQUM7UUFFRjs7V0FFRztRQUNLLHVCQUFrQixHQUFHLEdBQUcsRUFBRTtZQUNoQyxJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQztZQUMzQixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7WUFFMUQsSUFDRSxJQUFJLENBQUMsZUFB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