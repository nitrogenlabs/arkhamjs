import './app.css';

import {render} from 'react-dom';

import {AppView} from './views/AppView';

const target = document.getElementById('app');

// Render initial ReactJS code
render(<AppView />, target);
