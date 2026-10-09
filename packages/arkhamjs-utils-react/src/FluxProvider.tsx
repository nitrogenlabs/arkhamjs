/**
 * Copyright (c) 2018-Present, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
import { isEqual } from '@nlabs/utils/checks/isEqual';
import { useEffect, useRef, useState } from 'react';

import { FluxContext } from './FluxContext.js';

import type { FC } from 'react';
import type { FluxProviderProps } from './FluxProvider.types.js';

export const FluxProvider: FC<FluxProviderProps> = ({children, flux}) => {
  const [state, setState] = useState(flux.getState());
  const ref = useRef(state);

  useEffect(() => {
    const updateState = (eventState: any) => {
      const newState = eventState === undefined ? flux.getState() : eventState;
      if(!isEqual(newState, ref.current)) {
        ref.current = newState;
        setState(newState);
      }
    };
    flux.addListener('arkhamjs', updateState);
    updateState(flux.getState());

    return () => {
      flux.removeListener('arkhamjs', updateState);
    };
  }, [flux]);

  return <FluxContext.Provider value={{flux, state}}>{children}</FluxContext.Provider>;
};
