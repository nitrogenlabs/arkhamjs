import {Store} from '@nlabs/arkhamjs';
import set from 'lodash/set';

import {AppConstants} from '../../constants/AppConstants';

export class AppStore extends Store {
  constructor() {
    super('app');
  }

  initialState(): object {
    return {
      content: 'Hello World'
    };
  }

  onAction(type: string, data, state): object {
    switch(type) {
      case AppConstants.UPDATE_CONTENT:
        return set(state, 'content', data.content);
      default:
        return state;
    }
  }
}
