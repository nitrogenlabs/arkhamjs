NL Flux
=======================

An ES6 Flux library that includes:
- Flux
- Store

### Installation

Using [npm](https://www.npmjs.com/):

    $ npm install nl-flux

Then with a module bundler like [webpack](https://webpack.github.io/) that supports either CommonJS or ES2015 modules, use as you would anything else:

```js
// Using an ES6 transpiler
import { Flux, Store } from 'nl-flux';

// not using an ES6 transpiler
var Flux = require('nl-flux').Flux;
var Store = require('nl-flux').Store;
```

### How to use

A complete example can be found in the [nl-react-skeleton](https://github.com/nitrog7/nl-react-skeleton). Below is an example of an action and a store.

**Store:**
```js
import {Flux, Store} from 'nl-flux';
import {Map} from 'immutable';

class App extends Store {
  initialState() {
    return {
      test: 'default'
    };
  }

  onAction(type, data, state) {
    switch(type) {
      case 'APP_TEST':
        return state.set('test', data.demo);
      case 'APP_RESET':
        return Map(this.initialState());
      default:
        return state;
    }
  }
}

export default Flux.registerStore(App);
```

**Action:**
```js
import {Flux} from 'nl-flux';

const AppActions = {
  test: (str) => {
    Flux.dispatch({type: 'APP_TEST', demo: str});
  }
};

export default AppActions;
```

**Component:**
```js
import React, {Component} from 'react';
import {Flux} from '../flux';

// Enable console debugger
Flux.enableDebugger();

export default class AppView extends Component {
  constructor(props) {
    super(props);
    
    // Initial state
    this.state = {
      myTest: ''
    };

    // Bind methods
    this.onAppTest = this.onAppTest.bind(this);
  }
  
  componentWillMount() {
    // Add listeners
    Flux.on('APP_TEST', this.onAppTest);
    
    // Initialize
    AppActions.test('Hello World');
  }

  componentWillUnmount() {
    Flux.off('APP_TEST', this.onAppTest);
  }
  
  onAppTest() {
    // Gets the immutable store
    const store = Flux.getStore();
    const myTest = store.getIn(['app', 'test']);
    
    // Show the output in the console
    console.log('onAppTest::myTest', myTest);
    
    // Set state to re-render component
    this.setState({myTest});
  }
  
  render() {
    return <div>{this.state.myTest}</div>
  }
};

export default AppActions;
```
