/**
 * Copyright (c) 2019-Present, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
import isPlainObject from 'lodash/isPlainObject';
import merge from 'lodash/merge';
import {useState as useReactState} from 'react';

export const useState = (initialState: any) => {
  const [state, setNewState] = useReactState(
    (prevState: any) => {
      if(isPlainObject(initialState)) {
        return merge(prevState, initialState);
      }

      return initialState;
    });

  return [
    state,
    setNewState
  ];
};
