/**
 * Copyright (c) 2018-Present, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
import isEqual from 'lodash/isEqual';
import React, {useEffect, useRef, useState} from 'react';

import {FluxContext} from './FluxContext';
import {FluxProviderProps} from './FluxProvider.types';

export const FluxProvider = ({children, flux}: FluxProviderProps) => {
  const [state, setState] = useState(flux.getState());
  const ref = useRef(state);

  useEffect(() => {
    const updateState = (newState) => {
      if(!isEqual(newState, ref.current)) {
        ref.current = newState;
        setState(newState);
      }
    };
    flux.addListener('arkhamjs', updateState);

    return () => flux.removeListener('arkhamjs', updateState);
  }, []);

  return (
    <FluxContext.Provider value={{flux, state}}>{children}</FluxContext.Provider>
  );
};
