import {shallow} from 'enzyme';
import * as React from 'react';
import {Arkham} from '../../src';

describe('Arkham', () => {
  let rendered;

  beforeAll(() => {
    // Render
    rendered = shallow(<Arkham/>);
  });

  it('should render', () => {
    return expect(rendered.exists()).toBe(true);
  });
});
