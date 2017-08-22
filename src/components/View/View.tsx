/**
 * Copyright (c) 2017, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
import * as PropTypes from 'prop-types';
import * as React from 'react';

export interface MatchProps {
  readonly params?: object;
  readonly isExact?: boolean;
  readonly path?: string;
  readonly url?: string;
}

export interface ViewProps {
  readonly history?: History;
  readonly location?: Location;
  readonly match?: MatchProps;
}

/**
 * View
 * @type {Component}
 */
export class View<P extends ViewProps, S> extends React.Component<P, S> {
  static propTypes: object = {
    history: PropTypes.object,
    location: PropTypes.object,
    match: PropTypes.object
  };
  
  static defaultProps: object = {
    history: {},
    location: {},
    match: {}
  };
  
  static contextTypes: object = {
    config: PropTypes.object
  };
  
  render(): JSX.Element {
    return null;
  }
}
