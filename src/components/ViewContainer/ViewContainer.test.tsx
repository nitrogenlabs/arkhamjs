import {shallow} from 'enzyme';
import * as React from 'react';
import {ViewContainer} from './ViewContainer';

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
