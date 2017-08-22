/**
 * Copyright (c) 2017, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
import * as PropTypes from 'prop-types';
import * as React from 'react';
import * as ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import {Route, RouteProps} from 'react-router-dom';

export interface ViewContainerProps {
  readonly children?: React.ReactNode;
  readonly className?: string;
  readonly duration?: number;
  readonly name?: string;
  readonly routes?: RouteProps[];
}

/**
 * ViewContainer
 * @type {Component}
 */
export class ViewContainer extends React.Component<ViewContainerProps, {}> {
  static propTypes: object = {
    children: PropTypes.element,
    className: PropTypes.string,
    duration: PropTypes.number,
    name: PropTypes.string,
    routes: PropTypes.array
  };
  
  static defaultProps: object = {
    duration: 300,
    name: 'view-animation',
    routes: []
  };
  
  renderRoutes(): JSX.Element[] {
    const {routes} = this.props;
    
    return routes
      .map((route: RouteProps) => {
        const {path, exact, component} = route;
        
        if(route.component) {
          return (
            <Route
              key={path}
              path={path}
              exact={exact}
              component={component}/>
          );
        }
        
        return null;
      })
      .filter((o: React.ReactNode) => !!o);
  }
  
  render(): JSX.Element {
    const {duration, className, name} = this.props;
    
    return (
      <div className={className}>
        <ReactCSSTransitionGroup
          transitionName={name}
          transitionEnterTimeout={duration}
          transitionLeaveTimeout={duration}>
          {this.renderRoutes()}
        </ReactCSSTransitionGroup>
      </div>
    );
  }
}
