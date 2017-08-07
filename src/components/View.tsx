/**
 * Copyright (c) 2017, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
import * as PropTypes from 'prop-types';
import {Component} from 'react';
import {ArkhamActions} from '../actions/ArkhamActions';

export interface ViewProps {
  readonly history: object;
  readonly location: object;
  readonly match: object;
}

/**
 * View
 * @type {Component}
 */
export class View extends Component<ViewProps, {}> {
  static propTypes = {
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired
  };
  
  static contextTypes = {
    config: PropTypes.object
  };
  
  goto(path: string = '/'): void {
    ArkhamActions.goto(path);
  }
  
  render(): JSX.Element {
    return null;
  }
}
