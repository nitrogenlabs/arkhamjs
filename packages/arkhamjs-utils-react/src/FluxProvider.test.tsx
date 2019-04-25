/**
 * Copyright (c) 2018-Present, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
import {Flux} from '@nlabs/arkhamjs';
import * as React from 'react';

import {FluxProvider} from './FluxProvider';

describe('FluxProvider', () => {
  let children: any[];
  let provider;

  beforeAll(() => {
    Flux.init();
    children = [];
    const props = {Flux, children};
    provider = <FluxProvider {...props} />;
  });

  it('should create a provider with Flux', () => {
    expect(provider.props.Flux).toEqual(Flux);
  });

  it('should create a provider with children', () => {
    expect(provider.props.children).toEqual(children);
  });
});
