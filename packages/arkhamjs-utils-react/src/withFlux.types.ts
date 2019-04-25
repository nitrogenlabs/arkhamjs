/**
 * Copyright (c) 2019-Present, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
import {FluxFramework} from '@nlabs/arkhamjs';

export interface FluxComponentProps {
  readonly Flux: FluxFramework;
}

export interface FluxComponentState {
  readonly error: Error;
  readonly hasError: boolean;
  readonly propsFromMapState: object;
}
