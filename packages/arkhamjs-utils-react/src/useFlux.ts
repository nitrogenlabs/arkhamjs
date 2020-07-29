/**
 * Copyright (c) 2019-Present, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
import {FluxContext} from 'FluxContext';
import {useContext, useEffect} from 'react';

export const useFlux = (type: string, handler: (data?: any) => any) => {
  const {flux} = useContext(FluxContext);

  useEffect(() => {
    flux.on(type, handler);

    return () => {
      flux.off(type, handler);
    };
  }, []);

  return handler;
};
