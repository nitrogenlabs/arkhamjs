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
