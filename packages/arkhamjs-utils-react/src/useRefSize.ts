/**
 * Copyright (c) 2019-Present, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
import {useComponentSize} from './useComponentSize';

import type {RefObject} from 'react';

export const useRefSize = (ref: RefObject<HTMLElement>) => {
  const {current: component = null} = ref;
  return useComponentSize(component);
};
