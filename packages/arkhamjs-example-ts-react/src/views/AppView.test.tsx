import * as React from 'react';
import * as renderer from 'react-test-renderer';

import {AppView} from './AppView';

describe('AppView', () => {
  let rendered;

  beforeAll(() => {
    // Render
    rendered = renderer.create(<AppView />);
  });

  it('should render', () => expect(rendered).toBeDefined());
});
