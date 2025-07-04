/**
 * Copyright (c) 2020-Present, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
import {useCallback, useLayoutEffect, useState} from 'react';

const getComponentSize = (element: HTMLElement | null) => {
  if(!element) {
    return {height: undefined, width: undefined};
  }

  const {offsetHeight: height, offsetWidth: width} = element;
  return {height, width};
};

export const useComponentSize = (component: HTMLElement | null) => {
  const [componentSize, setComponentSize] = useState(() => getComponentSize(component));

  const onResize = useCallback(() => {
    if(component) {
      setComponentSize(getComponentSize(component));
    }
  }, [component]);

  useLayoutEffect(() => {
    if(!component) {
      return undefined;
    }

    onResize();

    // Use ResizeObserver if available (more efficient than window resize)
    if(typeof ResizeObserver === 'function') {
      const resizeObserver = new ResizeObserver(onResize);
      resizeObserver.observe(component);

      return () => {
        resizeObserver.disconnect();
      };
    }

    // Fallback to window resize
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [component, onResize]);

  return componentSize;
};
