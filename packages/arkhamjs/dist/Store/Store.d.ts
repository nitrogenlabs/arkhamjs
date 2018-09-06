export declare class Store {
    defaultState: object;
    state: object;
    name: string;
    constructor(name?: string);
    initialState(): object;
    onAction(type: string, data: any, state: any): object;
}
