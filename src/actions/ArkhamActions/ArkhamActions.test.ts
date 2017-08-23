import {ArkhamConstants} from '../../constants/ArkhamConstants';
import {ArkhamActions} from './ArkhamActions';

describe('ArkhamActions', () => {
  describe('#goBack', () => {
    it('should push path into history', () => {
      const {type} = ArkhamActions.goBack();
      expect(type).toBe(ArkhamConstants.GO_BACK);
    });
  });

  describe('#goReplace', () => {
    it('should push path into history', () => {
      const path = '/test';
      const {history} = ArkhamActions.goReplace(path);
      expect(history.location.pathname).toBe(path);
    });
  });

  describe('#goto', () => {
    it('should push path into history', () => {
      const path = '/test';
      const {history} = ArkhamActions.goto(path);
      expect(history.location.pathname).toBe(path);
    });
  });
  
  describe('#updateTitle', () => {
    it('should update browser title', () => {
      const name = 'Test';
      const {title} = ArkhamActions.updateTitle(name);
      expect(title).toBe(name);
    });
  });
});
