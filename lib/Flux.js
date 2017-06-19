'use strict';var _typeof='function'==typeof Symbol&&'symbol'==typeof Symbol.iterator?function(a){return typeof a}:function(a){return a&&'function'==typeof Symbol&&a.constructor===Symbol&&a!==Symbol.prototype?'symbol':typeof a},_createClass=function(){function a(a,b){for(var c,d=0;d<b.length;d++)c=b[d],c.enumerable=c.enumerable||!1,c.configurable=!0,'value'in c&&(c.writable=!0),Object.defineProperty(a,c.key,c)}return function(b,c,d){return c&&a(b.prototype,c),d&&a(b,d),b}}(),_events=require('events'),_events2=_interopRequireDefault(_events),_immutable=require('immutable'),_immutable2=_interopRequireDefault(_immutable);Object.defineProperty(exports,'__esModule',{value:!0});function _interopRequireDefault(a){return a&&a.__esModule?a:{default:a}}function _classCallCheck(a,b){if(!(a instanceof b))throw new TypeError('Cannot call a class as a function')}function _possibleConstructorReturn(a,b){if(!a)throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called');return b&&('object'==typeof b||'function'==typeof b)?b:a}function _inherits(a,b){if('function'!=typeof b&&null!==b)throw new TypeError('Super expression must either be null or a function, not '+typeof b);a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}var











Flux=function(a){







function b(){var a=0<arguments.length&&void 0!==arguments[0]?arguments[0]:{};_classCallCheck(this,b);var c=_possibleConstructorReturn(this,(b.__proto__||Object.getPrototypeOf(b)).call(this));return(



c._deregister=c._deregister.bind(c),
c._register=c._register.bind(c),
c.clearAppData=c.clearAppData.bind(c),
c.config=c.config.bind(c),
c.debugError=c.debugError.bind(c),
c.debugInfo=c.debugInfo.bind(c),
c.debugLog=c.debugLog.bind(c),
c.delLocalData=c.delLocalData.bind(c),
c.delSessionData=c.delSessionData.bind(c),
c.deregisterStore=c.deregisterStore.bind(c),
c.dispatch=c.dispatch.bind(c),
c.enableDebugger=c.enableDebugger.bind(c),
c.getClass=c.getClass.bind(c),
c.getLocalData=c.getLocalData.bind(c),
c.getSessionData=c.getSessionData.bind(c),
c.getStore=c.getStore.bind(c),
c.off=c.off.bind(c),
c.registerStore=c.registerStore.bind(c),
c.setLocalData=c.setLocalData.bind(c),
c.setSessionData=c.setSessionData.bind(c),
c.setStore=c.setStore.bind(c),


c._store=(0,_immutable.Map)(),
c._storeClasses=(0,_immutable.Map)(),
c._window=window||{},


c.DEBUG_DISABLED=0,
c.DEBUG_LOGS=1,
c.DEBUG_DISPATCH=2,


c.config(a),c);
}return _inherits(b,a),_createClass(b,[{key:'_deregister',value:function _deregister()

{var a=0<arguments.length&&void 0!==arguments[0]?arguments[0]:'';
this._storeClasses=this._storeClasses.delete(a),
this._store=this._store.delete(a);
}},{key:'_register',value:function _register(a)

{
if(!a)
throw Error('Class is undefined. Cannot register with Flux.');


var b=a.constructor.toString().substr(0,5);

if('class'!==b&&'funct'!==b)
throw Error(a+' is not a class. Cannot register with Flux.');



var c=new a,
d=c.name;

if(!this._storeClasses.get(d)){

this._storeClasses=this._storeClasses.set(d,c);


var e=this.getSessionData(this._name),
f=this._useCache&&_immutable.Map.isMap(e)?e:(0,_immutable.Map)(),


g=f.get(d)||this._store.get(d)||c.getInitialState()||(0,_immutable.Map)();
this._store=this._store.set(d,g),


this._useCache&&
this.setSessionData(this._name,this._store);

}

return this._storeClasses.get(d);
}},{key:'clearAppData',value:function clearAppData()






{var a=this;

this._storeClasses.forEach(function(b){
a._store=a._store.set(b.name,_immutable2.default.fromJS(b.getInitialState()));
}),

this.setSessionData(this._name,this._store);
}},{key:'config',value:function config(a)






{
this._options=a||{},


this._name=this._options.name||'arkhamjs',


this._useCache=!1!==this._options.useCache,

this._useCache&&(
this._store=this.getSessionData(this._name)||(0,_immutable.Map)()),



this._useImmutable=!1!==this._options.useImmutable,


this._debugLevel=this._options.debugLevel||this.DEBUG_DISABLED;
}},{key:'debugError',value:function debugError()







{for(var a=arguments.length,b=Array(a),c=0;c<a;c++)b[c]=arguments[c];
if(this._debugLevel){var d;
(d=console).error.apply(d,b);
}

var e=this._options.debugErrorFnc;e&&


e.apply(void 0,[this._debugLevel,b]);

}},{key:'debugInfo',value:function debugInfo()







{for(var a=arguments.length,b=Array(a),c=0;c<a;c++)b[c]=arguments[c];
if(this._debugLevel){var d;
(d=console).info.apply(d,b);
}

var e=this._options.debugInfoFnc;e&&


e.apply(void 0,[this._debugLevel,b]);

}},{key:'debugLog',value:function debugLog()







{for(var a=arguments.length,b=Array(a),c=0;c<a;c++)b[c]=arguments[c];
if(this._debugLevel){var d;
(d=console).log.apply(d,b);
}

var e=this._options.debugLogFnc;e&&


e.apply(void 0,[this._debugLevel,b]);

}},{key:'delLocalData',value:function delLocalData(a)







{
if(this._window&&this._window.localStorage)
try{

return this._window.localStorage.removeItem(a),!0;
}
catch(a){
return!1;
}else

return!1;

}},{key:'delSessionData',value:function delSessionData(a)







{
if(this._window&&this._window.sessionStorage)
try{

return this._window.sessionStorage.removeItem(a),!0;
}
catch(a){
return!1;
}else

return!1;

}},{key:'deregisterStore',value:function deregisterStore(a)






{var b=this;
Array.isArray(a)?
a.forEach(function(a){
b._deregister(a);
}):

this._deregister(a);

}},{key:'dispatch',value:function dispatch(a)







{var b=this,c=1<arguments.length&&void 0!==arguments[1]&&arguments[1];
a=_immutable2.default.fromJS(a);
var d=a.get('type'),
e=a.filter(function(a,b){return'type'!==b});


if(d){



var f=this._store;









if(this._storeClasses.forEach(function(a){var c=a.name,f=b._store.get(c)||a.getInitialState()||(0,_immutable.Map)();b._store=b._store.set(c,a.onAction(d,e,f)||f),a.state=b._store.get(c)}),this._debugLevel>this.DEBUG_LOGS){
var g=!this._store.equals(f),
h=g?'Changed State':'Unchanged State',
i=g?'#00d484':'#959595';

console.groupCollapsed?(
console.groupCollapsed('FLUX DISPATCH: '+d),
console.log('%c Action: ','color: #00C4FF',a.toJS()),
console.log('%c Last State: ','color: #959595',f.toJS()),
console.log('%c '+h+': ','color: '+i,this._store.toJS()),
console.groupEnd()):(

console.log('FLUX DISPATCH: '+d),
console.log('Action: '+a.toJS()),
console.log('Last State: ',f.toJS()),
console.log(h+': ',this._store.toJS()));

}return(


this._useCache&&
this.setSessionData(this._name,this._store),


this._useImmutable?(c||

this.emit(d,e),a):(c||





this.emit(d,e.toJS()),


a.toJS()))}

}},{key:'enableDebugger',value:function enableDebugger()









{var a=0<arguments.length&&void 0!==arguments[0]?arguments[0]:!0;
this._debugLevel=a;
}},{key:'getClass',value:function getClass()







{var a=0<arguments.length&&void 0!==arguments[0]?arguments[0]:'';
return this._storeClasses.get(a);
}},{key:'getLocalData',value:function getLocalData(a)







{
if(this._window&&this._window.localStorage)
try{
var b=this._window.localStorage.getItem(a);return b?


_immutable2.default.fromJS(JSON.parse(b)):


null;
}
catch(a){
return null;
}else

return null;

}},{key:'getSessionData',value:function getSessionData(a)







{
if(this._window&&this._window.sessionStorage)
try{
var b=this._window.sessionStorage.getItem(a);return b?


_immutable2.default.fromJS(JSON.parse(b)):


null;
}
catch(a){
return null;
}else

return null;

}},{key:'getStore',value:function getStore()









{var a=0<arguments.length&&void 0!==arguments[0]?arguments[0]:'',b=arguments[1],
c=void 0;return(


this._useImmutable&&'object'===('undefined'==typeof b?'undefined':_typeof(b))&&!_immutable2.default.Iterable.isIterable(b)&&(
b=b?_immutable2.default.fromJS(b):null),c=


Array.isArray(a)?
this._store.getIn(a,b):

''===a?


this._store||(0,_immutable.Map)():this._store.get(a,b),


this._useImmutable?c:


_immutable2.default.Iterable.isIterable(c)?c.toJS():c);

}},{key:'off',value:function off(a,b)







{
this.removeListener(a,b);
}},{key:'registerStore',value:function registerStore(a)







{var b=this;return(
Array.isArray(a)?
a.map(function(a){return b._register(a)}):

this._register(a));

}},{key:'setLocalData',value:function setLocalData(a,b)








{
if(this._window&&this._window.localStorage)
try{






return _immutable2.default.Iterable.isIterable(b)&&(b=b.toJS()),b=JSON.stringify(b),this._window.localStorage.setItem(a,b),!0;
}
catch(a){
return!1;
}else

return!1;

}},{key:'setSessionData',value:function setSessionData(a,b)








{
if(this._window&&this._window.sessionStorage)
try{






return _immutable2.default.Iterable.isIterable(b)&&(b=b.toJS()),b=JSON.stringify(b),this._window.sessionStorage.setItem(a,b),!0;
}
catch(a){
return!1;
}else

return!1;

}},{key:'setStore',value:function setStore()









{var a=0<arguments.length&&void 0!==arguments[0]?arguments[0]:'',b=arguments[1];return(
Array.isArray(a)?
this._store=this._store.setIn(a,b):

''===a?


this._store||(0,_immutable.Map)():this._store=this._store.set(a,b));

}}]),b}(_events2.default),


flux=new Flux((window||{}).arkhamjs);exports.default=
flux;