import './icon.css';

import * as React from 'react';

import {Component} from '../Component/Component';
import type {IconProps} from '../../types/components';

export class Icon extends Component<IconProps> {
  static defaultProps: object = {
    ...Component.defaultProps,
    size: ''
  };

  constructor(props) {
    super(props, 'icon');
  }

  addStyles(): string[] {
    const styleClasses: string[] = [];
    const {size: propSize} = this.props;
    const size = propSize.toLowerCase();

    if(size !== '') {
      styleClasses.push(`icon-${size}`);
    }

    return styleClasses;
  }

  render(): JSX.Element {
    const useTag: string = `<use xlink:href="/icons/icons.svg#${this.props.name}" />`;
    return <svg className={this.getStyles()} dangerouslySetInnerHTML={{__html: useTag}} />;
  }
}
