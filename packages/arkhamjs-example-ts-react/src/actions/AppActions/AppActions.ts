import {Flux, FluxAction} from '@nlabs/arkhamjs';

import {AppConstants} from '../../constants/AppConstants';

export const updateContent = (content: string): Promise<FluxAction> =>
  Flux.dispatch({content, type: AppConstants.UPDATE_CONTENT});
