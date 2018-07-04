export enum LoggerDebugLevel {DISABLED, LOGS, DISPATCH}

export interface LoggerOptions {
  readonly debugLevel?: LoggerDebugLevel;
  readonly debugErrorFnc?: (debugLevel: number, ...args) => void;
  readonly debugInfoFnc?: (debugLevel: number, ...args) => void;
  readonly debugLogFnc?: (debugLevel: number, ...args) => void;
}
