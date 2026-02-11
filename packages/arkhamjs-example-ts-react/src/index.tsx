import {createRoot} from 'react-dom/client';

import {AppView} from './views/AppView.js';

import './app.css';

const target = document.getElementById('app');

if (target) {
  createRoot(target).render(<AppView />);
}
