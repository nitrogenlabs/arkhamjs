/**
 * Copyright (c) 2018 to Present, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
import {FluxFramework} from '@nlabs/arkhamjs';
import map from 'lodash/map';
import React, {ComponentType} from 'react';

import {FluxComponentProps, FluxComponentState} from './types/withFlux';

export const withFlux = (actionTypes: string[], mapStateToProps: any) => (Component: ComponentType<any>) =>
  class FluxComponent extends React.Component<FluxComponentProps, FluxComponentState> {
    Flux: FluxFramework;

    constructor(props: FluxComponentProps) {
      super(props);

      // Methods
      this.runCallback = this.runCallback.bind(this);

      // Initial props
      this.Flux = props.Flux;

      // Initial state
      this.state = {
        propsFromMapState: {}
      };
    }

    componentWillMount() {
      if(!actionTypes) {
        throw new Error('Action must be an array of action types');
      }

      actionTypes.forEach((action) => this.Flux.on(action, this.runCallback));
      this.runCallback();
    }

    componentWillUnmount() {
      if(!actionTypes) {
        throw new Error('Action must be an array of action types');
      }

      actionTypes.forEach((action) => this.Flux.off(action, this.runCallback));
    }

    runCallback(): void {
      let propsFromMapState;

      switch(typeof mapStateToProps) {
        case 'object':
          propsFromMapState = map(mapStateToProps, (stateKey: string) => this.Flux.getState(stateKey));
          break;
        case 'function':
          propsFromMapState = mapStateToProps(this.Flux.getState);
          break;
        default:
          throw new Error('withFlux second parameter must be an object of strings to fetch, or a function');
      }

      this.setState({propsFromMapState});
    }

    render() {
      return <Component {...this.props} {...this.state.propsFromMapState} dispatch={this.Flux.dispatch} />;
    }
  };
