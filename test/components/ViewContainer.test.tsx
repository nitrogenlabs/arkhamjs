import * as React from 'react';
import {shallow} from 'enzyme';
import {ViewContainer} from '../../src';

describe('ViewContainer', () => {
  let rendered;

  beforeAll(() => {
    // Render
    rendered = shallow(<ViewContainer/>);
  });

  it('should render', () => {
    return expect(rendered.exists()).toBe(true);
  });
});
