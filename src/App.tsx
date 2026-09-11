/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { VideoWelcomeBook } from './components/video_book/VideoWelcomeBook';
import { CmsProvider } from './context/CmsContext';

function GuestAccessGate({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<'checking' | 'allowed' | 'denied'>('checking');

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('pass');
    if (!token) {
      setStatus('denied');
      return;
    }
    fetch(`/api/guest/pass?token=${encodeURIComponent(token)}`, { cache: 'no-store' })
      .then(response => {
        setStatus(response.ok ? 'allowed' : 'denied');
      })
      .catch(() => setStatus('denied'));
  }, []);

  if (status === 'checking') {
    return <div className="min-h-[100dvh] bg-[#070a0e]" aria-label="Verifica accesso" />;
  }
  if (status === 'denied') {
    return (
      <main className="min-h-[100dvh] bg-[#070a0e] flex items-center justify-center px-6 text-center text-slate-100">
        <section className="max-w-sm space-y-3">
          <h1 className="text-xl font-semibold">Accesso riservato agli ospiti</h1>
          <p className="text-sm text-slate-400">Per entrare usa il link personale e temporaneo ricevuto dall'host.</p>
        </section>
      </main>
    );
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <GuestAccessGate>
      <CmsProvider>
        <div className="min-h-[100dvh] w-full bg-[#18181b] flex items-center justify-center p-0 m-0 select-none">
          <div className="w-full h-full min-h-[100dvh] flex justify-center items-stretch">
            <VideoWelcomeBook initialLanguage="it" />
          </div>
        </div>
      </CmsProvider>
      <Analytics />
    </GuestAccessGate>
  );
}
