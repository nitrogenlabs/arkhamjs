import {AppConstants} from '../../constants/AppConstants.js';
import {updateContent} from './AppActions.js';

describe('AppActions', () => {
  const content: string = 'test';

  describe('updateContent', () => {
    let action;

    beforeAll(async () => {
      action = await updateContent(content);
    });

    it('should dispatch AppConstants.UPDATE_CONTENT', () => {
      expect(action.type).toBe(AppConstants.UPDATE_CONTENT);
    });

    it('should contain content in action', () => {
      expect(action.content).toBe(content);
    });
  });
});
