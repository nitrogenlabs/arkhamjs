import {Flux} from '../../Flux/Flux';
import {ArkhamActions} from './ArkhamActions';

describe('ArkhamActions', () => {
  describe('#goto', () => {
    it('should push path into history', () => {
      const path = '/test';
      const route = ArkhamActions.goto(path);
      expect(route.location.pathname).toBe(path);
    });
  });
  
  describe('#updateTitle', () => {
    it('should update browser title', () => {
      Flux._useImmutable = false;
      const name = 'Test';
      const action = ArkhamActions.updateTitle(name);
      expect(action.title).toBe(name);
    });
  });
});
