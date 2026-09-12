/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { VideoWelcomeBook } from './components/video_book/VideoWelcomeBook';
import { CmsProvider } from './context/CmsContext';
import { GuestRedirect } from './pages/GuestRedirect';

function MainApp() {
  return (
    <CmsProvider>
      <div className="min-h-[100dvh] w-full bg-[#18181b] flex items-center justify-center p-0 m-0 select-none">
        <div className="w-full h-full min-h-[100dvh] flex justify-center items-stretch">
          <VideoWelcomeBook initialLanguage="it" />
        </div>
      </div>
    </CmsProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/guest/:token" element={<GuestRedirect />} />
        <Route path="/*" element={<MainApp />} />
      </Routes>
    </BrowserRouter>
  );
}
