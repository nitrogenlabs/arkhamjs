import {AnyAction, Dispatch, Middleware} from 'redux';

export interface ArkhamReduxStoreType {
  arkhamMiddleware: any[];
  devTools: any;
  flux: any;
  reducers: Dispatch<AnyAction>;
  reduxMiddleware: Middleware[];
  sagas: any;
  statePath: string;
}

export interface ArkhamReduxAction {
  [key: string]: any;
  __ARKHAMJS_DISPATCH?: boolean;
  type: string;
}
