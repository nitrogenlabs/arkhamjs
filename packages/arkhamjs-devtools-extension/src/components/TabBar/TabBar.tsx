import Tabs, {TabPane} from 'rc-tabs';
import ScrollableInkTabBar from 'rc-tabs/lib/ScrollableInkTabBar';
import TabContent from 'rc-tabs/lib/TabContent';
import * as React from 'react';

import {InspectorActions} from '../../actions';
import {ActionsView, InfoView, StateView} from '../../views';

export class TabBar extends React.Component {
  data;

  constructor(props) {
    super(props);

    // Set tab data
    this.data = [
      {component: <ActionsView />, key: 'actions'},
      {component: <StateView />, key: 'stateTree'},
      {component: <InfoView />, key: 'appDetails'}
    ];

    // Methods
    this.onSelect = this.onSelect.bind(this);
  }

  onSelect(key): void {
    console.log('key', key);
    InspectorActions.goto(key);
  }

  render(): JSX.Element {
    let activeKey: string = 'actions';
    const {children} = this.props;

    if(children) {
      this.data.forEach((dataItem) => {
        const typeProp: string = 'type';
        if(dataItem.component.type === children[typeProp]) {
          // for demo, better immutable
          dataItem.component = children;
          activeKey = dataItem.key;
        }
      });
    }

    const tabs: TabPane[] = this.data.map(
      (dataItem) => <TabPane key={dataItem.key} tab={dataItem.key}>{dataItem.component}</TabPane>
    );

    return (
      <Tabs
        activeKey={activeKey}
        onChange={this.onSelect}
        renderTabBar={() => <ScrollableInkTabBar />}
        renderTabContent={() => <TabContent />}>
        {tabs}
      </Tabs>
    );
  }
}
