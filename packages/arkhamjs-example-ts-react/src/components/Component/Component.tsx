import * as React from 'react';

import {ComponentProps} from '../../types/components';

export class Component<P extends ComponentProps> extends React.Component<P, {}> {
  static defaultProps: object = {
    className: ''
  };

  readonly props: any;
  readonly name: string;


  constructor(props: ComponentProps, name: string) {
    super(props as any);

    // Component Name
    if(typeof name === 'string') {
      this.name = name;
    } else {
      this.name = 'component';
    }

    // Methods
    this.addStyles = this.addStyles.bind(this);
    this.getStyles = this.getStyles.bind(this);
  }

  getStyles(): string {
    const {className = ''} = this.props;
    const styleClasses: string[] = className.split(' ');
    styleClasses.push(this.name);

    // Add additional classes
    return styleClasses
      .concat(this.addStyles())
      .filter((style: string) => style !== '')
      .join(' ')
      .trim();
  }

  addStyles(): string[] {
    return [];
  }

  render(): JSX.Element {
    return null;
  }
}
