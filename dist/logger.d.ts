import { LoggerManager } from 'logging-library/lib/LoggerManager';
export declare enum LogLevel {
    DEBUG = "debug",
    ERROR = "error",
    INFO = "info",
    TRACE = "trace",
    WARNING = "warning"
}
export declare const REQUEST_ID = "requestId";
export declare class ArchiveLogger extends LoggerManager {
    static getDefaultBlueprintIdentifier(): string;
}
