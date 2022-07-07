import {AppConstants} from '../../constants/AppConstants';
import {app, initialState} from './appStore';

describe('app', () => {
  describe('action', () => {
    it('should listen for default', () => {
      const content = 'test';
      const data = {content};
      const state = app('default', data, initialState);
      return expect(state).toBe(initialState);
    });

    it('should listen for AppConstants.UPDATE_CONTENT', () => {
      const content = 'test';
      const data = {content};
      const state = app(AppConstants.UPDATE_CONTENT, data, initialState);
      return expect(state.content).toBe(content);
    });
  });
});
