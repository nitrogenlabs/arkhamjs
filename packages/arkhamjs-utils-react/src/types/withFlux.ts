import {FluxFramework} from '@nlabs/arkhamjs';

export interface FluxComponentProps {
  readonly Flux: FluxFramework;
}

export interface FluxComponentState {
  readonly error: Error;
  readonly hasError: boolean;
  readonly propsFromMapState: object;
}
