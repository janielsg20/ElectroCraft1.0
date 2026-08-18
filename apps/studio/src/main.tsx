import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('ElectroCraft Studio no encontró el root de montaje.');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
