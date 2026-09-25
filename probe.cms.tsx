/**
 * Probe temporaneo: renderizza il Visual CMS Builder con react-dom/server
 * per far emergere l'errore di runtime che manda la pagina in nero.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { VisualCMSBuilder } from './src/components/visual-cms/VisualCMSBuilder';

try {
  const html = renderToStaticMarkup(<VisualCMSBuilder />);
  console.log('RENDER OK, length =', html.length);
  console.log('--- primi 500 char ---');
  console.log(html.slice(0, 500));
} catch (e) {
  console.error('=== CRASH DURANTE IL RENDER ===');
  console.error(e);
}
