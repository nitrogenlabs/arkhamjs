/**
 * Copyright (c) 2018-Present, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */

import {FluxAction} from '@nlabs/arkhamjs';
import {isEqual} from '@nlabs/utils/checks/isEqual';
import {cloneDeep} from '@nlabs/utils/objects/clone';

import {LoggerDebugLevel, LoggerOptions} from '../types/main';

export class Logger {
  name: string = 'Logger';

  private previousStore: any = {};
  private defaultOptions: LoggerOptions = {
    debugLevel: LoggerDebugLevel.DISABLED
  };
  private options: LoggerOptions = this.defaultOptions;

  constructor(options: LoggerOptions) {
    // Methods
    this.config = this.config.bind(this);
    this.debugError = this.debugError.bind(this);
    this.debugInfo = this.debugInfo.bind(this);
    this.debugLog = this.debugLog.bind(this);
    this.enableDebugger = this.enableDebugger.bind(this);
    this.getOptions = this.getOptions.bind(this);
    this.postDispatch = this.postDispatch.bind(this);
    this.preDispatch = this.preDispatch.bind(this);

    // Configuration
    this.config(options);
  }

  /**
   * Set configuration options.
   *
   * @param {object} options Configuration options.
   */
  config(options: LoggerOptions): void {
    this.options = {...this.defaultOptions, ...options};
  }

  /**
   * Logs errors in the console. Will also call the debugErrorFnc method set in the config.
   *
   * @param {object} obj A list of JavaScript objects to output. The string representations of each of these objects
   * are appended together in the order listed and output.
   */
  debugError(...obj): void {
    const {debugErrorFnc, debugLevel} = this.options;

    if(debugLevel) {
      console.error(...obj);
    }

    if(debugErrorFnc) {
      debugErrorFnc(debugLevel, ...obj);
    }
  }

  /**
   * Logs informational messages to the console. Will also call the debugInfoFnc method set in the config.
   *
   * @param {object} obj A list of JavaScript objects to output. The string representations of each of these objects
   * are appended together in the order listed and output.
   */
  debugInfo(...obj): void {
    const {debugInfoFnc, debugLevel} = this.options;

    if(debugLevel) {
      console.info(...obj);
    }

    if(debugInfoFnc) {
      debugInfoFnc(debugLevel, ...obj);
    }
  }

  /**
   * Logs data in the console. Only logs when in debug mode.  Will also call the debugLogFnc method set in the config.
   *
   * @param {object} obj A list of JavaScript objects to output. The string representations of each of these objects
   * are appended together in the order listed and output.
   */
  debugLog(...obj): void {
    const {debugLogFnc, debugLevel} = this.options;

    if(debugLevel) {
      console.log(...obj);
    }

    if(debugLogFnc) {
      debugLogFnc(debugLevel, ...obj);
    }
  }

  /**
   * Enables the console debugger.
   *
   * @param {number} level Enable or disable the debugger. Uses the constants:
   *   LoggerDebugLevel.DISABLED (0) - Disable.
   *   LoggerDebugLevel.LOGS (1) - Enable console logs.
   *   LoggerDebugLevel.DISPATCH (2) - Enable console logs and dispatch action data (default).
   */
  enableDebugger(level: number = LoggerDebugLevel.DISPATCH): void {
    this.options = {...this.options, debugLevel: level};
  }

  /**
   * Get the current FluxLogger options.
   *
   * @returns {LoggerOptions} the FluxLogger options object.
   */
  getOptions(): LoggerOptions {
    return this.options;
  }

  preDispatch(action: FluxAction, store): Promise<FluxAction> {
    this.previousStore = store;
    return Promise.resolve(action);
  }

  postDispatch(action: FluxAction, store: object): Promise<FluxAction> {
    const {debugLevel} = this.options;

    if(debugLevel > LoggerDebugLevel.LOGS) {
      const {type} = action;
      const hasChanged = !isEqual(store, this.previousStore);
      const updatedLabel = hasChanged ? 'Changed State' : 'Unchanged State';
      const updatedColor = hasChanged ? '#00d484' : '#959595';
      const updatedStore = cloneDeep(store);

      if(console.groupCollapsed) {
        console.groupCollapsed(`FLUX DISPATCH: ${type}`);
        console.log('%c Action: ', 'color: #00C4FF', action);
        console.log('%c Last State: ', 'color: #959595', this.previousStore);
        console.log(`%c ${updatedLabel}: `, `color: ${updatedColor}`, updatedStore);
        console.groupEnd();
      } else {
        console.log(`FLUX DISPATCH: ${type}`);
        console.log('Action: ', action);
        console.log('Last State: ', this.previousStore);
        console.log(`${updatedLabel}: `, updatedStore);
      }
    }

    return Promise.resolve(action);
  }
}
