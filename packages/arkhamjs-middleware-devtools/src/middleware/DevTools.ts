/**
 * Copyright (c) 2018-Present, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
import {Flux, FluxAction} from '@nlabs/arkhamjs';

export class DevTools {
  name: string = 'DevTools';
  mode: string = 'development';

  constructor(options) {
    // Methods
    this.postDispatch = this.postDispatch.bind(this);
    this.postMessage = this.postMessage.bind(this);
    this.setMode = this.setMode.bind(this);

    // Set options
    Flux.onInit(() => {
      const arkhamOptions: string = JSON.stringify(Flux.getOptions(), null, 0);
      this.postMessage({_arkhamInfo: arkhamOptions});
    });

    // Set initial mode
    const {mode = 'development'} = options;
    this.setMode(mode);
  }

  get isActive(): boolean {
    return this.mode === 'development';
  }

  setMode(mode: string = 'development'): void {
    this.mode = mode;

    if(mode === 'development') {
      window.addEventListener('message', this.sendMethod);
    } else {
      window.removeEventListener('message', this.sendMethod);
    }
  }

  sendMethod(event): void {
    const {_arkhamCall: {method = '', args = []} = {}} = event.data;
    console.log('middleware::method', method);

    if(method !== '') {
      switch(method) {
        case 'dispatch':
          Flux[method](...args);
          break;
        case 'storeClasses': {
          const stores = Flux[method];
          const storeDetails = Object.keys(stores).map((storeName: string) => {
            const store = stores[storeName];
            return {initialState: store.initialState(), name: store.name};
          });
          console.log('storeClasses', storeDetails);
          break;
        }
      }
    }
  }

  postMessage(data): void {
    window.postMessage(data, '*');
  }

  postDispatch(action, state, {duration, options, stack}): Promise<FluxAction> {
    if(this.isActive) {
      const dispatchData = {action, duration, stack, state};
      const data: string = JSON.stringify(dispatchData, null, 0);
      const optionsData: string = JSON.stringify(options, null, 0);
      this.postMessage({_arkhamDispatch: data, _arkhamInfo: optionsData});
    }

    return Promise.resolve(action);
  }
}
