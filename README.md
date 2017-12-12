![ArkhamJS](https://nitrogenlabs.com/logos/gh-arkhamjs.png "ArkhamJS")

#### Flux Framework for ReactJS

ArkhamJS is a lightweight framework that can accommodate a project of any size. From small start-up ideas to large enterprise projects. ReactJS is an amazing library but unfortunately, it is not a framework. Although the creators of ReactJS recommend using React in a Flux architecture, there is no official framework. The result is a wide variety of great third-party frameworks. Our goal is to create a simple framework with flexibility. And thus came ArkhamJS.

#### Lightweight
The framework is small. The bulk of your app should lay within your code, not the framework. While larger frameworks come with lots of "magic", they become very limited when new features arise within your project. ReactJS is very powerful in itself. ArkhamJS simply complements it.

#### Typescript
Compatible with typescript. Definitions are included to support your Typescript project.

#### Single Store
All data is stored within a single store. The data can be accessed through all your views and components. Data is organized into multiple stores within the single store.

#### Immutability
To prevent object referencing, we use immutable objects. When a state changes in a ReactJS component, the state's property is not the only item that is changed, the item it references is also updated. To prevent passing around an object between different scopes, immutable objects give your data a one way update path.

#### Cache
Your single store id stored in SessionStorage by default. While this can be turned off in your options, it can be very useful when saving state.

#### Debugger
The most important factor in choosing a framework is how easy it is to build with it. And with building comes debugging. A detailed debugger is included with the framework. When turned on, it will display any actions that come through the framework. Making the previous and new state visible to the developer. Great way to make your data transparent! Supported browsers: Chrome, Firefox, and Safari.

#### Skeleton
For a complete example of the setup, feel free to start your project with [arkhamjs-skeleton](https://github.com/nitrogenlabs/arkhamjs-skeleton).
It includes a full setup of a bare bones React app using Webpack 2 and Babel 6. Also includes Karma unit testing and coverage reports.

#### Documentation
For some detailed [Documentation](http://www.arkhamjs.com) and additional options on the framework.

#### React Native
Looking into developing for mobile? There is a React Native version of ArkhamJS, [ArkhamJS Native](https://github.com/nitrogenlabs/arkhamjs-native). The biggest difference here is in the way storage is managed.

[![npm version](https://img.shields.io/npm/v/arkhamjs.svg?style=flat-square)](https://www.npmjs.com/package/arkhamjs)
[![Travis](https://img.shields.io/travis/nitrogenlabs/arkhamjs.svg?style=flat-square)](https://travis-ci.org/nitrogenlabs/arkhamjs)
[![npm downloads](https://img.shields.io/npm/dm/arkhamjs.svg?style=flat-square)](https://www.npmjs.com/package/arkhamjs)
[![TypeScript](https://badges.frapsoft.com/typescript/version/typescript-next.svg?v=101)](https://github.com/ellerbrock/typescript-badges/)
[![Issues](http://img.shields.io/github/issues/nitrogenlabs/arkhamjs.svg?style=flat-square)](https://github.com/nitrogenlabs/arkhamjs/issues)
[![Gitter](https://img.shields.io/gitter/room/NitrgenLabs/arkhamjs.svg?style=flat-square)](https://gitter.im/NitrogenLabs/arkhamjs)
[![MIT license](http://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](http://opensource.org/licenses/MIT)

### Installation

Using [npm](https://www.npmjs.com/):
```bash
$ npm install --save arkhamjs
```
or
```bash
$ yarn add arkhamjs
```
