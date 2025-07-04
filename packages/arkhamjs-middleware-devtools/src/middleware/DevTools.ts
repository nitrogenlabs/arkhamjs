/**
 * Copyright (c) 2018-Present, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
import { Flux, FluxAction } from '@nlabs/arkhamjs';

export interface DevToolsOptions {
  mode?: 'development' | 'production';
  logActions?: boolean;
  logState?: boolean;
  logPerformance?: boolean;
  maxHistory?: number;
  filterActions?: string[];
  excludeActions?: string[];
  stateSanitizer?: (state: any) => any;
  actionSanitizer?: (action: any) => any;
  slowActionThreshold?: number;
  enableTimeTravel?: boolean;
  enableStateDiff?: boolean;
  enableWebSocket?: boolean;
  webSocketPort?: number;
  enableRemoteDebugging?: boolean;
}

export interface DevToolsMessage {
  type: string;
  payload: any;
  timestamp: number;
  id?: string;
}

export interface ActionRecord {
  id: string;
  action: any;
  state: any;
  timestamp: number;
  duration: number;
  stack?: string;
  prevState?: any;
}

export interface PerformanceMetrics {
  actionCount: number;
  averageDuration: number;
  slowActions: string[];
  memoryUsage?: number;
  stateSize?: number;
}

export class DevTools {
  name: string = 'DevTools';
  mode: string = 'development';
  private options: DevToolsOptions;
  private actionHistory: ActionRecord[] = [];
  private messageId: number = 0;
  private isConnected: boolean = false;
  private connectionCheckInterval?: number;
  private webSocket?: WebSocket;
  private performanceMetrics: PerformanceMetrics = {
    actionCount: 0,
    averageDuration: 0,
    slowActions: []
  };

  constructor(options: DevToolsOptions = {}) {
    this.options = {
      mode: 'development',
      logActions: true,
      logState: true,
      logPerformance: true,
      maxHistory: 50,
      slowActionThreshold: 100,
      enableTimeTravel: true,
      enableStateDiff: true,
      enableWebSocket: false,
      webSocketPort: 8097,
      enableRemoteDebugging: false,
      ...options
    };

    // Bind methods
    this.postDispatch = this.postDispatch.bind(this);
    this.postMessage = this.postMessage.bind(this);
    this.setMode = this.setMode.bind(this);
    this.sendMethod = this.sendMethod.bind(this);
    this.handleMessage = this.handleMessage.bind(this);

    // Initialize
    this.initialize();
  }

  private initialize(): void {
    Flux.onInit(() => {
      const arkhamOptions = JSON.stringify(Flux.getOptions(), null, 0);
      this.postMessage({
        type: 'ARKHAM_INIT',
        payload: { options: arkhamOptions },
        timestamp: Date.now()
      });
    });

    this.setMode(this.options.mode!);
    this.startConnectionCheck();

    if (this.options.enableWebSocket) {
      this.initializeWebSocket();
    }
  }

  private initializeWebSocket(): void {
    try {
      this.webSocket = new WebSocket(`ws://localhost:${this.options.webSocketPort}`);

      this.webSocket.onopen = () => {
        console.log('DevTools WebSocket connected');
        this.sendInitialData();
      };

      this.webSocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleWebSocketMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.webSocket.onerror = (error) => {
        console.error('DevTools WebSocket error:', error);
      };

      this.webSocket.onclose = () => {
        console.log('DevTools WebSocket disconnected');
        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          if (this.options.enableWebSocket) {
            this.initializeWebSocket();
          }
        }, 5000);
      };
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
    }
  }

  private handleWebSocketMessage(data: any): void {
    switch (data.type) {
      case 'GET_STATE':
        this.sendCurrentState();
        break;
      case 'GET_ACTION_HISTORY':
        this.sendActionHistory();
        break;
      case 'TIME_TRAVEL':
        this.handleTimeTravel(data.payload.actionId);
        break;
      case 'CLEAR_HISTORY':
        this.clearHistory();
        break;
      case 'GET_PERFORMANCE_METRICS':
        this.sendPerformanceMetrics();
        break;
      case 'EXPORT_STATE':
        this.exportState();
        break;
      case 'CREATE_SNAPSHOT':
        this.createStateSnapshot(data.payload.name);
        break;
      case 'EXPORT_SNAPSHOT':
        const snapshotData = this.exportStateSnapshot(data.payload.snapshotId);
        this.postMessage({
          type: 'SNAPSHOT_EXPORTED',
          payload: { snapshotData },
          timestamp: Date.now()
        });
        break;
      case 'IMPORT_SNAPSHOT':
        const success = this.importStateSnapshot(data.payload.snapshotData);
        this.postMessage({
          type: 'SNAPSHOT_IMPORT_RESULT',
          payload: { success },
          timestamp: Date.now()
        });
        break;
      case 'DOWNLOAD_SNAPSHOT':
        this.downloadStateSnapshot(data.payload.snapshotId);
        break;
    }
  }

  private sendCurrentState(): void {
    const currentState = Flux.getState();
    this.postMessage({
      type: 'CURRENT_STATE',
      payload: { state: currentState },
      timestamp: Date.now()
    });
  }

  private sendActionHistory(): void {
    this.postMessage({
      type: 'ACTION_HISTORY',
      payload: { history: this.actionHistory },
      timestamp: Date.now()
    });
  }

  private sendPerformanceMetrics(): void {
    this.postMessage({
      type: 'PERFORMANCE_METRICS',
      payload: { metrics: this.performanceMetrics },
      timestamp: Date.now()
    });
  }

  get isActive(): boolean {
    return this.mode === 'development' && (this.isConnected || this.webSocket?.readyState === WebSocket.OPEN);
  }

  setMode(mode: string = 'development'): void {
    this.mode = mode;

    if (mode === 'development') {
      window.addEventListener('message', this.handleMessage);
      this.postMessage({
        type: 'DEVTOOLS_MODE_CHANGED',
        payload: { mode },
        timestamp: Date.now()
      });
    } else {
      window.removeEventListener('message', this.handleMessage);
      this.stopConnectionCheck();
    }
  }

  private handleMessage(event: MessageEvent): void {
    const { data } = event;

    if (data && data.type === 'DEVTOOLS_CONNECT') {
      this.isConnected = true;
      this.sendInitialData();
      return;
    }

    if (data && data.type === 'DEVTOOLS_DISCONNECT') {
      this.isConnected = false;
      return;
    }

    // Legacy support for _arkhamCall
    if (data && data._arkhamCall) {
      this.sendMethod(event);
    }
  }

  private sendMethod(event: MessageEvent): void {
    const { _arkhamCall: { method = '', args = [] } = {} } = event.data;

    if (method !== '') {
      switch (method) {
        case 'dispatch':
          Flux[method](...args);
          break;
        case 'storeClasses': {
          const stores = Flux[method];
          const storeDetails = Object.keys(stores).map((storeName: string) => {
            const store = stores[storeName];
            return { initialState: store.initialState(), name: store.name };
          });
          this.postMessage({
            type: 'STORE_CLASSES',
            payload: { stores: storeDetails },
            timestamp: Date.now()
          });
          break;
        }
        case 'timeTravel':
          this.handleTimeTravel(args[0]);
          break;
        case 'getActionHistory':
          this.postMessage({
            type: 'ACTION_HISTORY',
            payload: { history: this.actionHistory },
            timestamp: Date.now()
          });
          break;
      }
    }
  }

  private handleTimeTravel(actionId: string): void {
    const targetAction = this.actionHistory.find(record => record.id === actionId);
    if (targetAction && targetAction.prevState) {
      // Restore to previous state by setting each store's state
      Object.keys(targetAction.prevState).forEach(storeName => {
        Flux.setState(storeName, targetAction.prevState[storeName]);
      });
      this.postMessage({
        type: 'TIME_TRAVEL_COMPLETE',
        payload: { actionId, state: targetAction.prevState },
        timestamp: Date.now()
      });
    }
  }

  private sendInitialData(): void {
    // Send current state
    const currentState = Flux.getState();
    this.postMessage({
      type: 'CURRENT_STATE',
      payload: { state: currentState },
      timestamp: Date.now()
    });

    // Send action history
    this.postMessage({
      type: 'ACTION_HISTORY',
      payload: { history: this.actionHistory },
      timestamp: Date.now()
    });
  }

  private startConnectionCheck(): void {
    this.connectionCheckInterval = setInterval(() => {
      if (this.mode === 'development') {
        this.postMessage({
          type: 'PING',
          payload: {},
          timestamp: Date.now()
        });
      }
    }, 5000);
  }

  private stopConnectionCheck(): void {
    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval);
    }
  }

  private sanitizeData(data: any, sanitizer?: (data: any) => any): any {
    if (sanitizer) {
      return sanitizer(data);
    }
    return data;
  }

  private shouldLogAction(action: any): boolean {
    if (!this.options.logActions) return false;

    const actionType = action.type || action;

    if (this.options.excludeActions?.includes(actionType)) {
      return false;
    }

    if (this.options.filterActions && this.options.filterActions.length > 0) {
      return this.options.filterActions.includes(actionType);
    }

    return true;
  }

  private updatePerformanceMetrics(duration: number, actionType: string): void {
    this.performanceMetrics.actionCount++;

    // Update average duration
    const totalDuration = this.performanceMetrics.averageDuration * (this.performanceMetrics.actionCount - 1) + duration;
    this.performanceMetrics.averageDuration = totalDuration / this.performanceMetrics.actionCount;

    // Track slow actions
    if (duration > this.options.slowActionThreshold!) {
      this.performanceMetrics.slowActions.push(`${actionType} (${duration}ms)`);
      // Keep only last 10 slow actions
      if (this.performanceMetrics.slowActions.length > 10) {
        this.performanceMetrics.slowActions.shift();
      }
    }

    // Update memory usage if available
    if ('memory' in performance) {
      this.performanceMetrics.memoryUsage = (performance as any).memory.usedJSHeapSize;
    }

    // Calculate state size
    const currentState = Flux.getState();
    this.performanceMetrics.stateSize = JSON.stringify(currentState).length;
  }

  postMessage(data: DevToolsMessage): void {
    if (!this.isActive) return;

    // Send via WebSocket if available
    if (this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
      try {
        this.webSocket.send(JSON.stringify(data));
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
      }
    }

    // Fallback to postMessage
    window.postMessage(data, '*');
  }

  async postDispatch(action: FluxAction, state: any, { duration, options, stack }: any): Promise<FluxAction> {
    if (!this.isActive) {
      return Promise.resolve(action);
    }

    const startTime = Date.now();
    const actionId = `action_${++this.messageId}`;

    // Sanitize data
    const sanitizedAction = this.sanitizeData(action, this.options.actionSanitizer);
    const sanitizedState = this.sanitizeData(state, this.options.stateSanitizer);

    // Create action record
    const actionRecord: ActionRecord = {
      id: actionId,
      action: sanitizedAction,
      state: sanitizedState,
      timestamp: startTime,
      duration: duration || 0,
      stack,
      prevState: this.actionHistory.length > 0 ? this.actionHistory[this.actionHistory.length - 1].state : undefined
    };

    // Add to history
    this.actionHistory.push(actionRecord);

    // Limit history size
    if (this.actionHistory.length > this.options.maxHistory!) {
      this.actionHistory.shift();
    }

    // Update performance metrics
    if (this.options.logPerformance) {
      const actionType = typeof action === 'string' ? action : action.type || 'unknown';
      this.updatePerformanceMetrics(duration || 0, actionType);
    }

    // Performance monitoring
    if (this.options.logPerformance && duration > this.options.slowActionThreshold!) {
      console.warn(`Slow action detected: ${action.type || action} took ${duration}ms`);
    }

    // Send action data
    if (this.shouldLogAction(action)) {
      this.postMessage({
        type: 'ACTION_DISPATCHED',
        payload: {
          action: sanitizedAction,
          state: sanitizedState,
          duration,
          stack,
          actionId,
          timestamp: startTime
        },
        timestamp: startTime,
        id: actionId
      });
    }

    // Send state diff if enabled
    if (this.options.enableStateDiff && actionRecord.prevState) {
      const stateDiff = this.calculateStateDiff(actionRecord.prevState, sanitizedState);
      if (Object.keys(stateDiff).length > 0) {
        this.postMessage({
          type: 'STATE_DIFF',
          payload: {
            actionId,
            diff: stateDiff,
            prevState: actionRecord.prevState,
            currentState: sanitizedState
          },
          timestamp: startTime
        });
      }
    }

    return Promise.resolve(action);
  }

  private calculateStateDiff(prevState: any, currentState: any): any {
    const diff: any = {};

    // Handle null/undefined cases
    if (prevState === null && currentState === null) return diff;
    if (prevState === undefined && currentState === undefined) return diff;

    // Handle type mismatches
    if (typeof prevState !== typeof currentState) {
      return {
        _typeChange: {
          from: { type: typeof prevState, value: prevState },
          to: { type: typeof currentState, value: currentState }
        }
      };
    }

    // Handle primitives
    if (typeof prevState !== 'object' || prevState === null) {
      if (prevState !== currentState) {
        return {
          _value: {
            from: prevState,
            to: currentState
          }
        };
      }
      return diff;
    }

    // Handle arrays
    if (Array.isArray(prevState) !== Array.isArray(currentState)) {
      return {
        _arrayTypeChange: {
          from: { isArray: Array.isArray(prevState), value: prevState },
          to: { isArray: Array.isArray(currentState), value: currentState }
        }
      };
    }

    if (Array.isArray(prevState)) {
      return this.calculateArrayDiff(prevState, currentState);
    }

    // Handle objects
    return this.calculateObjectDiff(prevState, currentState);
  }

  private calculateArrayDiff(prevArray: any[], currentArray: any[]): any {
    const diff: any = {};

    // Length change
    if (prevArray.length !== currentArray.length) {
      diff._length = {
        from: prevArray.length,
        to: currentArray.length
      };
    }

    // Find the minimum length to compare
    const minLength = Math.min(prevArray.length, currentArray.length);

    // Compare elements
    for (let i = 0; i < minLength; i++) {
      const prevValue = prevArray[i];
      const currentValue = currentArray[i];

      if (prevValue !== currentValue) {
        // For objects/arrays, do deep comparison
        if (typeof prevValue === 'object' && typeof currentValue === 'object' &&
            prevValue !== null && currentValue !== null) {
          const elementDiff = this.calculateStateDiff(prevValue, currentValue);
          if (Object.keys(elementDiff).length > 0) {
            diff[i] = elementDiff;
          }
        } else {
          diff[i] = {
            from: prevValue,
            to: currentValue
          };
        }
      }
    }

    // Handle added elements
    for (let i = minLength; i < currentArray.length; i++) {
      diff[i] = {
        from: undefined,
        to: currentArray[i]
      };
    }

    return diff;
  }

  private calculateObjectDiff(prevObj: any, currentObj: any): any {
    const diff: any = {};

    const allKeys = new Set([...Object.keys(prevObj || {}), ...Object.keys(currentObj || {})]);

    for (const key of allKeys) {
      const prevValue = prevObj?.[key];
      const currentValue = currentObj?.[key];

      if (prevValue !== currentValue) {
        // For objects/arrays, do deep comparison
        if (typeof prevValue === 'object' && typeof currentValue === 'object' &&
            prevValue !== null && currentValue !== null) {
          const nestedDiff = this.calculateStateDiff(prevValue, currentValue);
          if (Object.keys(nestedDiff).length > 0) {
            diff[key] = nestedDiff;
          }
        } else {
          diff[key] = {
            from: prevValue,
            to: currentValue
          };
        }
      }
    }

    return diff;
  }

  // Public API methods
  getActionHistory(): ActionRecord[] {
    return [...this.actionHistory];
  }

  clearHistory(): void {
    this.actionHistory = [];
    this.postMessage({
      type: 'HISTORY_CLEARED',
      payload: {},
      timestamp: Date.now()
    });
  }

  getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  exportState(): any {
    return {
      actionHistory: this.actionHistory,
      currentState: Flux.getState(),
      options: this.options,
      performanceMetrics: this.performanceMetrics
    };
  }

  // State Snapshot Methods
  createStateSnapshot(name?: string): any {
    const snapshot = {
      id: `snapshot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name || `Snapshot ${new Date().toISOString()}`,
      timestamp: Date.now(),
      state: Flux.getState(),
      actionHistory: [...this.actionHistory],
      performanceMetrics: { ...this.performanceMetrics }
    };

    this.postMessage({
      type: 'STATE_SNAPSHOT_CREATED',
      payload: { snapshot },
      timestamp: Date.now()
    });

    return snapshot;
  }

  exportStateSnapshot(snapshotId?: string): string {
    const snapshot = snapshotId
      ? this.findSnapshot(snapshotId)
      : this.createStateSnapshot();

    if (!snapshot) {
      throw new Error(`Snapshot with id ${snapshotId} not found`);
    }

    const exportData = {
      version: '1.0.0',
      arkhamjsVersion: '3.x',
      exportDate: new Date().toISOString(),
      snapshot
    };

    return JSON.stringify(exportData, null, 2);
  }

  importStateSnapshot(snapshotData: string): boolean {
    try {
      const importData = JSON.parse(snapshotData);

      if (!importData.snapshot || !importData.snapshot.state) {
        throw new Error('Invalid snapshot data');
      }

      // Restore state
      const state = importData.snapshot.state;
      Object.keys(state).forEach(storeName => {
        Flux.setState(storeName, state[storeName]);
      });

      // Restore action history if present
      if (importData.snapshot.actionHistory) {
        this.actionHistory = [...importData.snapshot.actionHistory];
      }

      this.postMessage({
        type: 'STATE_SNAPSHOT_IMPORTED',
        payload: {
          snapshot: importData.snapshot,
          importedAt: Date.now()
        },
        timestamp: Date.now()
      });

      return true;
    } catch (error) {
      console.error('Error importing state snapshot:', error);
      return false;
    }
  }

  private findSnapshot(snapshotId: string): any {
    // This would typically search through stored snapshots
    // For now, we'll create a new one if not found
    return null;
  }

  downloadStateSnapshot(snapshotId?: string): void {
    try {
      const snapshotData = this.exportStateSnapshot(snapshotId);
      const blob = new Blob([snapshotData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `arkhamjs-snapshot-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      this.postMessage({
        type: 'STATE_SNAPSHOT_DOWNLOADED',
        payload: { timestamp: Date.now() },
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error downloading state snapshot:', error);
    }
  }

  // Cleanup method
  destroy(): void {
    this.stopConnectionCheck();
    if (this.webSocket) {
      this.webSocket.close();
    }
    window.removeEventListener('message', this.handleMessage);
  }
}
