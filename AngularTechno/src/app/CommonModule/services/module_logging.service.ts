import { Injectable } from "@angular/core";

export enum LoggingLevel {
    DEBUG, INFO, ERROR, WARN
}

@Injectable()
export class ModuleLoggingService {

    private loggingLevel: LoggingLevel = LoggingLevel.INFO;

    constructor(level: LoggingLevel) {
        this.loggingLevel = level;
    }

    info(message: string): void {
        if (LoggingLevel.INFO >= this.loggingLevel) {
            console.info(message);
        }
    }

    debug(message: string) {
        if (LoggingLevel.DEBUG >= this.loggingLevel) {
            console.debug(message);
        }
    }

    error(message: string) {
        if (LoggingLevel.ERROR >= this.loggingLevel) {
            console.error(message);
        }
    }

    warn(message: string) {
        if (LoggingLevel.WARN >= this.loggingLevel) {
            console.warn(message);
        }
    }
}