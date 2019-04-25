/**
 * Copyright (c) 2019-Present, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
import isPlainObject from 'lodash/isPlainObject';
import merge from 'lodash/merge';
import {useState as useReactState} from 'react';

export const useState = (initialState: any) => {
  const [state, setNewState] = useReactState(initialState);

  return [
    state,
    (newState: any) => setNewState(isPlainObject(initialState) ? merge(state, newState) : newState)
  ];
};
