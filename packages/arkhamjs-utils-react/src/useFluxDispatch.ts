/**
 * Copyright (c) 2020-Present, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
import {useContext} from 'react';

import {FluxContext} from './FluxContext';

export const useFluxDispatch = (type: string, data: any = {}, silent: boolean = false) => {
  const {flux} = useContext(FluxContext);
  return flux.dispatch({...data, type}, silent);
};
