/**
 * Copyright (c) 2019-Present, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
import {useCallback, useEffect, useState} from 'react';

import {WindowSize} from './useWindowSize.types';

const isClient = typeof window === 'object';

const getWindowSize = (): WindowSize => {
  if(isClient) {
    const {innerHeight: height, innerWidth: width} = window;
    return {height, width};
  }

  return {height: undefined, width: undefined};
};

export const useWindowSize = (): WindowSize => {
  const [size, setSize] = useState(getWindowSize);

  const onResize = useCallback(() => {
    setSize(getWindowSize());
  }, []);

  useEffect(() => {
    if(!isClient) {
      return undefined;
    }

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [onResize]);

  return size;
};
