/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// See https://docusaurus.io/docs/site-config.html for all the possible
// site configuration options.

const siteConfig = {
  baseUrl: '/',
  colors: {
    primaryColor: '#824CB2',
    secondaryColor: '#bb8eff'
  },
  copyright: `Copyright © ${new Date().getFullYear()} Nitrogen Labs, Inc.`,
  customDocsPath: 'packages',
  favicon: 'img/favicon.png',
  fonts: {
    siteFont: ['Open Sans', 'Helvetica']
  },
  footerIcon: 'img/docusaurus.svg',
  headerIcon: 'img/docusaurus.svg',
  headerLinks: [
    {label: 'Quick Start', page: 'gettingStarted'},
    {doc: 'arkhamjs', label: 'Test'},
    {label: 'API', page: 'cli'},
    {label: 'Examples', page: 'examples'},
    {label: 'Storage', page: 'storage'},
    {label: 'Plugins', page: 'plugins'},
    {label: 'Middleware', page: 'middleware'},
    {label: 'Help', page: 'help'}
  ],
  highlight: {
    theme: 'atom-one-dark'
  },
  ogImage: 'img/docusaurus.png',
  onPageNav: 'separate',
  organizationName: 'nitrogenlabs',
  projectName: 'arkhamjs',
  scripts: ['https://buttons.github.io/buttons.js'],
  tagline: 'Flux state management framework',
  title: 'ArkhamJS',
  twitterImage: 'img/docusaurus.png',
  url: 'https://arkhamjs.io'
};

module.exports = siteConfig;
