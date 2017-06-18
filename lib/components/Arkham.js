'use strict';var _createClass=function(){function a(a,b){for(var c,d=0;d<b.length;d++)c=b[d],c.enumerable=c.enumerable||!1,c.configurable=!0,'value'in c&&(c.writable=!0),Object.defineProperty(a,c.key,c)}return function(b,c,d){return c&&a(b.prototype,c),d&&a(b,d),b}}(),_react=require('react'),_react2=_interopRequireDefault(_react),_propTypes=require('prop-types'),_propTypes2=_interopRequireDefault(_propTypes),_reactRouterDom=require('react-router-dom'),_Flux=require('../Flux'),_Flux2=_interopRequireDefault(_Flux),_ArkhamConstants=require('../constants/ArkhamConstants'),_ArkhamConstants2=_interopRequireDefault(_ArkhamConstants);Object.defineProperty(exports,'__esModule',{value:!0});function _interopRequireDefault(a){return a&&a.__esModule?a:{default:a}}function _classCallCheck(a,b){if(!(a instanceof b))throw new TypeError('Cannot call a class as a function')}function _possibleConstructorReturn(a,b){if(!a)throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called');return b&&('object'==typeof b||'function'==typeof b)?b:a}function _inherits(a,b){if('function'!=typeof b&&null!==b)throw new TypeError('Super expression must either be null or a function, not '+typeof b);a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}var













Arkham=function(a){


















function b(a){_classCallCheck(this,b);var c=_possibleConstructorReturn(this,(b.__proto__||Object.getPrototypeOf(b)).call(this,a));



c.onUpdateTitle=c.onUpdateTitle.bind(c),
c.onUpdateView=c.onUpdateView.bind(c),


c._config=a.config,
_Flux2.default.config(c._config),


_Flux2.default.registerStore(a.stores);var d=







c._config,e=d.forceRefresh,f=void 0===e?'pushState'in window.history:e,g=d.routerType,h=void 0===g?'browser':g,i=d.scrollToTop,j=d.title,k=void 0===j?'ArkhamJS':j;return(

c._appTitle=k,
c._forceRefresh=f,
c._routerType=h,
c._scrollToTop=void 0===i||i,c);
}return _inherits(b,a),_createClass(b,[{key:'componentWillMount',value:function componentWillMount()

{

_Flux2.default.on(_ArkhamConstants2.default.UPDATE_TITLE,this.onUpdateTitle);
}},{key:'componentWillUnmount',value:function componentWillUnmount()

{

_Flux2.default.on(_ArkhamConstants2.default.UPDATE_TITLE,this.onUpdateTitle);
}},{key:'getChildContext',value:function getChildContext()

{
return{
config:this._config};

}},{key:'onUpdateView',value:function onUpdateView(a,b)

{return(

this._scrollToTop&&
window.scrollTo(0,0),


_Flux2.default.dispatch(_ArkhamConstants2.default.UPDATE_VIEW),


this.props.config.getUserConfirmation?
this.props.config.getUserConfirmation(a,b):

b(!0));

}},{key:'onUpdateTitle',value:function onUpdateTitle(a)

{
var b=a.get('title','');







return document.title=''===b?''+this._appTitle:b+' :: '+this._appTitle,document.title;
}},{key:'render',value:function render()

{

var a=_react2.default.createElement('div',{className:this.props.className},this.props.children);


switch(this._routerType){
case'browser':
return(
_react2.default.createElement(_reactRouterDom.BrowserRouter,{
baseName:this.props.config.baseName,
forceRefresh:this._forceRefresh,
getUserConfirmation:this.onUpdateView,
keyLength:this.props.config.keyLength},a));



break;
case'hash':
return(
_react2.default.createElement(_reactRouterDom.HashRouter,{
baseName:this.props.config.baseName,
getUserConfirmation:this.onUpdateView,
hashType:this.props.config.hashType},a));



break;
case'memory':
return(
_react2.default.createElement(_reactRouterDom.MemoryRouter,{
initialEntries:this.props.config.initialEntries,
initialIndex:this.props.config.initialIndex,
getUserConfirmation:this.onUpdateView,
keyLength:this.props.config.keyLength},a));



break;
case'static':
return(
_react2.default.createElement(_reactRouterDom.StaticRouter,{
baseName:this.props.config.baseName,
location:this.props.config.location,
context:this.props.config.context},a));



break;
default:
return(
_react2.default.createElement(_reactRouterDom.Router,{history:this.props.config.history},a));}





}}]),b}(_react.Component);Arkham.propTypes={children:_propTypes2.default.element,className:_propTypes2.default.string,config:_propTypes2.default.object,routes:_propTypes2.default.array,stores:_propTypes2.default.array},Arkham.defaultProps={config:{},routes:[],stores:[]},Arkham.childContextTypes={config:_propTypes2.default.object},exports.default=Arkham;