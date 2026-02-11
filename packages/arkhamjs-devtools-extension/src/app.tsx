import { createRoot } from 'react-dom/client';

import { InspectorView } from './views/InspectorView/InspectorView.js';

const target = document.getElementById('app');

console.log('target', target);

if (target) {
  createRoot(target).render(<InspectorView />);
}
