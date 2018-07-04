import './appView.css';

import {Flux} from '@nlabs/arkhamjs';
import {Logger, LoggerDebugLevel} from '@nlabs/arkhamjs-middleware-logger';
import {BrowserStorage} from '@nlabs/arkhamjs-storage-browser';
import * as React from 'react';
import {hot} from 'react-hot-loader';

import {AppActions} from '../../actions/AppActions/AppActions';
import {Icon} from '../../components/Icon/Icon';
import {Config} from '../../config';
import {AppConstants} from '../../constants/AppConstants';
import {StringService} from '../../services/StringService/StringService';
import {AppStore} from '../../stores/AppStore/AppStore';
import type {AppViewState} from '../../types/views';

export class AppViewBase extends React.Component<{}, AppViewState> {
  input: HTMLInputElement;

  constructor(props) {
    super(props);

    // Methods
    this.onChange = this.onChange.bind(this);
    this.onUpdateContent = this.onUpdateContent.bind(this);

    // ArkhamJS Middleware
    const env: string = Config.get('environment');
    const logger: Logger = new Logger({
      debugLevel: env === 'development' ? LoggerDebugLevel.DISPATCH : LoggerDebugLevel.DISABLED
    });

    // ArkhamJS Configuration
    Flux.init({
      middleware: [logger],
      name: 'arkhamExampleReact',
      storage: new BrowserStorage({type: 'session'}),
      stores: [AppStore]
    });

    // Initial state
    this.state = {
      content: Flux.getState('app.content', '')
    };
  }

  componentWillMount(): void {
    // Add listeners
    // When app initializes and gets any data from persistent storage
    Flux.onInit(this.onUpdateContent);

    // Listen for content updates
    Flux.on(AppConstants.UPDATE_CONTENT, this.onUpdateContent);
  }

  componentWillUnmount(): void {
    // Add listeners
    Flux.offInit(this.onUpdateContent);
    Flux.off(AppConstants.UPDATE_CONTENT, this.onUpdateContent);
  }

  onChange(): void {
    const {value} = this.input;
    AppActions.updateContent(value);
  }

  onUpdateContent(): void {
    const content = Flux.getState('app.content', '');
    this.setState({content});
  }

  render(): JSX.Element {
    return (
      <div className="container view-home">
        <div className="row">
          <div className="col-sm-12">
            <div className="logo">
              <a href="https://arkhamjs.io">
                <img className="logoImg" src="/img/arkhamjs-logo.png" />
              </a>
            </div>
            <div className="helloTxt">{StringService.uppercaseWords(this.state.content)}</div>
            <div className="form">
              <input ref={(ref: HTMLInputElement) => this.input = ref} type="text" name="test" />
              <button className="btn btn-primary" onClick={this.onChange}>
                <Icon name="pencil" className="btnIcon" />
                UPDATE
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export const AppView = hot(module)(AppViewBase);
