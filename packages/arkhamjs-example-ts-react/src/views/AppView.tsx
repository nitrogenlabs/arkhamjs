import {Flux} from '@nlabs/arkhamjs';
import {Logger, LoggerDebugLevel} from '@nlabs/arkhamjs-middleware-logger';
import {BrowserStorage} from '@nlabs/arkhamjs-storage-browser';
import {FluxProvider} from '@nlabs/arkhamjs-utils-react';
import {useEffect, useState} from 'react';

import {Config} from '../config';
import {app} from '../stores/appStore/appStore';
import {HomeView} from './HomeView';

import type {FC} from 'react';


export const onUpdateContent = (setContent) => (): void => {
  const content = Flux.getState('app.content', '');
  setContent(content);
};

export const AppView = (): FC => {
  // ArkhamJS Middleware
  const env: string = Config.get('environment');
  const logger: Logger = new Logger({
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
