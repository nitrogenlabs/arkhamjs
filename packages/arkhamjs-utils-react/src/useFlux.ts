/**
 * Copyright (c) 2022-Present, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
import {useContext} from 'react';

import {FluxContext} from './FluxContext';

export const useFlux = (): any => {
  const {flux} = useContext(FluxContext);
  return flux;
};
