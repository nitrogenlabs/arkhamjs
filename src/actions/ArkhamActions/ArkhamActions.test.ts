/**
 * Copyright (c) 2017, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */

 import {ArkhamConstants} from '../../constants/ArkhamConstants';
import {FluxAction} from '../../Flux/Flux';
import {ArkhamActions} from './ArkhamActions';

describe('ArkhamActions', () => {
  describe('#goBack', () => {
    it('should dispatch event ', async(): Promise<any> => {
      const action: FluxAction = await ArkhamActions.goBack();
      expect(action.type).toBe(ArkhamConstants.GO_BACK);
    });
  });

  describe('#goReplace', () => {
    it('should dispatch event to go back', async(): Promise<any> => {
      const path: string = '/test';
      const params = {item: 'test'};
      const action: FluxAction = await ArkhamActions.goReplace(path, params);
      expect(action.type).toBe(ArkhamConstants.GO_REPLACE);
      expect(action.path).toBe(path);
      expect(action.params.item).toBe(params.item);
    });
  });

  describe('#goto', () => {
    it('should push path into history', async(): Promise<any> => {
      const path: string = '/test';
      const params = {item: 'test'};
      const action: FluxAction = await ArkhamActions.goto(path, params);
      expect(action.type).toBe(ArkhamConstants.GOTO);
      expect(action.path).toBe(path);
      expect(action.params.item).toBe(params.item);
    });
  });
  
  describe('#updateTitle', () => {
    it('should update browser title', async(): Promise<any> => {
      const name = 'Test';
      const {title} = await ArkhamActions.updateTitle(name);
      expect(title).toBe(name);
    });
  });
});
