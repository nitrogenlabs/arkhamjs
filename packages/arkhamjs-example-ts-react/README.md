# @nlabs/arkhamjs-example-ts-react

An ArkhamJS React TypeScript example. A simple base application to start you off on your ReactJS project. Uses the following modules:

- [react](https://www.npmjs.com/package/react) - A declarative, efficient, and flexible JavaScript library for building user interfaces.
- [@nlabs/arkhamjs](https://www.npmjs.com/package/arkhamjs) - A clean, simple Flux framework.
- [@nlabs/lex](https://www.npmjs.com/package/@nlabs/lex) - CLI tool to assist in development. Initialize, test, and compile your apps with zero setup. Using [Jest](https://facebook.github.io/jest/), [Webpack](https://webpack.js.org/), and [Typescript](http://www.typescriptlang.org/).
- [@nlabs/arkhamjs-storage-browser](https://www.npmjs.com/package/@nlabs/arkhamjs-storage-browser) - ArkhamJS browser storage. Caches state in session or local storage.
- [@nlabs/arkhamjs-middleware-logger](https://www.npmjs.com/package/@nlabs/arkhamjs-middleware-logger) - ArkhamJS console log middleware.

[![npm version](https://img.shields.io/npm/v/@nlabs/arkhamjs-example-ts-react.svg?style=flat-square)](https://www.npmjs.com/package/@nlabs/arkhamjs-example-ts-react)
[![npm downloads](https://img.shields.io/npm/dm/@nlabs/arkhamjs-example-ts-react.svg?style=flat-square)](https://www.npmjs.com/package/@nlabs/arkhamjs-example-ts-react)
[![Travis](https://img.shields.io/travis/nitrogenlabs/arkhamjs.svg?style=flat-square)](https://travis-ci.org/nitrogenlabs/arkhamjs)
[![Issues](https://img.shields.io/github/issues/nitrogenlabs/arkhamjs.svg?style=flat-square)](https://github.com/nitrogenlabs/arkhamjs/issues)
[![TypeScript](https://badges.frapsoft.com/typescript/version/typescript-next.svg?v=101)](https://github.com/ellerbrock/typescript-badges/)
[![MIT license](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](http://opensource.org/licenses/MIT)
[![Chat](https://img.shields.io/discord/446122412715802649.svg)](https://discord.gg/Ttgev58)

## Getting Started

---------------

- Clone the repo and install the necessary node modules:

```shell
# Install Lex globally
$ npm install -g @nlabs/lex

# Download example app package and install dependencies (may take awhile the first time)
$ lex init exampleApp @nlabs/arkhamjs-example-ts-react -i
```

## Usage

---------------

### `npm run start` also `npm run development`

Runs the webpack build system to compile scripts on the fly. Also runs a local development web server which can be found at `localhost:9000`. The port can be changed in the config.

### `npm run build`

Compile your application and copy static files for a production environment.

### `npm run clean`

Clean your app directory. Removes *coverage*, *node_modules*, *npm-debug.log*, *package-lock.log*.

### `npm run lint`

Lint your app with tslint.

### `npm run test`

Runs all unit tests within the app with Jest.

### `npm run production`

Run tests and then, on success, compile your application for a production environment.

## Configuration

---------------

See [@nlabs/lex](https://www.npmjs.com/package/@nlabs/lex) for documentation on custom configuration.

## Structure

---------------

The folder structure provided is only meant to serve as a guide, it is by no means prescriptive. It is something that has worked very well for me and my team, but use only what makes sense to you.

```shell
.
├── coverage         # Unit test coverage reports
├── dist             # Compiled files ready to be deployed
├── src              # Application source code
│   ├── actions      # ArkhamJS Flux actions
│   ├── components   # React components
│   ├── config       # App configuration
│   ├── constants    # App constants
│   ├── errors       # Custom errors
│   ├── fonts        # Font files
│   ├── icons        # SVG files
│   ├── img          # Images
│   ├── services     # Helpers and utilities
│   ├── stores       # ArkhamJS store configurations
│   ├── styles       # CSS styles
│   ├── views        # React components/views that live at a route
│   ├── app.css      # Entry CSS file
│   ├── index.html   # Entry HTML file
│   └── index.tsx    # Entry JS to bootstrap and render
├── .eslintrc        # ESLint rules
├── .travis.yml      # Travis-CI configuration
├── lex.config.js    # Optional Lex configuration
├── LICENSE          # License details
├── package.json     # Package dependencies and configuration
├── README.md        # Readme file to detail the app and configurations
└── tsconfig.json    # Typescript configuration (only used for definitions)
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
