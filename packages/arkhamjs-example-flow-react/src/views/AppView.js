import {Flux} from '@nlabs/arkhamjs';
import {Logger, LoggerDebugLevel} from '@nlabs/arkhamjs-middleware-logger';
import {BrowserStorage} from '@nlabs/arkhamjs-storage-browser';
import {FluxProvider} from '@nlabs/arkhamjs-utils-react';
import {useEffect, useState} from 'react';
import {hot} from 'react-hot-loader';

import {Config} from '../config';
import {app} from '../stores/appStore/appStore';
import {HomeView} from './HomeView';

export const onUpdateContent = (setContent) => () => {
  const content = Flux.getState('app.content', '');
  setContent(content);
};

export const AppViewBase = () => {
  // ArkhamJS Middleware
  const env = Config.get('environment');
  const logger = new Logger({
    debugLevel: env === 'development' ? LoggerDebugLevel.DISPATCH : LoggerDebugLevel.DISABLED
  });

  const [content, setContent] = useState(Flux.getState('app.content', ''));

  // ArkhamJS Configuration
  Flux.init({
    middleware: [logger],
    name: 'arkhamExampleReact',
    storage: new BrowserStorage({type: 'session'}),
    stores: [app]
  });

  useEffect(() => {
    const onUpdate = onUpdateContent(setContent);

    // When app initializes and gets any data from persistent storage
    Flux.onInit(onUpdate);

    return () => {
      Flux.offInit(onUpdate);
    };
  });

  return (
    <FluxProvider flux={Flux}>
      <HomeView initialContent={content} />
    </FluxProvider>
  );
};

export const AppView = hot(module)(AppViewBase);
