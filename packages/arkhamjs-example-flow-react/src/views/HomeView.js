import {useFluxDispatch} from '@nlabs/arkhamjs-utils-react';
import React, {useRef, useState} from 'react';
import {createUseStyles} from 'react-jss';

import {updateContent} from '../actions/AppActions/AppActions';
import {Icon} from '../components/Icon/Icon';
import {AppConstants} from '../constants/AppConstants';
import {uppercaseWords} from '../services/StringService';

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

export const onChange = (inputRef) => () => {
  if(inputRef.current) {
    const {value} = inputRef.current;
    updateContent(value);
  }
};

export const onUpdateContent = (setContent) => ({content}): void => {
  setContent(content);
};

export const HomeView = ({initialContent}): JSX.Element => {
  // State
  const [content, setContent] = useState(initialContent);
  const inputRef = useRef();

  useFluxDispatch(AppConstants.UPDATE_CONTENT, onUpdateContent(setContent));

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
          <div className={classes.helloTxt}>{uppercaseWords(content)}</div>
          <div className={classes.form}>
            <input className={classes.input} ref={inputRef} type="text" name="test" />
            <button className={`btn btn-primary ${classes.button}`} onClick={onChange(inputRef)}>
              <Icon name="pencil" className={classes.btnIcon} />
              UPDATE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
