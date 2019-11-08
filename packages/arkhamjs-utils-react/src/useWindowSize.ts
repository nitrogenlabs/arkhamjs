/**
 * Copyright (c) 2019-Present, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
import {useEffect, useState} from 'react';

import {WindowSize} from './useWindowSize.types';

export const isClient = typeof window === 'object';

export const getWindowSize = () => {
  if(isClient) {
    const {innerHeight: height, innerWidth: width} = window;
    return {height, width};
  }

  return {height: undefined, width: undefined};
};

export const useWindowSize = (): WindowSize => {
  const [size, setSize] = useState(getWindowSize());

  useEffect(() => {
    if(!isClient) {
      return () => {};
    }

    const onResize = () => setSize(getWindowSize());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return size;
};
