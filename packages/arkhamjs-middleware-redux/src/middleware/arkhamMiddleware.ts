/**
 * Copyright (c) 2018-Present, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
import type {FluxFramework} from '@nlabs/arkhamjs';
import type {Middleware} from 'redux';

import type {ArkhamReduxAction} from '../types/main.js';

export const arkhamMiddleware = (statePath: string, Flux: FluxFramework) =>
  ((store) => (next) => (action) => {
  const arkhamAction = action as ArkhamReduxAction;
  const {__ARKHAMJS_DISPATCH: isArkhamJs} = arkhamAction;
  delete arkhamAction.__ARKHAMJS_DISPATCH;

  // Run the action through the redux reducers
  next(arkhamAction);

  // Save the new, altered state within ArkhamJS
  Flux.setState(statePath, store.getState());

  // Make sure we emit the event through ArkhamJS for any listeners.
  if(!isArkhamJs) {
    arkhamAction.__ARKHAMJS_DISPATCH = true;
    Flux.dispatch(arkhamAction);
  }

  return null;
}) satisfies Middleware;
