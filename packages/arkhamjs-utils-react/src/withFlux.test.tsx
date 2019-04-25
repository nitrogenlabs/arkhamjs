/**
 * Copyright (c) 2018-Present, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
import {Flux, Store} from '@nlabs/arkhamjs';
import React from 'react';
import TestRenderer from 'react-test-renderer';

import {FluxProvider} from './FluxProvider';
import {withFlux} from './withFlux';

describe('withFlux', () => {
  const TestComponent = ({hello = 'world'}) => <div>{hello}</div>;

  class TestStore extends Store {
    constructor() {
      super('test');
    }

    initialState() {
      return {hello: 'demo'};
    }

    onAction(actionType: string, data, state) {
      switch(actionType) {
        case 'test_action':
          return {hello: data.hello};
        default:
          return state;
      }
    }
  }

  beforeAll(async () => {
    await Flux.init({
      stores: [TestStore]
    });
  });

  it('should create a provider with Flux using an object', async () => {
    const HelloComponent = withFlux(['test_action'], {hello: 'test.hello'})(TestComponent);
    const rendered = TestRenderer.create(<FluxProvider Flux={Flux}><HelloComponent /></FluxProvider>);
    const expectedResult = TestRenderer.create(<div>test</div>);

    await Flux.dispatch({hello: 'test', type: 'test_action'});
    rendered.update(<FluxProvider Flux={Flux}><HelloComponent /></FluxProvider>);
    expect(rendered.toJSON()).toEqual(expectedResult.toJSON());
  });

  it('should create a provider with Flux using a function', async () => {
    const HelloComponent = withFlux(['test_action'], (getState) => ({hello: getState('test.hello')}))(TestComponent);
    const rendered = TestRenderer.create(<FluxProvider Flux={Flux}><HelloComponent /></FluxProvider>);
    const expectedResult = TestRenderer.create(<div>test</div>);

    await Flux.dispatch({hello: 'test', type: 'test_action'});
    rendered.update(<FluxProvider Flux={Flux}><HelloComponent /></FluxProvider>);
    expect(rendered.toJSON()).toEqual(expectedResult.toJSON());
  });

  it('should unmount a provider', async () => {
    const HelloComponent = withFlux(['test_action'], {hello: 'test.hello'})(TestComponent);
    const rendered = TestRenderer.create(<FluxProvider Flux={Flux}><HelloComponent /></FluxProvider>);
    rendered.unmount();
    expect(rendered.toJSON()).toBeNull();
  });

  it('should throw error if action types is not an array', () => {
    const HelloComponent = withFlux(null, {hello: 'test.hello'})(TestComponent);
    const renderError = () => TestRenderer.create(<FluxProvider Flux={Flux}><HelloComponent /></FluxProvider>);
    expect(renderError).toThrow(Error);
  });

  it('should throw error if map props is not an object or function', () => {
    const HelloComponent = withFlux(['test_action'], null)(TestComponent);
    const renderError = () => TestRenderer.create(<FluxProvider Flux={Flux}><HelloComponent /></FluxProvider>);
    expect(renderError).toThrow(Error);
  });
});
