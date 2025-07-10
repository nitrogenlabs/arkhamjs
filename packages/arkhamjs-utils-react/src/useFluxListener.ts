/**
 * Copyright (c) 2020-Present, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
import {useContext, useEffect} from 'react';

import {FluxContext} from './FluxContext';

import type {FluxFramework} from '@nlabs/arkhamjs';

export const useFluxListener = (type: string, handler: (data?: any) => any) => {
  const {flux} = useContext<{flux?: FluxFramework}>(FluxContext);

  useEffect(() => {
    flux?.on(type, handler);

    return () => {
      flux?.off(type, handler);
    };
  }, []);

  return handler;
};
