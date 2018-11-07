/**
 * Copyright (c) 2018-Present, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
import {FluxFramework} from '@nlabs/arkhamjs';
import isArray from 'lodash/isArray';
import isFunction from 'lodash/isFunction';
import isPlainObject from 'lodash/isPlainObject';
import mapValues from 'lodash/mapValues';
import React, {ComponentType} from 'react';

import {FluxContext} from './FluxProvider';
import {FluxComponentProps, FluxComponentState} from './types/withFlux';

export const withFlux = (actionTypes: string[], mapStateToProps: any) => (Component: ComponentType<any>) => {
  class FluxComponent extends React.Component<FluxComponentProps, FluxComponentState> {
    Flux: FluxFramework;

    constructor(props: FluxComponentProps) {
      super(props);

      // Methods
      this.onCallback = this.onCallback.bind(this);

      // Initial props
      this.Flux = props.Flux;

      // Initial state
      this.state = {
        error: new Error(),
        hasError: false,
        propsFromMapState: {}
      };
    }

    static getDerivedStateFromError(error) {
      return {error, hasError: true};
    }

    componentDidCatch(error) {
      console.error(`An error occurred in the FluxProvider. Error: ${error.message}`);
    }

    componentWillMount() {
      if(!isArray(actionTypes)) {
        throw new Error('Action must be an array of action types');
      }

      actionTypes.forEach((action) => this.Flux.on(action, this.onCallback));
      this.onCallback();
    }

    componentWillUnmount() {
      actionTypes.forEach((action) => this.Flux.off(action, this.onCallback));
    }

    onCallback(): void {
      let propsFromMapState;

      if(isPlainObject(mapStateToProps)) {
        propsFromMapState = mapValues(mapStateToProps, (stateKey: string) => this.Flux.getState(stateKey));
      } else if(isFunction(mapStateToProps)) {
        propsFromMapState = mapStateToProps(this.Flux.getState);
      } else {
        throw new Error('withFlux second parameter must be an object of strings to fetch, or a function');
      }

      this.setState({propsFromMapState});
    }

    render() {
      const {hasError, propsFromMapState} = this.state;

      if(hasError) {
        return <div>FluxProvider Error</div>;
      }

      return <Component {...this.props} {...propsFromMapState} dispatch={this.Flux.dispatch} />;
    }
  }

  return (props: any) => (
    <FluxContext.Consumer>{(Flux) => <FluxComponent {...props} Flux={Flux} />}</FluxContext.Consumer>
  );
};
