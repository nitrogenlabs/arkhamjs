import * as React from 'react';

export const FluxContext = React.createContext(null);

export const FluxProvider = ({Flux, children}: any) => (
  <FluxContext.Provider value={Flux}>{children}</FluxContext.Provider>
);
