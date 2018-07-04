import * as React from 'react';
import * as renderer from 'react-test-renderer';

import {Component} from './Component';

describe('Component', () => {
  let componentInstance;
  let rendered;

  beforeAll(() => {
    rendered = renderer.create(<Component className="test" />);
    componentInstance = rendered.root.instance;
  });

  it('should render', () => expect(rendered).toBeDefined());

  it('#getStyles', () => {
    const styles = componentInstance.getStyles();
    return expect(styles).toBe('test component');
  });

  it('#addStyles', () => {
    const styles = componentInstance.addStyles();
    return expect(styles.length).toBe(0);
  });
});
