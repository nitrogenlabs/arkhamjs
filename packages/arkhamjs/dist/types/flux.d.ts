export interface FluxOptions {
    readonly basename?: string;
    readonly context?: object;
    readonly debug?: boolean;
    readonly getUserConfirmation?: () => void;
    readonly hashType?: 'slash' | 'noslash' | 'hashbang';
    readonly history?: object;
    readonly initialEntries?: any[];
    readonly initialIndex?: number;
    readonly keyLength?: number;
    readonly location?: string | object;
    readonly middleware?: FluxMiddlewareType[];
    readonly name?: string;
    readonly routerType?: string;
    readonly scrollToTop?: boolean;
    readonly state?: any;
    readonly storage?: FluxStorageType;
    readonly storageWait?: number;
    readonly stores?: any[];
    readonly title?: string;
}
export interface FluxAction {
    readonly type: string;
    readonly [key: string]: any;
}
export interface FluxStorageType {
    readonly getStorageData: (key: string) => Promise<any>;
    readonly setStorageData: (key: string, value: any) => Promise<boolean>;
}
export declare type FluxPluginMethodType = (action: FluxAction, store: object, appData?: object) => Promise<FluxAction>;
export interface FluxMiddlewareType {
    readonly name: string;
    readonly preDispatch?: FluxPluginMethodType;
    readonly postDispatch?: FluxPluginMethodType;
}
export interface FluxPluginType {
    readonly name: string;
    readonly method: FluxPluginMethodType;
}
export interface ErrorConstructor {
    captureStackTrace(thisArg: any, func: any): void;
}
