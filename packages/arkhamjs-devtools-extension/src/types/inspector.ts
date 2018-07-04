import {FluxAction} from '@nlabs/arkhamjs';

export interface InspectorStackType {
  readonly columnNumber: number;
  readonly fileName: string;
  readonly functionName: string;
  readonly lineNumber: number;
  readonly source: string;
}

export interface InspectorDispatchType {
  readonly action: FluxAction;
  readonly duration: number;
  readonly state: any;
  readonly stack: InspectorStackType[];
}
