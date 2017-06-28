/**
 * Copyright (c) 2017, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {BrowserRouter, HashRouter, MemoryRouter, Router, StaticRouter} from 'react-router-dom';
import Flux from '../Flux';
import ArkhamConstants from '../constants/ArkhamConstants';

/**
 * Arkham
 * @type {Component}
 */
export default class Arkham extends Component {
  static propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    config: PropTypes.object,
    routes: PropTypes.array,
    stores: PropTypes.array
  };
  
  static defaultProps = {
    config: {},
    routes: [],
    stores: []
  };
  
  static childContextTypes = {
    config: PropTypes.object
  };
  
  constructor(props) {
    super(props);
    
    // Methods
    this.onUpdateTitle = this.onUpdateTitle.bind(this);
    this.onUpdateView = this.onUpdateView.bind(this);
    
    // Initialize Flux with custom configuration
    this._config = props.config;
    Flux.config(this._config);
    
    // Register stores
    Flux.registerStore(props.stores);
    
    // Routing
    const {
      forceRefresh = 'pushState' in window.history,
      routerType = 'browser',
      scrollToTop = true,
      title = 'ArkhamJS'
    } = this._config;
    
    this._appTitle = title;
    this._forceRefresh = forceRefresh;
    this._routerType = routerType;
    this._scrollToTop = scrollToTop;
  }
  
  componentWillMount() {
    // Add listeners
    Flux.on(ArkhamConstants.UPDATE_TITLE, this.onUpdateTitle);
  }
  
  componentWillUnmount() {
    // Add listeners
    Flux.on(ArkhamConstants.UPDATE_TITLE, this.onUpdateTitle);
  }
  
  getChildContext() {
    return {
      config: this._config
    };
  }
  
  onUpdateView(message, callback) {
    // Scroll to top
    if(this._scrollToTop) {
      window.scrollTo(0, 0);
    }
    // Dispatch event to indicate view has changed
    Flux.dispatch(ArkhamConstants.UPDATE_VIEW);

    // Check custom user confirmation
    if(this.props.config.getUserConfirmation) {
      return this.props.config.getUserConfirmation(message, callback);
    } else {
      return callback(true);
    }
  }
  
  onUpdateTitle(data) {
    const title = data.get('title', '');
    
    if(title === '') {
      document.title = `${this._appTitle}`;
    } else {
      document.title = `${title} :: ${this._appTitle}`;
    }
    
    return document.title;
  }
  
  render() {
    // View container
    const container = <div className={this.props.className}>{this.props.children}</div>;
    
    // Use the specified router
    switch(this._routerType) {
      case 'browser':
        return (
          <BrowserRouter
            baseName={this.props.config.baseName}
            forceRefresh={this._forceRefresh}
            getUserConfirmation={this.onUpdateView}
            keyLength={this.props.config.keyLength}>
            {container}
          </BrowserRouter>
        );
        break;
      case 'hash':
        return (
          <HashRouter
            baseName={this.props.config.baseName}
            getUserConfirmation={this.onUpdateView}
            hashType={this.props.config.hashType}>
            {container}
          </HashRouter>
        );
        break;
      case 'memory':
        return (
          <MemoryRouter
            initialEntries={this.props.config.initialEntries}
            initialIndex={this.props.config.initialIndex}
            getUserConfirmation={this.onUpdateView}
            keyLength={this.props.config.keyLength}>
            {container}
          </MemoryRouter>
        );
        break;
      case 'static':
        return (
          <StaticRouter
            baseName={this.props.config.baseName}
            location={this.props.config.location}
            context={this.props.config.context}>
            {container}
          </StaticRouter>
        );
        break;
      default:
        return (
          <Router history={this.props.config.history}>
            {container}
          </Router>
        );
        break;
    }
  }
};
