/**
 * Copyright (c) 2020-Present, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
import {isEqual} from '@nlabs/utils/checks/isEqual';
import {useContext, useRef} from 'react';

import {FluxContext} from './FluxContext.js';

export const useFluxState = (key: string | string[], defaultValue?: any): any => {
  const {flux} = useContext(FluxContext);
  const value = flux?.getState(key, defaultValue);
  const ref = useRef(value);
  if(!isEqual(value, ref.current)) {
    ref.current = value;
  }
  return ref.current;
};
