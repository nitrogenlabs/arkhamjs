// chrome.runtime.onInstalled.addListener(function() {
//   // Replace all rules ...
//   chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
//     // With a new rule ...
//     chrome.declarativeContent.onPageChanged.addRules([
//       {
//         // That fires when a page's URL contains a 'g' ...
//         conditions: [
//           new chrome.declarativeContent.PageStateMatcher({
//             pageUrl: { urlContains: 'g' },
//           })
//         ],
//         // And shows the extension's page action.
//         actions: [ new chrome.declarativeContent.ShowPageAction() ]
//       }
//     ]);
//   });
// });
// const win = (<any>window);

// console.log('win', win);

// win.addEventListener('load', loadEvent => {
//   let window = loadEvent.currentTarget;
//   console.log('window', window);
//   console.log('loadEvent', loadEvent);
//   window.document.title = 'You changed me!';
// });

// win.addEventListener('ARKHAMJS_INIT', () => {
//   const Flux = win.arkhamjs;

//   console.log('ArkhamJS DevTools', Flux.getState());

//   Flux.on('APP_UPDATE_CONTENT', () => {
//     console.log('ArkhamJS::Content', Flux.getState());
//   });
// });

// chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
//   if(request.cmd == "any command") {
//     sendResponse({result: "any response from background"});
//   } else {
//     sendResponse({result: "error", message: `Invalid 'cmd'`});
//   }
//   // Note: Returning true is required here!
//   //  ref: http://stackoverflow.com/questions/20077487/chrome-extension-message-passing-response-not-sent
//   return true;
// });
console.log('load::bg');

window.addEventListener('load', () => {
  window.postMessage({_arkhamCall: {method: 'storeClasses'}}, '*');
});

// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   // port.postMessage({greeting:"hello"});
//   console.log('chrome::onMessage::request', request);
// });
window.addEventListener('message', (event) => {
  const {data = {}, source} = event;

  // We only accept messages from ourselves
  if(source !== window) {
    return;
  }

  chrome.runtime.sendMessage(data);
});
