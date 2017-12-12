/**
 * Copyright (c) 2017, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */

 import * as React from 'react';
import * as renderer from 'react-test-renderer';
import {ViewContainer} from './ViewContainer';

describe('ViewContainer', () => {
  let rendered;

  beforeAll(() => {
    // Render
    rendered = renderer.create(<ViewContainer/>);
  });

  it('should render', () => {
    expect(rendered).toBeDefined();
  });
});
