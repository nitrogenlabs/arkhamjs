import {useComponentSize} from './useComponentSize';

export const useRefSize = (ref) => {
  const {current: component = {}} = ref;
  return useComponentSize(component);
};
