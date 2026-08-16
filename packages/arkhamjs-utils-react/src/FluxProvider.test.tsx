/**
 * Copyright (c) 2018-Present, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */

import {beforeAll, describe, expect, it} from 'vitest';
import {Flux} from '@nlabs/arkhamjs';

import {FluxProvider} from './FluxProvider.js';

describe('FluxProvider', () => {
  let children: any[];
  let provider;

  beforeAll(() => {
    Flux.init();
    children = [];
    const props = {flux: Flux, children};
    provider = <FluxProvider {...props} />;
  });

  it('should create a provider with Flux', () => {
    expect(provider.props.flux).toEqual(Flux);
  });

  it('should create a provider with children', () => {
    expect(provider.props.children).toEqual(children);
  });
});
