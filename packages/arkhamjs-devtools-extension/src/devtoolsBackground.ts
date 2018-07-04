// import {Flux} from '@nlabs/arkhamjs';
const panels = chrome && chrome.devtools && chrome.devtools.panels;

// Create panel
if(panels) {
  panels.create('ArkhamJS', null, 'app.html', () => {});
}
console.log('load::devtoolsbg');
