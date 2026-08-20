// import {Flux} from '@nlabs/arkhamjs';
const {devtools: {panels}} = chrome || {};

// Create panel
if(panels) {
  panels.create('ArkhamJS', 'icons/icon16.png', 'app.html', () => {});
}
console.log('load::devtoolsbg');
