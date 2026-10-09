import {FluxFramework} from '@nlabs/arkhamjs';
import {act} from 'react';
import {createRoot} from 'react-dom/client';
import {describe, expect, it} from 'vitest';

import {FluxProvider} from './FluxProvider.js';
import {useFluxState} from './useFluxState.js';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
const View = ({fallback, path}: {fallback?: unknown; path: string | string[]}) => <span>{JSON.stringify(useFluxState(path, fallback))}</span>;

describe('useFluxState selections', () => {
  it('selects changing string/array keys and defaults without a state event, preserving falsy values', async () => {
    const flux = new FluxFramework();
    void flux.addStores([{action: (_type, _data, state) => state, initialState: {a: 1, b: 2, no: false, zero: 0}, name: 'test'}]);
    const container = document.createElement('div');
    const root = createRoot(container);
    const render = async (path: string | string[], fallback?: unknown) => act(async () => root.render(<FluxProvider flux={flux}><View fallback={fallback} path={path}/></FluxProvider>));
    await render('test.a'); expect(container.textContent).toBe('1');
    await render('test.b'); expect(container.textContent).toBe('2');
    await render(['test', 'a']); expect(container.textContent).toBe('1');
    await render(['test', 'a']); expect(container.textContent).toBe('1');
    await render('missing', 'first'); expect(container.textContent).toBe('"first"');
    await render('missing', 'second'); expect(container.textContent).toBe('"second"');
    await render('test.no', true); expect(container.textContent).toBe('false');
    await render('test.zero', 9); expect(container.textContent).toBe('0');
    await act(async () => root.unmount());
  });
});
