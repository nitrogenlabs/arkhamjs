import {create} from 'react-test-renderer';

import {Icon} from './Icon';

describe('Icon', () => {
  let rendered;

  beforeAll(() => {
    rendered = create(<Icon name="pencil"/>);
  });

  it('should render', () => expect(rendered).toBeDefined());
});
