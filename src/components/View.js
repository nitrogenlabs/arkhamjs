/**
 * Copyright (c) 2017, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
import {Component} from 'react';
import PropTypes from 'prop-types';
import ArkhamActions from '../actions/ArkhamActions';

/**
 * View
 * @type {Component}
 */
export default class View extends Component {
  static propTypes = {
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired
  };
  
  static contextTypes = {
    config: PropTypes.object
  };
  
  goto(path = '/') {
    ArkhamActions.goto(path);
  }
  
  render() {
    return null;
  }
}
