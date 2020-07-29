import * as React from 'react';
import * as renderer from 'react-test-renderer';

import {HomeView} from './HomeView';

describe('HomeView', () => {
  let rendered;

  beforeAll(() => {
    // Render
    rendered = renderer.create(<HomeView initialContent="" />);
  });

  it('should render', () => expect(rendered).toBeDefined());
});
