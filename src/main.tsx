import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register PWA service worker with auto-reload upon updates
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('Nuovo aggiornamento disponibile per la guida Aurora in Valtellina. Ricaricare?')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('Aurora in Valtellina PWA pronta per l\'utilizzo offline!');
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
