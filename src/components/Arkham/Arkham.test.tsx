import * as React from 'react';
import * as renderer from 'react-test-renderer';
import {Arkham} from './Arkham';

describe('Arkham', () => {
  let rendered;

  beforeAll(() => {
    // Render
    rendered = renderer.create(<Arkham/>);
  });

  it('should render', () => {
    expect(rendered).toBeDefined();
  });
});
