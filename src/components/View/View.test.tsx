/**
 * Copyright (c) 2017, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */

 import {createBrowserHistory, History, Location} from 'history';
import * as React from 'react';
import * as renderer from 'react-test-renderer';
import {View} from './View';

describe('View', () => {
  let rendered;

  beforeAll(() => {
    // Render
    const history: History = createBrowserHistory();
    const location: Location = {hash: '', key: '', pathname: '', search: '', state: ''};
    const match = {};
    rendered = renderer.create(<View history={history} location={location} match={match}/>);
  });

  it('should render', () => {
    expect(rendered).toBeDefined();
  });
});
