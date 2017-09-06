/**
 * Copyright (c) 2017, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
import * as PropTypes from 'prop-types';
import * as React from 'react';
import {BrowserRouter, HashRouter, MemoryRouter, Router, StaticRouter} from 'react-router-dom';
import {ArkhamConstants} from '../../constants/ArkhamConstants';
import {Flux, FluxOptions} from '../../Flux/Flux';
import {Store} from '../../Store/Store';

export interface ArkhamProps {
  readonly children?: JSX.Element;
  readonly className?: string;
  readonly config?: FluxOptions;
  readonly routes?: string[];
  readonly stores?: Store[];
}

/**
 * Arkham
 * @type {Component}
 */
export class Arkham extends React.Component<ArkhamProps, {}> {
  private config: FluxOptions;
  
  static propTypes: object = {
    children: PropTypes.node,
    className: PropTypes.string,
    config: PropTypes.object,
    routes: PropTypes.array,
    stores: PropTypes.array
  };
  
  static defaultProps: object = {
    config: {},
    routes: [],
    stores: []
  };
  
  static childContextTypes: object = {
    config: PropTypes.object
  };
  
  constructor(props) {
    super(props);
    
    // Methods
    this.onUpdateTitle = this.onUpdateTitle.bind(this);
    this.onUpdateView = this.onUpdateView.bind(this);
    
    // Initialize Flux with custom configuration
    const defaultConfig: FluxOptions = {
      forceRefresh: 'pushState' in window.history,
      routerType: 'browser',
      scrollToTop: true,
      title: 'ArkhamJS'
    };
    const {config, stores} = this.props;
    this.config = {...defaultConfig, ...config};
    Flux.config(this.config);
    
    // Register stores
    Flux.registerStores(stores);
  }
  
  componentWillMount(): void {
    // Add listeners
    Flux.on(ArkhamConstants.UPDATE_TITLE, this.onUpdateTitle);
  }
  
  componentWillUnmount(): void {
    // Add listeners
    Flux.on(ArkhamConstants.UPDATE_TITLE, this.onUpdateTitle);
  }
  
  getChildContext(): object {
    return {
      config: this.config
    };
  }
  
  onUpdateView(): void {
    const {getUserConfirmation, scrollToTop} = this.config;
    
    // Scroll to top
    if(scrollToTop) {
      window.scrollTo(0, 0);
    }
    // Dispatch event to indicate view has changed
    Flux.dispatch({type: ArkhamConstants.UPDATE_VIEW});
    
    // Check custom user confirmation
    
    if(getUserConfirmation) {
      getUserConfirmation();
    }
  }
  
  onUpdateTitle(data): string {
    const {title: siteTitle = ''} = data;
    const {title} = this.config;
    
    if(siteTitle === '') {
      document.title = `${title}`;
    } else {
      document.title = `${siteTitle} :: ${title}`;
    }
    
    return document.title;
  }
  
  render(): JSX.Element {
    const {
      basename,
      context,
      forceRefresh,
      hashType,
      history,
      initialEntries,
      initialIndex,
      keyLength,
      location,
      routerType
    } = this.config;
    
    const {
      children,
      className
    } = this.props;
    
    // View container
    const container = <div className={className}>{children}</div>;
    
    // Use the specified router
    switch(routerType) {
      case 'browser':
        return (
          <BrowserRouter
            basename={basename}
            forceRefresh={forceRefresh}
            getUserConfirmation={this.onUpdateView}
            keyLength={keyLength}>
            {container}
          </BrowserRouter>
        );
      case 'hash':
        return (
          <HashRouter
            basename={basename}
            getUserConfirmation={this.onUpdateView}
            hashType={hashType}>
            {container}
          </HashRouter>
        );
      case 'memory':
        return (
          <MemoryRouter
            initialEntries={initialEntries}
            initialIndex={initialIndex}
            getUserConfirmation={this.onUpdateView}
            keyLength={keyLength}>
            {container}
          </MemoryRouter>
        );
      case 'static':
        return (
          <StaticRouter
            basename={basename}
            location={location}
            context={context}>
            {container}
          </StaticRouter>
        );
      default:
        return (
          <Router history={history}>
            {container}
          </Router>
        );
    }
  }
}
