import * as React from 'react';

import {FluxProviderProps} from './FluxProvider.types';

/**
 * Copyright (c) 2018-Present, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
export const FluxContext = React.createContext(null);

export const FluxProvider = ({Flux, children}: FluxProviderProps) => (
  <FluxContext.Provider value={Flux}>{children}</FluxContext.Provider>
);
