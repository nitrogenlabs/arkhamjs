/**
 * Copyright (c) 2018-Present, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
import * as React from 'react';

import {FluxContext} from './FluxContext';
import {FluxProviderProps} from './FluxProvider.types';

export const FluxProvider = ({flux, children}: FluxProviderProps) => (
  <FluxContext.Provider value={flux}>{children}</FluxContext.Provider>
);
