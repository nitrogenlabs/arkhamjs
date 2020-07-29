import {FluxProvider} from '@nlabs/arkhamjs-utils-react';
import * as React from 'react';
import * as renderer from 'react-test-renderer';

import {HomeView} from './HomeView';

describe('HomeView', () => {
  let rendered;

  beforeAll(() => {
    const fluxMock: any = jest.fn();

    // Render
    rendered = renderer.create(<FluxProvider flux={fluxMock}><HomeView initialContent="" /></FluxProvider>);
  });

  it('should render', () => expect(rendered).toBeDefined());
});
