/**
 * Copyright (c) 2018-Present, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
import {NativeStorage} from './NativeStorage';

describe('NativeStorage', () => {
  it('should set async data', async () => {
    const hasExistingData = await NativeStorage.getAsyncData('test');
    expect(hasExistingData).toBe(undefined);

    const result = await NativeStorage.setAsyncData('test', 'hello world');
    expect(result).toBe(true);

    const hasNewData = await NativeStorage.getAsyncData('test');
    expect(hasNewData).toBe('hello world');
  });

  it('should delete async data', async () => {
    const hasExistingData = await NativeStorage.getAsyncData('test');
    expect(hasExistingData).toBe(undefined);

    const result = await NativeStorage.delAsyncData('test');
    expect(result).toBe(true);

    const hasNewData = await NativeStorage.getAsyncData('test');
    expect(hasNewData).toBe(undefined);
  });
});
