import {AppConstants} from '../../constants/AppConstants';
import {AppActions} from './AppActions';

describe('AppActions', () => {
  const content: string = 'test';

  describe('#updateContent', () => {
    let action;

    beforeAll(async () => {
      // Method
      action = await AppActions.updateContent(content);
    });

    it('should dispatch AppConstants.UPDATE_CONTENT', () => {
      expect(action.type).toBe(AppConstants.UPDATE_CONTENT);
    });

    it('should contain content in action', () => {
      expect(action.content).toBe(content);
    });
  });
});
