NL Flux
=======================

An ES6 Flux library that includes:
- Store
- Dispatcher

### Installation

Using [npm](https://www.npmjs.com/):

    $ npm install nl-flux

Then with a module bundler like [webpack](https://webpack.github.io/) that supports either CommonJS or ES2015 modules, use as you would anything else:

```js
// Using an ES6 transpiler
import { Dispatcher, Store } from 'nl-flux';

// not using an ES6 transpiler
var Dispatcher = require('nl-flux').Dispatcher;
var Store = require('nl-flux').Store;
```

### How to use

A complete example can be found in the [nl-react-skeleton](https://github.com/nitrog7/nl-react-skeleton). Below is an example of an action and a store.

**Store:**
```js
import { Dispatcher, Store } from 'nl-flux';

class AppStore extends Store {
  constructor() {
    super();

    this.demo = {
      hello: 'Hello World'
    };
  }

  onAction(action) {
    switch(action.type) {
      case AppConstants.APP_GET:
        this.getData(action.data);
        break;

      default:
        return true;
    }
  }

  addChangeListener(callback) {
    this.on('CHANGE_EVENT', callback);
  }

  removeChangeListener(callback) {
    this.removeListener('CHANGE_EVENT', callback);
  }

  getData(id) {
    return this.demo[id];
  }
}

let appStore = new AppStore();
Dispatcher.registerStore(appStore);
export default appStore;
```

**Action:**
```js
import { Dispatcher } from 'nl-flux';

let AppActions = {
  get: function(id) {
    Dispatcher.dispatch('APP_GET', id);
  }
};

export default AppActions;
```
