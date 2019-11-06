import {useCallback, useLayoutEffect, useState} from 'react';

export const getComponentSize = (element) => {
  if(!element) {
    return {width: undefined, height: undefined};
  }

  const {offsetHeight: height, offsetWidth: width} = element;
  return {height, width};
};

export const useComponentSize = (component) => {
  const [componentSize, setComponentSize] = useState(getComponentSize(component));
  const onResize = useCallback(() => {
    if(component) {
      setComponentSize(getComponentSize(component));
    }
  }, [component]);

  useLayoutEffect(() => {
    if(!component) {
      return () => {};
    }

    onResize();

    if(typeof ResizeObserver === 'function') {
      let resizeObserver = new ResizeObserver(onResize);
      resizeObserver.observe(component);

      return () => {
        resizeObserver.disconnect();
        resizeObserver = null;
      };
    }

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [component]);

  return componentSize;
};
