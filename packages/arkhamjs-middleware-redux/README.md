# @nlabs/arkhamjs-middleware-redux

ArkhamJS Redux middleware integrates ArkhamJS into existing redux applications to provide access to ArkhamJS features and/or provide a simple migration path to ArkhamJS.

## Installation

```bash
yarn add @nlabs/arkhamjs-middleware-redux
```

## Usage

### `createArkhamStore`

Create a Redux store that creates a two-way binding with ArkhamJS.

```javascript
// Create Redux store
const store = createArkhamStore({
  arkhamMiddleware,
  devTools,
  flux,
  reducers,
  reduxMiddleware,
  statePath
});
```

A quick example on usage.

```javascript
import {createArkhamStore} from '@nlabs/arkhamjs-middleware-redux';
import {Flux} from '@nlabs/arkhamjs';
import * as React from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import {App} from './components/App';
import {reducers} from './reducers';

// Initialize ArkhamJS
Flux.init({name: 'reduxTodos'});

// Create Redux store
const store = createArkhamStore({
  flux: Flux,
  reducers,
  statePath: 'todos'
});

// Render root component with store
render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
```

#### Options

- **flux** - *(Flux)* The Flux object you initialized in your app.
- **reducers** - *(Reducer)* Redux root reducer. The reducer created by `combineReducers()`.
- **statePath** - *(string[] | string)* State tree path where to set this branch of the store's state tree.
- **arkhamMiddleware** - *(any[])* (optional) ArkhamJS options. Use only if intending to initialize a new instance.
- **devTools** - *(boolean)* (optional) Enable/disable Redux dev tools. Default: false.
- **reduxMiddleware** - *(Middleware[])* (optional) Redux middleware. Any additional Redux middleware used in the app.

### `ReduxMiddleware`

ArkhamJS middleware to relay dispatched actions to Redux.

```javascript
// Create ArkhamJS middleware
const reduxMiddleware = new ReduxMiddleware(store, name);
```

A simple usage example:

```javascript
import {ReduxMiddleware} from '@nlabs/arkhamjs-middleware-redux';
import {createStore} from 'redux';
import {reducers} from './reducers';

const store = createStore(reducers);
const middleware = [new ReduxMiddleware(store, 'myApp')];

Flux.init({middleware});
```

- **store** - *(Store)* Redux root store. The store created by `createStore()`.
- **name** - *(string)* (optional) Middleware name. Should be unique if integrating with multiple Redux stores.

### `arkhamMiddleware`

Redux middleware to relay Redux action dispatches to ArkhamJS.

```javascript
// Create Redux middleware
const middleware = arkhamMiddleware(statePath);
```

A simple usage example:

```javascript
import {arkhamMiddleware} from '@nlabs/arkhamjs-middleware-redux';
import {applyMiddleware, createStore} from 'redux';
import {reducers} from './reducers';

const store = createStore(reducers, applyMiddleware(arkhamMiddleware('myApp')));
```

- **statePath** - *(string[] | string)* State tree path where to set this branch of the store's state tree.

## Additional Documentation

Additional details may be found in the [ArkhamJS Documentation](https://docs.arkhamjs.io).

## Redux Todo example

The following is a full example using the [Todo example](https://github.com/reactjs/redux/tree/master/examples/todos) within the Redux repository. The middleware will be added using the `Flux.addMiddleware()` automatically via the `createArkhamStore()` function.

```javascript
import {Logger, LoggerDebugLevel} from '@nlabs/arkhamjs-middleware-logger';
import {createArkhamStore} from '@nlabs/arkhamjs-middleware-redux';
import {BrowserStorage} from '@nlabs/arkhamjs-storage-browser';
import {Flux} from '@nlabs/arkhamjs';
import * as React from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import App from './components/App';
import rootReducer from './reducers';

// Add a console logger for Arkham (optional).
const logger = new Logger({
  debugLevel: LoggerDebugLevel.DISPATCH
});

// Initialize ArkhamJS.
const Flux.init({
  name: 'reduxDemo', // Optional name of application, defaults to 'arkhamjs'
  storage: new BrowserStorage(), // Optional persistent storage cache
  middleware: [logger] // Optional console logger
});

// Create an ArkhamJS store for Redux
const store = createArkhamStore({
  flux: Flux,
  reducers: rootReducer,
  statePath: 'demo'
});

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
```