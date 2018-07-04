import {ViewBase, ViewProps} from '@nlabs/arkhamjs-views-react';
import * as React from 'react';

export interface InfoViewProps extends ViewProps {
}

export class InfoView extends ViewBase<InfoViewProps, {}> {
  render(): JSX.Element {
    return (
      <h2>Info</h2>
    );
  }
}
