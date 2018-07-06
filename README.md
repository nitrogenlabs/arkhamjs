# ArkhamJS

<img src="https://arkhamjs.io/img/logos/gh-arkhamjs.png" width="400"/>

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)
[![npm version](https://img.shields.io/npm/v/@nlabs/arkhamjs.svg?style=flat-square)](https://www.npmjs.com/package/arkhamjs)
[![Issues](http://img.shields.io/github/issues/nitrogenlabs/arkhamjs.svg?style=flat-square)](https://github.com/nitrogenlabs/arkhamjs/issues)
[![TypeScript](https://badges.frapsoft.com/typescript/version/typescript-next.svg?v=101)](https://github.com/ellerbrock/typescript-badges/)
[![MIT license](http://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](http://opensource.org/licenses/MIT)
[![Chat](https://img.shields.io/discord/446122412715802649.svg)](https://discord.gg/Ttgev58)

## Flux Framework

ArkhamJS is a lightweight framework that can accommodate a project of any size, small or large. From small start-up ideas to large enterprise projects. A simple, flexible framework. Consisting of a singular state tree with a unidirectional data flow.

## Lightweight

The framework is small. The bulk of your app should lay within your code, not the framework. While larger frameworks come with lots of "magic", they become very limited when new features arise within your project.

## Typescript

Compatible with typescript. Definitions are included to support your Typescript project.

## Single Store

All data is stored within a single store. The data can be accessed through all your views and components. Data is organized into multiple stores within the single store.

## Immutability

To prevent object referencing, we use immutable objects. When the state changes, the state's property is not the only item that is changed, the item it references is also updated. To prevent passing around an object between different scopes, immutable objects give your data a one way update path. You may also have returned values converted into ImmutableJS objects.

## Debugger

The most important factor in choosing a framework is how easy it is to build with it. And with building comes debugging. A state debugger can be added with the middleware, [@nlabs/arkhamjs-middleware-logger](https://github.com/nitrogenlabs/arkhamjs-middleware-logger). When turned on, it will display any actions and state changes that come through the framework. Making the previous and next state visible to the developer. Great way to make your data transparent! Supported browsers: Chrome, Firefox, and Safari.

## Cache Storage

An app state is clears after a browser refresh. Keeping the state after a reload can be very useful when requiring a persistent state.

If you plan to persist data, you will need to add a storage to the framework:

- React [@nlabs/arkhamjs-storage-browser](https://github.com/nitrogenlabs/arkhamjs-storage-browser)
- React Native [@nlabs/arkhamjs-storage-native](https://github.com/nitrogenlabs/arkhamjs-storage-native)
- NodeJS [@nlabs/arkhamjs-storage-node](https://github.com/nitrogenlabs/arkhamjs-storage-node)
