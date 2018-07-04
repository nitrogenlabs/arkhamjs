import * as React from 'react';
import * as renderer from 'react-test-renderer';

import {Icon} from './Icon';

describe('Icon', () => {
  let rendered;

  beforeAll(() => {
    rendered = renderer.create(<Icon name="pencil" />);
  });

  it('should render', () => expect(rendered).toBeDefined());
});
