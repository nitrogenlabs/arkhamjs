'use strict';Object.defineProperty(exports,'__esModule',{value:!0});



var _Flux=require('../Flux'),_Flux2=_interopRequireDefault(_Flux),_createBrowserHistory=require('history/createBrowserHistory'),_createBrowserHistory2=_interopRequireDefault(_createBrowserHistory),_ArkhamConstants=require('../constants/ArkhamConstants'),_ArkhamConstants2=_interopRequireDefault(_ArkhamConstants);function _interopRequireDefault(a){return a&&a.__esModule?a:{default:a}}







var ArkhamActions={
goto:function goto(a){
var b=(0,_createBrowserHistory2.default)();

return b.push(a),b;
},

updateTitle:function updateTitle(a){
return _Flux2.default.dispatch({type:_ArkhamConstants2.default.UPDATE_TITLE,title:a});
}};exports.default=


ArkhamActions;