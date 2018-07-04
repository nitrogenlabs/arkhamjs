import {ViewBase, ViewProps} from '@nlabs/arkhamjs-views-react';
import * as React from 'react';

export interface StateViewProps extends ViewProps {
}

export class StateView extends ViewBase<StateViewProps, {}> {
  render(): JSX.Element {
    return (
      <h2>State</h2>
    );
  }
}
