import { createRoot } from 'react-dom/client';

import { InspectorView } from './views/InspectorView/InspectorView';

const target = document.getElementById('app');

console.log('target', target);
// Render initial inspector panel
if (target) {
  createRoot(target).render(<InspectorView />);
}
