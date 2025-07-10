/**
 * Copyright (c) 2020-Present, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
import {isEqual} from '@nlabs/utils/lib/checks/isEqual/isEqual.js';
import {useContext, useEffect, useRef, useState} from 'react';

import {FluxContext} from './FluxContext';

export const useFluxState = (key: string | string[], defaultValue?: any): any => {
  const {flux, state} = useContext(FluxContext);
  const ref = useRef(null);
  const value = flux?.getState(key, defaultValue);
  const [updatedValue, setValue] = useState(value);

  useEffect(() => {
    if(!isEqual(value, ref.current)) {
      ref.current = value;
      setValue(value);
    }
  }, [state]);

  return updatedValue;
};
