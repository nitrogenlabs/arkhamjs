import * as React from 'react';
import * as ReactDOM from 'react-dom';

import {InspectorView} from './views/InspectorView/InspectorView';

const target = document.getElementById('app');

console.log('target', target);
// Render initial inspector panel
ReactDOM.render(<InspectorView />, target);
