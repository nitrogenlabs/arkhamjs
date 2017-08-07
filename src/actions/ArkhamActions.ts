/**
 * Copyright (c) 2017, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
import {createBrowserHistory, History} from 'history';
import {Flux, FluxAction} from '../Flux';

export interface ArkhamActionsProps {
  readonly UPDATE_TITLE: string;
  readonly UPDATE_VIEW: string;
  goto: (path: string) => History;
  updateTitle: (title: string) => FluxAction;
}

/**
 * ArkhamActions
 * @type {object}
 */
export const ArkhamActions: ArkhamActionsProps = {
  UPDATE_TITLE: 'ARKHAM_UPDATE_TITLE',
  UPDATE_VIEW: 'ARKHAM_UPDATE_VIEW',
  
  goto: (path: string): History => {
    const history = createBrowserHistory();
    history.push(path);
    return history;
  },
  
  updateTitle: (title: string): FluxAction => {
    return Flux.dispatch({type: ArkhamActions.UPDATE_TITLE, title});
  }
};
