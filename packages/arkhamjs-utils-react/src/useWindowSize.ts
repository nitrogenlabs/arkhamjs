import {useEffect, useState} from 'react';

import {WindowSize} from './useWindowSize.types';

export const isClient = typeof window === 'object';

export const getSize = () => {
  if(isClient) {
    const {innerHeight: height, innerWidth: width} = window;
    return {height, width};
  }

  return {height: undefined, width: undefined};
};

export const useWindowWidth = (): WindowSize => {
  const [size, setSize] = useState(getSize());

  useEffect(() => {
    if(!isClient) {
      return () => {};
    }

    const onResize = () => setSize(getSize());
    window.addEventListener('resize', onResize);

    return () => window.removeEventListener('resize', onResize);
  }, []);

  return size;
};
