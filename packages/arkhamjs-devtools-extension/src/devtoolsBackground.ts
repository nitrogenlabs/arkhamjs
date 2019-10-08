// import {Flux} from '@nlabs/arkhamjs';
const {devtools: {panels}} = chrome || {};

// Create panel
if(panels) {
  panels.create('ArkhamJS', null, 'app.html', () => {});
}
console.log('load::devtoolsbg');
