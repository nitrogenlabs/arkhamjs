import Tabs from 'rc-tabs';
import * as React from 'react';

import { InspectorActions } from '../../actions';
import { ActionsView, InfoView, StateView } from '../../views';

export class TabBar extends React.Component<React.PropsWithChildren<{}>> {
  data;

  constructor(props) {
    super(props);

    // Set tab data
    this.data = [
      {label: 'Actions', key: 'actions', children: <ActionsView />},
      {label: 'State', key: 'stateTree', children: <StateView />},
      {label: 'Info', key: 'appDetails', children: <InfoView />}
    ];

    // Methods
    this.onSelect = this.onSelect.bind(this);
  }

  onSelect(key): void {
    console.log('key', key);
    InspectorActions.goto(key);
  }

  render() {
    let activeKey: string = 'actions';
    const {children} = this.props;

    if(children) {
      this.data.forEach((dataItem) => {
        const typeProp: string = 'type';
        if(dataItem.children.type === children[typeProp]) {
          dataItem.children = children;
          activeKey = dataItem.key;
        }
      });
    }

    return (
      <Tabs
        activeKey={activeKey}
        onChange={this.onSelect}
        items={this.data}
      />
    );
  }
}
