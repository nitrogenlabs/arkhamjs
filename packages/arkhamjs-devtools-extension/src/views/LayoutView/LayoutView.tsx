import {ViewBase, ViewContainer, ViewProps} from '@nlabs/arkhamjs-views-react';
import * as React from 'react';
import {RouteProps} from 'react-router';

import {ActionsView, InfoView, StateView} from '../../views';

export interface LayoutProps extends ViewProps {
  readonly children?: React.ReactNode;
}

export class LayoutView extends ViewBase<LayoutProps, {}> {
  routes: RouteProps[];

  constructor(props) {
    super(props);
    this.routes = [
      {component: ActionsView, path: '/'},
      {component: StateView, path: '/state'},
      {component: InfoView, path: '/info'}
    ];
  }

  render(): JSX.Element {
    return (
      <ViewContainer className="container view-layout" routes={this.routes} />
    );
  }
}
