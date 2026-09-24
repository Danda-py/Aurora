/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { VideoWelcomeBook } from './components/video_book/VideoWelcomeBook';
import { GuestRedirect } from './pages/GuestRedirect';
import { HostPortal } from './pages/host-portal/HostPortal';
import { VisualCMSPage } from './pages/VisualCMSPage';
import { EditModeProvider } from './components/visual-cms/EditModeContext';

/**
 * PWA ospiti in produzione: gli elementi della home sono avvolti da
 * EditableElement (senza interattività); il provider read-only carica gli
 * override salvati dall'host (testi, stili, foto, orari) e li applica.
 */
function MainApp() {
  return (
    <EditModeProvider isEditMode={false}>
      <div className="min-h-[100dvh] w-full bg-black flex items-center justify-center p-0 m-0 select-none">
        <div className="w-full h-full min-h-[100dvh] flex justify-center items-stretch">
          <VideoWelcomeBook initialLanguage="it" />
        </div>
      </div>
    </EditModeProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/host-portal/*" element={<HostPortal />} />
        <Route path="/host-portal-react/*" element={<HostPortal />} />
        <Route path="/visual-cms" element={<VisualCMSPage />} />
        <Route path="/guest/:token" element={<GuestRedirect />} />
        <Route path="/*" element={<MainApp />} />
      </Routes>
    </BrowserRouter>
  );
}
