import {AppConstants} from '../../constants/AppConstants';
import {AppStore} from './AppStore';

describe('AppStore', () => {
  const store = new AppStore();

  describe('#onAction', () => {
    it('should listen for AppConstants.UPDATE_CONTENT', () => {
      const state = store.initialState();
      const content: string = 'test';
      const updatedState: any = store.onAction(AppConstants.UPDATE_CONTENT, {content}, state);
      return expect(updatedState.content).toBe(content);
    });
  });
});
