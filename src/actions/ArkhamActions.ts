/**
 * Copyright (c) 2017, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
import {createBrowserHistory, History} from 'history';
import {Flux, FluxAction} from '../Flux';

export class ArkhamConstants {
  static UPDATE_TITLE: string = 'ARKHAM_UPDATE_TITLE';
  static UPDATE_VIEW: string = 'ARKHAM_UPDATE_VIEW';
}

/**
 * ArkhamActions
 * @type {object}
 */
export class ArkhamActions {
  static goto(path: string): History {
    const history = createBrowserHistory();
    history.push(path);
    return history;
  }
  
  static updateTitle(title: string): FluxAction {
    return Flux.dispatch({type: ArkhamConstants.UPDATE_TITLE, title});
  }
}
