import * as React from 'react';
import {FluxProviderProps} from 'types/fluxProvider';

export const FluxContext = React.createContext(null);

export const FluxProvider = ({Flux, children}: FluxProviderProps) => (
  <FluxContext.Provider value={Flux}>{children}</FluxContext.Provider>
);
