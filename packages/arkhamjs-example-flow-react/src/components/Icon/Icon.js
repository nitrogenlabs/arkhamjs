import React from 'react';
import {createUseStyles} from 'react-jss';

import type {IconProps} from './Icon.types';

const useStyles = createUseStyles({
  icon: ({iconSize}) => ({
    backgroundColor: 'transparent',
    color: 'inherit',
    display: 'block',
    fill: 'currentColor',
    height: iconSize,
    verticalAlign: 'middle',
    width: iconSize,

    '& svg': {
      fill: 'inherit',
      height: '100%',
      width: '100%',

      '& symbol path': {
        all: 'inherit'
      }
    }
  })
});

export const Icon = (props: IconProps): JSX.Element => {
  const {
    className = '',
    size: propSize = ''
  } = props;
  const name: string = 'icon';
  const size = propSize.toLowerCase().trim();

  // Icon sizes
  let iconSize;

  switch(size) {
    case 'md':
      iconSize = 32;
      break;
    case 'lg':
      iconSize = 64;
      break;
    case 'xl':
      iconSize = 128;
      break;
    case 'xx':
      iconSize = 256;
      break;
    default:
      iconSize = 16;
      break;
  }

  // Styles
  const classes = useStyles({iconSize});
  const styleClasses: string[] = [name, classes.icon, className];

  // SVG
  const useTag: string = `<use xlink:href="/icons/icons.svg#${name}" />`;
  return <svg className={styleClasses.join(' ')} dangerouslySetInnerHTML={{__html: useTag}} />;
};
