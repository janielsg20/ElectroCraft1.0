import { ElectroCraftI18nProvider, initializeElectroCraftI18n } from '@electrocraft/i18n';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('ElectroCraft Studio no encontró el root de montaje.');
}

async function bootstrapStudio(root: HTMLElement) {
  await initializeElectroCraftI18n();
  createRoot(root).render(
    <StrictMode>
      <ElectroCraftI18nProvider>
        <App />
      </ElectroCraftI18nProvider>
    </StrictMode>,
  );
}

void bootstrapStudio(rootElement);
