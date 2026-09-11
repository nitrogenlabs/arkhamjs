/* @vitest-environment jsdom */
import {describe, expect, it, vi} from 'vitest';

import {FluxFramework} from './Flux.js';

const sessionStore = {
  action: (type: string, data: {token?: string}, state = {token: ''}) => (
    type === 'SESSION_UPDATE' ? {...state, token: data.token || ''} : state
  ),
  initialState: {token: ''},
  name: 'session'
};

describe('Flux cache consistency', () => {
  it('invalidates parent, child and root reads after writes, dispatch and clear', async () => {
    const flux = new FluxFramework();
    await flux.init({stores: [sessionStore]});
    expect(flux.getState('session.token')).toBe('');
    expect(flux.getState('session')).toEqual({token: ''});
    flux.getState();
    await flux.setState('session', {token: 'first'});
    expect(flux.getState('session.token')).toBe('first');
    await flux.setState('session.token', 'second');
    expect(flux.getState('session')).toEqual({token: 'second'});
    await flux.dispatch({token: 'third', type: 'SESSION_UPDATE'});
    expect(flux.getState()).toEqual({session: {token: 'third'}});
    await flux.clearAppData();
    expect(flux.getState('session.token')).toBe('');
  });

  it('returns isolated snapshots and does not cache caller defaults', async () => {
    const flux = new FluxFramework();
    await flux.init({stores: [sessionStore]});
    const first = flux.getState<{token: string}>('session');
    first.token = 'mutated';
    expect(flux.getState('session')).toEqual({token: ''});
    expect(flux.getState('missing', 'first')).toBe('first');
    expect(flux.getState('missing', 'second')).toBe('second');
    expect(flux.getState('missing')).toBeUndefined();
  });

  it('emits independent root snapshots for consecutive updates', async () => {
    const flux = new FluxFramework();
    await flux.init({stores: [sessionStore]});
    const snapshots: Array<{session: {token: string}}> = [];
    flux.on('arkhamjs', (state) => snapshots.push(state));
    await flux.dispatch({token: 'first', type: 'SESSION_UPDATE'});
    await flux.dispatch({token: 'second', type: 'SESSION_UPDATE'});
    expect(snapshots[0]).not.toBe(snapshots[1]);
    expect(snapshots.map((state) => state.session.token)).toEqual(['first', 'second']);
    snapshots[1].session.token = 'mutated';
    expect(flux.getState('session.token')).toBe('second');
  });

  it('awaits immediate persistence before every action listener', async () => {
    const storage = {getStorageData: vi.fn().mockResolvedValue({}), setStorageData: vi.fn().mockResolvedValue(true)};
    const flux = new FluxFramework();
    await flux.init({storage, storageWait: 0, stores: [sessionStore]});
    let finishWrite: (saved: boolean) => void = () => {};
    storage.setStorageData.mockImplementationOnce(() => new Promise<boolean>((resolve) => {finishWrite = resolve;}));
    const first = vi.fn();
    const second = vi.fn();
    flux.on('SESSION_UPDATE', first);
    flux.on('SESSION_UPDATE', second);
    const pending = flux.dispatch({token: 'saved', type: 'SESSION_UPDATE'});
    expect(first).not.toHaveBeenCalled();
    expect(second).not.toHaveBeenCalled();
    finishWrite(true);
    await pending;
    expect(first).toHaveBeenCalledOnce();
    expect(second).toHaveBeenCalledOnce();
    expect(flux.getState('session.token')).toBe('saved');
  });

  it('invalidates cached paths when rehydrating the same instance', async () => {
    const flux = new FluxFramework();
    await flux.init({state: {session: {token: 'first'}}});
    expect(flux.getState('session.token')).toBe('first');
    await flux.init({state: {session: {token: 'reloaded'}}});
    expect(flux.getState('session.token')).toBe('reloaded');
  });
});
