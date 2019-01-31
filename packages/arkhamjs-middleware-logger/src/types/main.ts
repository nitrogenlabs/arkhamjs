export enum LoggerDebugLevel {
  DISABLED = 0,
  LOGS = 1,
  DISPATCH = 2
}

export interface LoggerOptions {
  readonly debugLevel?: LoggerDebugLevel;
  readonly debugErrorFnc?: (debugLevel: number, ...args) => void;
  readonly debugInfoFnc?: (debugLevel: number, ...args) => void;
  readonly debugLogFnc?: (debugLevel: number, ...args) => void;
}
