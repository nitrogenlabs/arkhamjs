import {Flux} from '@nlabs/arkhamjs';
import {FluxProvider} from '@nlabs/arkhamjs-utils-react';
import * as renderer from 'react-test-renderer';

import {HomeView} from './HomeView.js';

describe('HomeView', () => {
  let rendered;

  beforeAll(() => {
    Flux.init();

    // Render
    rendered = renderer.create(<FluxProvider flux={Flux}><HomeView initialContent="" /></FluxProvider>);
  });

  it('should render', () => expect(rendered).toBeDefined());
});
