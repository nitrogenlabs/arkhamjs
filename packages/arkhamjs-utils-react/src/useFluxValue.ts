/**
 * Copyright (c) 2021-Present, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
import {useContext} from 'react';

import {FluxContext} from './FluxContext';

export const useFluxValue = (key: string | string[], defaultValue?: any): any => {
  const {flux} = useContext(FluxContext);
  return flux.getState(key, defaultValue);
};
