export declare enum LogLevel {
    Error = "error",
    Warn = "warn",
    Info = "info",
    Http = "http",
    Verbose = "verbose",
    Debug = "debug",
    Silly = "silly"
}
export interface LogPayload {
    level?: LogLevel;
    message: string;
    stack?: string;
    remarks?: string;
    object?: any;
    durationMs?: number;
    [K: string]: any;
}
export declare class Logger {
    /**
     * Triggered when a new message is logged.
     */
    get onLogged(): import("../events").Subscribable<LogPayload, import("../events").EventHandler<LogPayload>>;
    private readonly logged;
    readonly history: LogPayload[];
    private profilers;
    log(payload: LogPayload): void;
    error(payload: string | LogPayload): void;
    warn(payload: string | LogPayload): void;
    info(payload: string | LogPayload): void;
    http(payload: string | LogPayload): void;
    verbose(payload: string | LogPayload): void;
    debug(payload: string | LogPayload): void;
    silly(payload: string | LogPayload): void;
    protected logLevel(level: LogLevel, payload: string | LogPayload): void;
    profile(id: string, payload?: LogPayload): void;
}
//# sourceMappingURL=Logger.d.ts.map