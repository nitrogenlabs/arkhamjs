import * as renderer from 'react-test-renderer';

import {Icon} from './Icon.js';

describe('Icon', () => {
  let rendered;

  beforeAll(() => {
    rendered = renderer.create(<Icon name="pencil" />);
  });

  it('should render', () => expect(rendered).toBeDefined());
});
