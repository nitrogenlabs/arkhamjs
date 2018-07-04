import {Flux, FluxOptions} from '@nlabs/arkhamjs';
import {BrowserStorage} from '@nlabs/arkhamjs-storage-browser';
import * as React from 'react';
import {HashRouter, Route} from 'react-router-dom';

import {InspectorActions} from '../../actions';
import {TabBar} from '../../components';
import {InspectorDispatchType} from '../../types/inspector';
import {ActionsView} from '../ActionsView/ActionsView';
import {InfoView} from '../InfoView/InfoView';
import {StateView} from '../StateView/StateView';

export class InspectorView extends React.Component<{}, {}> {
  constructor(props) {
    super(props);

    // ArkhamJS Configuration
    const storage = new BrowserStorage({type: 'session'});
    Flux.init({
      storage
    });

    // Methods
    this.onData = this.onData.bind(this);
  }

  componentDidMount(): void {
    chrome.runtime.onMessage.addListener(this.onData);
  }

  componentWillUnmount(): void {
    chrome.runtime.onMessage.removeListener(this.onData);
  }

  onData(eventData): void {
    console.log('app::message::eventData', eventData);
    const {_arkhamDispatch, _arkhamInfo} = eventData;

    if(_arkhamDispatch) {
      const dispatchData: InspectorDispatchType = JSON.parse(_arkhamDispatch);
      InspectorActions.onDispatch(dispatchData);
    }

    if(_arkhamInfo) {
      const infoData: FluxOptions = JSON.parse(_arkhamInfo);
      InspectorActions.onInfo(infoData);
    }
  }

  render(): JSX.Element {
    return (
      <HashRouter>
        <Route path="/" component={TabBar}>
          <Route path="/" component={ActionsView} />
          <Route path="/stateTree" component={StateView} />
          <Route path="/info" component={InfoView} />
        </Route>
      </HashRouter>
    );
  }
}
