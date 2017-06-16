/**
 * Copyright (c) 2017, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
import Flux from '../Flux';
import createHistory from 'history/createBrowserHistory';
import ArkhamConstants from '../constants/ArkhamConstants';

/**
 * ArkhamActions
 * @type {object}
 */
const ArkhamActions = {
  goto: route => {
    const history = createHistory();
    history.push(route);
    return history;
  },
  
  updateTitle: title => {
    return Flux.dispatch({type: ArkhamConstants.UPDATE_TITLE, title});
  }
};

export default ArkhamActions;
