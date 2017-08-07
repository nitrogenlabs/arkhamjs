/**
 * Copyright (c) 2017, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
import * as History from 'history';
import {ArkhamConstants} from '../constants/ArkhamConstants';
import Flux from '../Flux';

/**
 * ArkhamActions
 * @type {object}
 */
const ArkhamActions = {
  goto: (path: string) => {
    const history = History.createBrowserHistory();
    history.push(path);
    return history;
  },
  
  updateTitle: (title: string) => {
    return Flux.dispatch({type: ArkhamConstants.UPDATE_TITLE, title});
  }
};

export default ArkhamActions;
