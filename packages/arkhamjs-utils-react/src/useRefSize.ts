/**
 * Copyright (c) 2019-Present, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
import {useComponentSize} from './useComponentSize';

export const useRefSize = (ref) => {
  const {current: component = {}} = ref;
  return useComponentSize(component);
};
