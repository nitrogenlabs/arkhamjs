import {ViewBase, ViewProps} from '@nlabs/arkhamjs-views-react';
import * as React from 'react';

export interface ActionsViewProps extends ViewProps {
}

export class ActionsView extends ViewBase<ActionsViewProps, {}> {
  render(): JSX.Element {
    return (
      <h2>Actions</h2>
    );
  }
}
