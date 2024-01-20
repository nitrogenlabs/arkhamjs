import './app.css';

import * as ReactDOM from 'react-dom';

import {AppView} from './views/AppView';

const target = document.getElementById('app');

// Render initial ReactJS code
ReactDOM.render(<AppView />, target);
