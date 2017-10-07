![ArkhamJS](https://nitrogenlabs.com/logos/gh-arkhamjs.png "ArkhamJS")

#### Flux Framework for ReactJS

ArkhamJS is a lightweight framework that can accommodate a project of any size. From small start-up ideas to large enterprise projects. ReactJS is an amazing library but unfortunately, it is not a framework. Although the creators of ReactJS recommend using React in a Flux architecture, there is no official framework. The result is a wide variety of great third-party frameworks. Our goal is to create a simple framework with flexibility. And thus came ArkhamJS.

#### Lightweight
The framework is small. The bulk of your app should lay within your code, not the framework. While larger frameworks come with lots of "magic", they become very limited when new features arise within your project. ReactJS is very powerful in itself. ArkhamJS simply complements it.

#### Typescript
Compatible with typescript. Definitions are included to support your Typescript project.

#### Single Store
All data is stored within a single store. The data can be accessed through all your views and components. Data is organized into multiple stores within the single store.

#### Immutability
To prevent object referencing, we use immutable objects. When a state changes in a ReactJS component, the state's property is not the only item that is changed, the item it references is also updated. To prevent passing around an object between different scopes, immutable objects give your data a one way update path.

#### Cache
Your single store id stored in SessionStorage by default. While this can be turned off in your options, it can be very useful when saving state.

#### Debugger
The most important factor in choosing a framework is how easy it is to build with it. And with building comes debugging. A detailed debugger is included with the framework. When turned on, it will display any actions that come through the framework. Making the previous and new state visible to the developer. Great way to make your data transparent! Supported browsers: Chrome, Firefox, and Safari.

#### Skeleton
For a complete example of the setup, feel free to start your project with [arkhamjs-skeleton](https://github.com/nitrogenlabs/arkhamjs-skeleton).
It includes a full setup of a bare bones React app using Webpack 2 and Babel 6. Also includes Karma unit testing and coverage reports.

#### Documentation
For some further reading, you can check out [our article on Medium](https://medium.com/@nitrog7/arkhamjs-react-framework-8f0ecd28cfbc#.5bjpa2sfd) for some additional details on the framework.

#### React Native
Looking into developing for mobile? There is a React Native version of ArkhamJS, [ArkhamJS Native](https://github.com/nitrogenlabs/arkhamjs-native).
The biggest difference here is in the way storage is managed.

[![npm version](https://img.shields.io/npm/v/arkhamjs.svg?style=flat-square)](https://www.npmjs.com/package/arkhamjs)
[![Travis](https://img.shields.io/travis/nitrogenlabs/arkhamjs.svg?style=flat-square)](https://travis-ci.org/nitrogenlabs/arkhamjs)
[![npm downloads](https://img.shields.io/npm/dm/arkhamjs.svg?style=flat-square)](https://www.npmjs.com/package/arkhamjs)
[![TypeScript](https://badges.frapsoft.com/typescript/version/typescript-next.svg?v=101)](https://github.com/ellerbrock/typescript-badges/)
[![Issues](http://img.shields.io/github/issues/nitrogenlabs/arkhamjs.svg?style=flat-square)](https://github.com/nitrogenlabs/arkhamjs/issues)
[![Gitter](https://img.shields.io/gitter/room/NitrgenLabs/arkhamjs.svg?style=flat-square)](https://gitter.im/NitrogenLabs/arkhamjs)
[![MIT license](http://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](http://opensource.org/licenses/MIT)

### Installation

Using [npm](https://www.npmjs.com/):
```bash
$ npm install --save arkhamjs
```
or
```bash
$ yarn add arkhamjs
```

### App Usage
Then with a module bundler like [webpack](https://webpack.github.io/) that supports either CommonJS or ES2015 modules, use as you would anything else:

```typescript
import {Flux, Store} from 'arkhamjs';
```

### How to use

A complete example can be found in the [arkhamjs-skeleton](https://github.com/nitrogenlabs/arkhamjs-skeleton). Below is an example of an action and a store.

**Store:**
```typescript
import {Flux, Store} from 'arkhamjs';
import {AppConstants} from '../actions/AppActions';

export class AppStore extends Store {
  constructor() {
    super('app');
  }
  
  initialState(): object {
    return {
      test: 'default'
    };
  }

  onAction(type: string, data, state): object {
    switch(type) {
      case AppConstants.TEST:
        state.test = data.demo;
        return state;
      case AppConstants.RESET:
        return this.initialState();
      default:
        return state;
    }
  }
}
```

**Action:**
```typescript
import {Flux, FluxAction} from 'arkhamjs';

export class AppConstants {
  static readonly RESET: string = 'APP_RESET';
  static readonly TEST: string = 'APP_TEST';
}

export class AppActions {
  static test(str: string): FluxAction {
    return Flux.dispatch({type: AppConstants.TEST, demo: str});
  }
}
```

**Component:**
```typescript jsx
import {Arkham, ArkhamConstants, Flux, FluxDebugLevel, FluxOptions, Store} from 'arkhamjs';
import * as React from 'react';
import {AppActions, AppConstants} from '../actions/AppActions';
import {AppStore} from '../stores/AppStore';

export class AppView extends React.Component {
  private fluxOptions: FluxOptions;
  private stores: Store[];
  
  constructor(props) {
    super(props);
    
    // Initial state
    this.state = {
      myTest: ''
    };
    
    // Initialize Flux with custom configuration (optional)
    this.fluxOptions = {
      // Enable caching in session storage
      cache: true,
      
      // Enable debugger
      debugLevel: FluxDebugLevel.DISPATCH,
      
      // Name of your app
      name: 'MyApp'
    };

    // Register stores
    this.stores = [AppStore];
    
    // Bind methods
    this.onAppTest = this.onAppTest.bind(this);
  }
  
  componentWillMount() {
    // Add listeners
    Flux.on(AppConstants.TEST, this.onAppTest);
    
    // Initialize
    AppActions.test('Hello World');
  }

  componentWillUnmount() {
    Flux.off(AppConstants.TEST, this.onAppTest);
  }
  
  onAppTest() {
    // Gets the object from store
    const myTest = Flux.getStore(['app', 'test'], '');
    
    // Show the output in the console
    console.log('onAppTest::myTest', myTest);
    
    // Set state to re-render component
    this.setState({myTest});
  }
  
  render() {
    return (
      <Arkham config={this.fluxOptions} stores={this.stores}>
        {this.state.myTest}
      </Arkham>
    );
  }
}
```

## Flux API

### Configuration

#### `config(options)`
Set configuration options.

#### Arguments
* [`options`] \(*object*): Configuration options.
  * debugLevel \(*number*) - Enable the debugger. You can specify to show console.logs and/or Flux dispatches. You can
  use a numeric value or one of the pre-defined constants below:
    * FluxDebugLevel.DISABLED (0) - Disable debugger.
    * FluxDebugLevel.LOGS (1) - Only allow console logs.
    * FluxDebugLevel.DISPATCH (2) - Display both, console logs and dispatcher action details.
  * debugLogFnc \(*function*) - (optional) Passes the debug data to the specified function with the debugLevel as
  the first parameter and the data as the 1-n parameters. Executed when Flux.debugLog() is run.
  * debugInfoFnc \(*function*) - (optional) Passes the debug data to the specified function with the debugLevel as
  the first parameter and the data as the 1-n parameters. Executed when Flux.debugError() is run.
  * debugErrorFnc \(*function*) - (optional) Passes the debug data to the specified function with the debugLevel as
  the first parameter and the data as the 1-n parameters. Executed when Flux.debugInfo() is run.
  * name \(*string*) - Name of your app. Should not contain spaces. Is used as the session storage property for your 
  cache. *Default: arkhamjs*
  * useCache \(*boolean*) - Enable caching to session storage. *Default: true*

### Events

#### `on(eventType, data)`
Adds an event listener. It is called any time an action is dispatched to Flux, and some part of the state tree may 
potentially have changed. You may then call getStore() to read the current state tree inside the callback.
* [`eventType`] \(*string*): Event to subscribe for store updates.
* [`listener`] \(*function*): The callback to be invoked any time an action has been dispatched.

#### `off(eventType, data)`
Removes an event listener.
* [`eventType`] \(*string*): Event to unsubscribe.
* [`listener`] \(*function*): The callback associated with the subscribed event.

#### `dispatch(action, silent)`
Dispatches an Action to all stores
* [`action`] \(*object*): An action object. The only required property is *type* which will indicate what is called in
the stores, all other properties will be sent to the store within the *data* object.
* [`silent`] \(*boolean*): Silence event emitter for this dispatch. Default: false.


### Stores

#### `getStore(name, default)`
Get the state tree. If only a particular store is needed, it can be specified.
* [`name`] \(*string*|*array*): (optional) A store name. May also use an array to get a nested property value.
* [`default`] \(*any*): (optional) The default value, if undefined. This may be a string, number, array or object.

##### Returns
The app store object.

#### `setStore(name, value)`
Used for unit testing. Set a store value. If only a particular store or property needs to be set, it can be specified.
* [`name`] \(*string*|*array*): A store name. May also use an array to get a nested property value.
* [`value`] \(*any*): The value to set. This may be a string, number, boolean, array, or object.

##### Returns
The updated store and returns the stored object.

#### `getClass(name)`
Get the store class object.
* [`name`] \(*string*): The name of the store class object to retrieve.

##### Returns
A store class object.

#### `registerStores(array)`
Registers stores with Flux. Use an array of classes to register multiple.
* [`Class`] \(*array*): The store class(s) to add to Flux.

##### Returns
An array of store class objects.

#### `deregisterStore(name)`
Deregisters stores from Flux. Use an array of names to deregister multiple stores.
* [`name`] \(*array*): Name of store(s) to remove from Flux.


### SessionStorage

#### `getSessionData(key)`
Get an object from sessionStorage.
* [`key`] \(*string*): Key of object to retrieve.

##### Returns
A value from session storage.

#### `setSessionData(key, value)`
Save an object to sessionStorage.
* [`key`] \(*string*): Key to reference object.
* [`value`] \(*any*): A value to save to SessionStorage. All objects will converted to a string before saving.

##### Returns
A boolean indicating if data was successfully saved to sessionStorage.

#### `delSessionData(key)`
Remove an object from sessionStorage.
* [`key`] \(*string*): Key of object to delete.

##### Returns
A boolean indicating if data was successfully removed from sessionStorage.

#### `clearAppData()`
Removes all app related data from sessionStorage.

##### Returns
A boolean indicating if app data was successfully removed from sessionStorage.


### LocalStorage

#### `getLocalData(key)`
Get an object from localStorage.
* [`key`] \(*string*): Key of object to retrieve.

##### Returns
A value from local storage.

#### `setLocalData(key, value)`
Save an object to localStorage.
* [`key`] \(*string*): Key to reference object.
* [`value`] \(*any*): A value to save to LocalStorage. All objects will converted to a string before saving.

##### Returns
A boolean indicating if data was successfully saved in localStorage.

#### `delLocalData(key)`
Remove an object from localStorage.
* [`key`] \(*string*): Key of the object to remove.

##### Returns
A boolean indicating if data was successfully removed from LocalStorage.


### Debug
#### `enableDebugger(toggle)`
Turn on the console debugger to display each action call and store changes. By default the framework has the debugger 
disabled.
* [`toggle`] \(*boolean*): Enable or disable debugger. Default: true.

#### `debugLog(obj1 [, obj2, ..., objN])`
Logs data in the console. Only logs when in debug mode.  Will also call the debugLogFnc method set in the config.
* [`obj`] \(*any*): A list of JavaScript objects to output. The string representations of each of these objects are 
appended together in the order listed and output.

#### `debugInfo(obj1 [, obj2, ..., objN])`
Logs informational messages to the console. Will also call the debugInfoFnc method set in the config.
* [`obj`] \(*any*): A list of JavaScript objects to output. The string representations of each of these objects are 
appended together in the order listed and output.

#### `debugError(obj1 [, obj2, ..., objN])`
Logs errors in the console. Will also call the debugErrorFnc method set in the config.
* [`obj`] \(*any*): A list of JavaScript objects to output. The string representations of each of these objects are 
appended together in the order listed and output.


## Store API

### State

#### `getInitialState()`
Used for unit testing. Gets the initial state of the store.

##### Returns
The initial state of the store as an object.
