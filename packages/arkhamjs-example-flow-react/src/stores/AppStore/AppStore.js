import {AppConstants} from '../../constants/AppConstants';

export const initialState: AppState = {
  content: 'Hello World'
};

export const app = (type: string, data: any, state: AppState = initialState): AppState => {
  switch(type) {
    case AppConstants.UPDATE_CONTENT: {
      const {content} = data;
      return {...state, content};
    }
    default:
      return state;
  }
};
