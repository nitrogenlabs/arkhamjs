import './appView.css';

import {Flux} from '@nlabs/arkhamjs';
import {Logger, LoggerDebugLevel} from '@nlabs/arkhamjs-middleware-logger';
import {BrowserStorage} from '@nlabs/arkhamjs-storage-browser';
import {useFlux} from '@nlabs/arkhamjs-utils-react';
import React, {useEffect, useRef, useState} from 'react';
import {hot} from 'react-hot-loader';
import {createUseStyles} from 'react-jss';

import {updateContent} from '../../actions/AppActions/AppActions';
import {Icon} from '../../components/Icon/Icon';
import {Config} from '../../config';
import {AppConstants} from '../../constants/AppConstants';
import {StringService} from '../../services/StringService/StringService';
import {app} from '../../stores/appStore/appStore';

const useStyles = createUseStyles({
  logo: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: 100
  },
  logoImg: {
    height: 94,
    width: 403
  },
  helloTxt: {
    fontSize: 30,
    fontStyle: 'italic',
    fontWeight: 100,
    textAlign: 'center'
  },
  form: {
    display: 'flex',
    flexDirection: 'column'
  },
  input: {
    alignSelf: 'stretch',
    border: '1px solid #ccc',
    padding: '10px 15px',
    margin: '30px 0'
  },
  button: {
    alignSelf: 'flex-end',
    alignContent: 'center',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center'

  },
  btnIcon: {
    alignSelf: 'center',
    marginRight: 5
  }
});

export const onChange = (inputRef): void => {
  if(inputRef.current) {
    const {value} = inputRef.current;
    updateContent(value);
  }
};

export const onUpdateContent = (setContent) => (): void => {
  const content = Flux.getState('app.content', '');
  setContent(content);
};

export const AppViewBase = (): JSX.Element => {
  // ArkhamJS Middleware
  const env: string = Config.get('environment');
  const logger: Logger = new Logger({
    debugLevel: env === 'development' ? LoggerDebugLevel.DISPATCH : LoggerDebugLevel.DISABLED
  });

  // ArkhamJS Configuration
  Flux.init({
    middleware: [logger],
    name: 'arkhamExampleReact',
    storage: new BrowserStorage({type: 'session'}),
    stores: [app]
  });

  // State
  const [content, setContent] = useState(Flux.getState('app.content', ''));
  const inputRef = useRef();

  useFlux([
    {handler: onUpdateContent, type: AppConstants.UPDATE_CONTENT}
  ]);

  useEffect(() => {
    const onUpdate = onUpdateContent(setContent);

    // When app initializes and gets any data from persistent storage
    Flux.onInit(onUpdate);

    return () => {
      Flux.offInit(onUpdate);
    };
  });

  // Styles
  const classes = useStyles();

  return (
    <div className="container">
      <div className="row">
        <div className="col-sm-12">
          <div className={classes.logo}>
            <a href="https://arkhamjs.io">
              <img className={classes.logoImg} src="/img/arkhamjs-logo.png" />
            </a>
          </div>
          <div className={classes.helloTxt}>{StringService.uppercaseWords(content)}</div>
          <div className={classes.form}>
            <input className={classes.input} ref={inputRef} type="text" name="test" />
            <button className={`btn btn-primary ${classes.button}`} onClick={onChange}>
              <Icon name="pencil" className={classes.btnIcon} />
              UPDATE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AppView = hot(module)(AppViewBase);
