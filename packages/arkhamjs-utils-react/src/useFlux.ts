/**
 * Copyright (c) 2019-Present, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
import {Flux} from '@nlabs/arkhamjs';
import {useEffect} from 'react';
import {FluxActionListener} from 'useFlux.types';

export const useFlux = (listeners: FluxActionListener[]): void => {
  useEffect(() => {
    listeners.forEach(({handler, type}: FluxActionListener) => {
      Flux.on(type, handler);
    });

    return () => {
      listeners.forEach(({handler, type}: FluxActionListener) => {
        Flux.off(type, handler);
      });
    };
  }, []);
};
