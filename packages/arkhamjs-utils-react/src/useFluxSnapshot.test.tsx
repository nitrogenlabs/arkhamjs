import {FluxFramework} from '@nlabs/arkhamjs';
import {act, useContext, useLayoutEffect} from 'react';
import {createRoot} from 'react-dom/client';
import {describe, expect, it} from 'vitest';

import {FluxContext} from './FluxContext.js';
import {FluxProvider} from './FluxProvider.js';
import * as hooks from './index.js';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
const makeFlux = (value: unknown) => {
  const flux = new FluxFramework();
  void flux.addStores([{action: (type, data, state) => type === 'change' ? data.value : state, initialState: value, name: 'test'}]);
  return flux;
};
const View = ({fallback = 'default', path, change}: {fallback?: unknown; path: string; change?: () => void}) => {
  const value = hooks.useFluxSnapshot(path, fallback);
  useLayoutEffect(() => { change?.(); }, [change]);
  return <span>{JSON.stringify(value)}</span>;
};

describe('useFluxSnapshot', () => {
  it('exports a public typed selector', () => expect(hooks.useFluxSnapshot).toBeTypeOf('function'));
  it('preserves falsy/leaf arrays, rejects array descent and retains the first fallback', async () => {
    const flux = makeFlux({zero: 0, no: false, nil: null, rows: [1, 2]});
    const el = document.createElement('div'); const root = createRoot(el);
    const render = async (path: string, fallback?: unknown) => act(async () => root.render(<FluxProvider flux={flux}><View fallback={fallback} path={path}/></FluxProvider>));
    await render('test.zero'); expect(el.textContent).toBe('0');
    await render('test.no'); expect(el.textContent).toBe('false');
    await render('test.nil'); expect(el.textContent).toBe('null');
    await render('test.rows'); expect(el.textContent).toBe('[1,2]');
    await render('test.rows.0', 'new'); expect(el.textContent).toBe('"default"');
    await render('test.missing', 'changed'); expect(el.textContent).toBe('"default"');
    await render('test.nil.a'); expect(el.textContent).toBe('"default"');
    await render('test.zero.a'); expect(el.textContent).toBe('"default"');
    await act(async () => root.unmount()); expect(flux.listenerCount('arkhamjs')).toBe(0);
  });
  it('catches changes before passive subscription and switches instances and paths', async () => {
    const first = makeFlux({a: 1, b: 2}); const second = makeFlux({a: 3, b: 4});
    const el = document.createElement('div'); const root = createRoot(el);
    const change = () => { void first.dispatch({type: 'change', value: {a: 8, b: 2}}); };
    await act(async () => root.render(<FluxProvider flux={first}><View change={change} path="test.a"/></FluxProvider>));
    expect(el.textContent).toBe('8');
    await act(async () => root.render(<FluxProvider flux={second}><View path="test.b"/></FluxProvider>));
    expect(el.textContent).toBe('4'); expect(first.listenerCount('arkhamjs')).toBe(0);
    await act(async () => first.dispatch({type: 'change', value: {b: 99}})); expect(el.textContent).toBe('4');
    await act(async () => second.dispatch({type: 'change', value: {b: 6}})); expect(el.textContent).toBe('6');
    await act(async () => second.emit('arkhamjs')); expect(el.textContent).toBe('6');
    await act(async () => second.emit('arkhamjs', {test: {b: 7}})); expect(el.textContent).toBe('7');
    await act(async () => root.unmount()); expect(second.listenerCount('arkhamjs')).toBe(0);
  });
  it('throws a descriptive error when no Provider is present', async () => {
    const root = createRoot(document.createElement('div'));
    await expect(act(async () => root.render(<View path="test.a"/>))).rejects.toThrow('useFluxSnapshot requires a FluxProvider');
    await act(async () => root.unmount());
  });
});

it('Provider rereads a whole snapshot on absent event payload', async () => {
  const flux = makeFlux({a: 1});
  const el = document.createElement('div'); const root = createRoot(el);
  const ContextView = () => <span>{JSON.stringify(useContext(FluxContext).state)}</span>;
  await act(async () => root.render(<FluxProvider flux={flux}><ContextView/></FluxProvider>));
  await act(async () => flux.emit('arkhamjs'));
  expect(el.textContent).toBe('{"test":{"a":1}}');
  await act(async () => root.unmount());
});
