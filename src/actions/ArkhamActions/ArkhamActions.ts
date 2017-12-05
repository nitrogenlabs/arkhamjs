/**
 * Copyright (c) 2017, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */

import {createBrowserHistory} from 'history';
import {ArkhamConstants} from '../../constants/ArkhamConstants';
import {Flux, FluxAction} from '../../Flux/Flux';

/**
 * ArkhamActions
 */
export class ArkhamActions {
  static goBack(): Promise<FluxAction> {
    const history = createBrowserHistory();
    history.goBack();
    return Flux.dispatch({type: ArkhamConstants.GO_BACK, history});
  }
  
  static goReplace(path: string, params?): Promise<FluxAction> {
    const history = createBrowserHistory();
    history.replace(path, params);
    return Flux.dispatch({type: ArkhamConstants.GO_REPLACE, history, path, params});
  }
  
  static goto(path: string, params?): Promise<FluxAction> {
    const history = createBrowserHistory();
    history.push(path, params);
    return Flux.dispatch({type: ArkhamConstants.GOTO, history, path, params});
  }
  
  static updateTitle(title: string): Promise<FluxAction> {
    return Flux.dispatch({type: ArkhamConstants.UPDATE_TITLE, history, title});
  }
}
