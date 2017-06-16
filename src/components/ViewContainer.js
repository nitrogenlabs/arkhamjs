/**
 * Copyright (c) 2017, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Route} from 'react-router-dom';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

/**
 * ViewContainer
 * @type {Component}
 */
export default class ViewContainer extends Component {
  static propTypes = {
    children: PropTypes.element,
    className: PropTypes.string,
    duration: PropTypes.number,
    name: PropTypes.string,
    routes: PropTypes.array
  };
  
  static defaultProps = {
    duration: 300,
    name: 'view-animation',
    routes: []
  };
  
  constructor(props) {
    super(props);
  }
  
  renderRoutes() {
    return this.props.routes
      .map(route => {
        if(route.component) {
          return (
            <Route
              key={route.key}
              path={route.path}
              exact={route.exact}
              component={route.component}/>
          );
        }
      })
      .filter(o => !!o);
  }
  
  render() {
    return (
      <div className={this.props.className}>
        <ReactCSSTransitionGroup
          transitionName={this.props.name}
          transitionEnterTimeout={this.props.duration}
          transitionLeaveTimeout={this.props.duration}>
          {this.renderRoutes()}
        </ReactCSSTransitionGroup>
      </div>
    );
  }
};
