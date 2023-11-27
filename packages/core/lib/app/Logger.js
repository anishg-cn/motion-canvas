import { EventDispatcher } from '../events';
export var LogLevel;
(function (LogLevel) {
    LogLevel["Error"] = "error";
    LogLevel["Warn"] = "warn";
    LogLevel["Info"] = "info";
    LogLevel["Http"] = "http";
    LogLevel["Verbose"] = "verbose";
    LogLevel["Debug"] = "debug";
    LogLevel["Silly"] = "silly";
})(LogLevel || (LogLevel = {}));
export class Logger {
    constructor() {
        this.logged = new EventDispatcher();
        this.history = [];
        this.profilers = {};
    }
    /**
     * Triggered when a new message is logged.
     */
    get onLogged() {
        return this.logged.subscribable;
    }
    log(payload) {
        this.logged.dispatch(payload);
        this.history.push(payload);
    }
    error(payload) {
        this.logLevel(LogLevel.Error, payload);
    }
    warn(payload) {
        this.logLevel(LogLevel.Warn, payload);
    }
    info(payload) {
        this.logLevel(LogLevel.Info, payload);
    }
    http(payload) {
        this.logLevel(LogLevel.Http, payload);
    }
    verbose(payload) {
        this.logLevel(LogLevel.Verbose, payload);
    }
    debug(payload) {
        this.logLevel(LogLevel.Debug, payload);
    }
    silly(payload) {
        this.logLevel(LogLevel.Silly, payload);
    }
    logLevel(level, payload) {
        const result = typeof payload === 'string' ? { message: payload } : payload;
        result.level = level;
        this.log(result);
    }
    profile(id, payload) {
        const time = performance.now();
        if (this.profilers[id]) {
            const timeEnd = this.profilers[id];
            delete this.profilers[id];
            const result = payload ?? { message: id };
            result.level ?? (result.level = LogLevel.Debug);
            result.durationMs = time - timeEnd;
            this.log(result);
            return;
        }
        this.profilers[id] = time;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTG9nZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2FwcC9Mb2dnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLFdBQVcsQ0FBQztBQUUxQyxNQUFNLENBQU4sSUFBWSxRQVFYO0FBUkQsV0FBWSxRQUFRO0lBQ2xCLDJCQUFlLENBQUE7SUFDZix5QkFBYSxDQUFBO0lBQ2IseUJBQWEsQ0FBQTtJQUNiLHlCQUFhLENBQUE7SUFDYiwrQkFBbUIsQ0FBQTtJQUNuQiwyQkFBZSxDQUFBO0lBQ2YsMkJBQWUsQ0FBQTtBQUNqQixDQUFDLEVBUlcsUUFBUSxLQUFSLFFBQVEsUUFRbkI7QUFZRCxNQUFNLE9BQU8sTUFBTTtJQUFuQjtRQU9tQixXQUFNLEdBQUcsSUFBSSxlQUFlLEVBQWMsQ0FBQztRQUM1QyxZQUFPLEdBQWlCLEVBQUUsQ0FBQztRQUVuQyxjQUFTLEdBQTJCLEVBQUUsQ0FBQztJQXlEakQsQ0FBQztJQWxFQzs7T0FFRztJQUNILElBQVcsUUFBUTtRQUNqQixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDO0lBQ2xDLENBQUM7SUFNTSxHQUFHLENBQUMsT0FBbUI7UUFDNUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDOUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDN0IsQ0FBQztJQUVNLEtBQUssQ0FBQyxPQUE0QjtRQUN2QyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDekMsQ0FBQztJQUVNLElBQUksQ0FBQyxPQUE0QjtRQUN0QyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDeEMsQ0FBQztJQUVNLElBQUksQ0FBQyxPQUE0QjtRQUN0QyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDeEMsQ0FBQztJQUVNLElBQUksQ0FBQyxPQUE0QjtRQUN0QyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDeEMsQ0FBQztJQUVNLE9BQU8sQ0FBQyxPQUE0QjtRQUN6QyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDM0MsQ0FBQztJQUVNLEtBQUssQ0FBQyxPQUE0QjtRQUN2QyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDekMsQ0FBQztJQUVNLEtBQUssQ0FBQyxPQUE0QjtRQUN2QyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDekMsQ0FBQztJQUVTLFFBQVEsQ0FBQyxLQUFlLEVBQUUsT0FBNEI7UUFDOUQsTUFBTSxNQUFNLEdBQUcsT0FBTyxPQUFPLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDO1FBQzFFLE1BQU0sQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQ3JCLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDbkIsQ0FBQztJQUVNLE9BQU8sQ0FBQyxFQUFVLEVBQUUsT0FBb0I7UUFDN0MsTUFBTSxJQUFJLEdBQUcsV0FBVyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQy9CLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsRUFBRTtZQUN0QixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ25DLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUUxQixNQUFNLE1BQU0sR0FBRyxPQUFPLElBQUksRUFBQyxPQUFPLEVBQUUsRUFBRSxFQUFDLENBQUM7WUFDeEMsTUFBTSxDQUFDLEtBQUssS0FBWixNQUFNLENBQUMsS0FBSyxHQUFLLFFBQVEsQ0FBQyxLQUFLLEVBQUM7WUFDaEMsTUFBTSxDQUFDLFVBQVUsR0FBRyxJQUFJLEdBQUcsT0FBTyxDQUFDO1lBQ25DLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7WUFFakIsT0FBTztTQUNSO1FBRUQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUM7SUFDNUIsQ0FBQztDQUNGIn0=