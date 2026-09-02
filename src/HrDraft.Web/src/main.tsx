import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

// Order matters: tokens define the values every later sheet reads.
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/responsive.css';

import { App } from './App';

const container = document.getElementById('root');
if (!container) throw new Error('Root element #root not found in index.html');

createRoot(container).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
