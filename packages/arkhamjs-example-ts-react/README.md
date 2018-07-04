# ArkhamJS React TypeScript Example

A simple base application to start you off on your ReactJS project. Uses the following modules:
 - [arkhamjs](https://www.npmjs.com/package/arkhamjs) - A clean, simple Flux framework.
 - [react](https://www.npmjs.com/package/react) - A declarative, efficient, and flexible JavaScript library for building user interfaces.
 - [@nlabs/lex](https://www.npmjs.com/package/@nlabs/lex) - CLI tool to assist in development. Initialize, test, and compile your apps with zero setup. Using [Jest](https://facebook.github.io/jest/), [Webpack](https://webpack.js.org/), and [Typescript](http://www.typescriptlang.org/).
 - [@nlabs/arkhamjs-storage-browser](https://www.npmjs.com/package/@nlabs/arkhamjs-storage-browser) - ArkhamJS browser storage. Caches state in session or local storage.
 - [@nlabs/arkhamjs-middleware-logger](https://www.npmjs.com/package/@nlabs/arkhamjs-middleware-logger) - ArkhamJS console log middleware.

[![Travis](https://img.shields.io/travis/nitrogenlabs/arkhamjs-example-react.svg?style=flat-square)](https://travis-ci.org/nitrogenlabs/arkhamjs-example-react)
[![TypeScript](https://badges.frapsoft.com/typescript/version/typescript-next.svg?v=101)](https://github.com/ellerbrock/typescript-badges/)
[![Issues](http://img.shields.io/github/issues/nitrogenlabs/arkhamjs-example-react.svg?style=flat-square)](https://github.com/nitrogenlabs/arkhamjs-example-react/issues)
[![Gitter](https://img.shields.io/gitter/room/NitrgenLabs/arkhamjs.svg?style=flat-square)](https://gitter.im/NitrogenLabs/arkhamjs)
[![MIT license](http://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](http://opensource.org/licenses/MIT)

## Getting Started

---------------

- Clone the repo and install the necessary node modules:

```bash
$ npm install -g yarn @nlabs/lex  # Install Yarn and Lex
$ yarn                            # Install Node modules listed in ./package.json (may take a while the first time)
```

## Usage

---------------

### `yarn start` also `yarn development`

Runs the webpack build system to compile scripts on the fly. Run local web server. The default webpack dev server can be found at `localhost:5000`. The port can be changed in the config.

### `yarn build`

Compile your application and copy static files for a production environment.

### `yarn lint`

Lint your app with tslint.

### `yarn test`

Runs all unit tests within your app with Jest.

### `yarn production`

Run tests and then, on success, compile your application for a production environment. 

### `yarn dev`

Compile your application for a development environment. Run local development web server. The default web server url is: `localhost:8080`.

## Configuration

---------------

See [@nlabs/lex](https://www.npmjs.com/package/@nlabs/lex) for documentation on custom configuration.

## Structure

---------------

The folder structure provided is only meant to serve as a guide, it is by no means prescriptive. It is something that has worked very well for me and my team, but use only what makes sense to you.

```bash
.
├── coverage                 # Unit test coverage reports
├── dist                     # Compiled files
├── src                      # Application source code
│   ├── actions              # Flux actions
│   ├── components           # React components
│   ├── config               # App Configuration
│   ├── constants            # App constants
│   ├── errors               # Custom errors
│   ├── fonts                # Font files
│   ├── icons                # SVG files
│   ├── img                  # Images
│   ├── services             # Helpers and utilities
│   ├── stores               # Redux store configuration
│   ├── styles               # SCSS styles
│   ├── views                # React components/views that live at a route
│   └── app.tsx              # Application bootstrap and rendering
│   └── index.html           # Initial HTML
```

### Components vs. Views vs. Layouts

**TL;DR:** They're all components.

This distinction may not be important for you, but as an explanation: A **Layout** is something that describes an entire page structure, such as a fixed navigation, viewport, sidebar, and footer. Most applications will probably only have one layout, but keeping these components separate makes their intent clear. **Views** are components that live at routes, and are generally rendered within a **Layout**. What this ends up meaning is that, with this structure, nearly everything inside of **Components** ends up being a dumb component.

## Styles

---------------

All `.css` imports will be run through postcss and cssnext, extracted and compiled during builds. CSS features included are nested classes and SASS-like variables. Styles must be imported either directly within the js file or via another stylesheet which has already been imported.

```js
// JS
import `./component.css`;
```

## Testing

---------------

To add a unit test, simply create a `*.test.ts` or `*.test.tsx` file within the `/src` directory. Jest will look for these for and test these files.

## Troubleshooting

---------------

Nothing yet. Having an issue? Report it and We'll get to it as soon as possible!
