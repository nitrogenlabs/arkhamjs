import {AnyAction, Dispatch, Middleware} from 'redux';

export interface ArkhamReduxStoreType {
  arkhamMiddleware: any[];
  devTools: any;
  flux: any;
  reducers: Dispatch<AnyAction>;
  reduxMiddleware: Middleware[];
  statePath: string;
}
