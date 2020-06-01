/**
 * Copyright (c) 2018-Present, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
export const arkhamMiddleware = (statePath: string, Flux) => (store) => (next) => (action) => {
  const {__ARKHAMJS_DISPATCH: isArkhamJs} = action;
  delete action.__ARKHAMJS_DISPATCH;

  // Run the action through the redux reducers
  next(action);

  // Save the new, altered state within ArkhamJS
  Flux.setState(statePath, store.getState());

  // Make sure we emit the event through ArkhamJS for any listeners.
  if(!isArkhamJs) {
    action.__ARKHAMJS_DISPATCH = true;
    Flux.dispatch(action);
  }

  return null;
};
