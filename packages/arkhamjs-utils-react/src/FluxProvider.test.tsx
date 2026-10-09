import {FluxFramework} from '@nlabs/arkhamjs';
import {act, StrictMode, useLayoutEffect} from 'react';
import {createRoot} from 'react-dom/client';
import {describe, expect, it} from 'vitest';

import {FluxProvider} from './FluxProvider.js';
import {useFluxState} from './useFluxState.js';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
const createFlux = (value: number) => {
  const flux = new FluxFramework();
  void flux.addStores([{action: (type, data, state) => type === 'change' ? {...state, value: data.value} : state, initialState: {value}, name: 'test'}]);
  return flux;
};
const View = ({flux, change = false}: {flux: FluxFramework; change?: boolean}) => {
  const value = useFluxState('test.value');
  useLayoutEffect(() => { if(change) { void flux.dispatch({type: 'change', value: 2}); } }, [change, flux]);
  return <span>{value}</span>;
};

describe('FluxProvider rendered subscription contract', () => {
  it('catches layout-effect changes before passive subscription, including StrictMode replay', async () => {
    const flux = createFlux(1);
    const container = document.createElement('div');
    const root = createRoot(container);
    await act(async () => root.render(<StrictMode><FluxProvider flux={flux}><View flux={flux} change /></FluxProvider></StrictMode>));
    expect(container.textContent).toBe('2');
    expect(flux.listenerCount('arkhamjs')).toBe(1);
    await act(async () => root.unmount());
    expect(flux.listenerCount('arkhamjs')).toBe(0);
  });
  it('replaces flux without events, updates two consumers and removes exactly old subscriptions', async () => {
    const first = createFlux(1);
    const second = createFlux(3);
    const container = document.createElement('div');
    const root = createRoot(container);
    const render = (flux: FluxFramework) => <FluxProvider flux={flux}><View flux={flux}/><View flux={flux}/></FluxProvider>;
    await act(async () => root.render(render(first)));
    expect(container.textContent).toBe('11');
    await act(async () => root.render(render(second)));
    expect(container.textContent).toBe('33');
    expect(first.listenerCount('arkhamjs')).toBe(0);
    await act(async () => first.dispatch({type: 'change', value: 8}));
    expect(container.textContent).toBe('33');
    await act(async () => second.dispatch({type: 'change', value: 4}));
    expect(container.textContent).toBe('44');
    await act(async () => second.dispatch({type: 'unchanged'}));
    expect(container.textContent).toBe('44');
    await act(async () => root.unmount());
    expect(second.listenerCount('arkhamjs')).toBe(0);
  });
});
