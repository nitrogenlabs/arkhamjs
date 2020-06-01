/**
 * Copyright (c) 2018-Present, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
import {FluxAction} from '@nlabs/arkhamjs';
import {Store} from 'redux';

export class ReduxMiddleware {
  name: string;
  reduxStore: Store<any>;

  constructor(reduxStore: Store<any>, name: string) {
    this.name = name ? `reduxMiddleware-${name}` : 'reduxMiddleware';
    this.reduxStore = reduxStore;

    // Methods
    this.postDispatch = this.postDispatch.bind(this);
  }

  postDispatch(action): Promise<FluxAction> {
    // ... Alter action if needed
    const {__ARKHAMJS_DISPATCH: isArkhamJs} = action;

    if(!isArkhamJs) {
      action.__ARKHAMJS_DISPATCH = true;
      this.reduxStore.dispatch(action);
    }

    return Promise.resolve(action);
  }
}
