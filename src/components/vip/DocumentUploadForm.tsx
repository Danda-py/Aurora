import React, { useState } from 'react';
import { GuestPass, Language } from '../../types';
import Tesseract from 'tesseract.js';
import { Camera, FileText, Check, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

export const DocumentUploadForm: React.FC<{ pass: GuestPass; language: Language; onSaveSuccess: (p: GuestPass) => void; onCancel?: () => void }> = ({ pass, language, onSaveSuccess, onCancel }) => {
  const isIt = language === 'it';
  const [docType, setDocType] = useState<'identita' | 'passaporto'>('identita');
  const [state, setState] = useState({ isScanning: false, scanProgress: 0, status: 'idle', isSubmitting: false, error: null as string | null, success: false });
  const [form, setForm] = useState({ documentType: 'identita' as any, documentNumber: '', name: pass.guestName || '', surname: pass.guestSurname || '', birthDate: '', nationality: 'ITALIANA' });

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setState(s => ({ ...s, isScanning: true, scanProgress: 0, error: null }));
    try {
      const res = await Tesseract.recognize(file, 'ita+eng', {
        logger: m => m.status === 'recognizing text' && setState(s => ({ ...s, scanProgress: Math.round(m.progress * 100) }))
      });
      const text = res.data.text;
      let docNum = '', birthDate = '', name = pass.guestName || '', surname = pass.guestSurname || '';
      
      const cie = text.match(/[A-Z]{2}\s?\d{5}\s?[A-Z]{2}/i);
      const passp = text.match(/[A-Z]{2}\s?\d{7}/i);
      if (docType === 'passaporto' && passp) docNum = passp[0].toUpperCase().replace(/\s/g, '');
      else if (cie) docNum = cie[0].toUpperCase().replace(/\s/g, '');

      const dateM = text.match(/(\d{2})[\/\-\.](\d{2})[\/\-\.](\d{4})/);
      if (dateM) birthDate = `${dateM[3]}-${dateM[2]}-${dateM[1]}`;

      const lines = text.split('\n').map(l => l.trim().toUpperCase()).filter(Boolean);
      lines.forEach((line, idx) => {
        if ((line.includes('COGNOME') || line.includes('SURNAME')) && lines[idx+1]) surname = lines[idx+1].replace(/[^A-Z\s]/g, '');
        if ((line.includes('NOME') || line.includes('GIVEN')) && lines[idx+1]) name = lines[idx+1].replace(/[^A-Z\s]/g, '');
      });

      setForm(f => ({ ...f, documentNumber: docNum || f.documentNumber, name: name || f.name, surname: surname || f.surname, birthDate: birthDate || f.birthDate }));
      setState(s => ({ ...s, status: 'success' }));
    } catch {
      setState(s => ({ ...s, status: 'success' }));
    } finally {
      setState(s => ({ ...s, isScanning: false }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.surname || !form.documentNumber || !form.birthDate) {
      setState(s => ({ ...s, error: isIt ? "Tutti i campi sono obbligatori." : "All fields are required." }));
      return;
    }
    setState(s => ({ ...s, isSubmitting: true, error: null }));
    try {
      const res = await fetch('/api/guest/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: pass.token, documentsData: [form] })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);
      setState(s => ({ ...s, success: true }));
      setTimeout(() => onSaveSuccess(data.pass), 2000);
    } catch (err: any) {
      setState(s => ({ ...s, error: err.message || 'Error' }));
    } finally {
      setState(s => ({ ...s, isSubmitting: false }));
    }
  };

  const inputC = "w-full p-2.5 rounded-xl bg-[#131d27] border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500";
  const labelC = "text-[10px] font-mono text-slate-400 uppercase block";

  if (state.success) return (
    <div className="aurora-glass-card p-6 text-center space-y-4 animate-scale-up">
      <CheckCircle2 className="w-12 h-12 text-[#62e6bd] mx-auto animate-pulse" />
      <h3 className="text-base font-bold text-white">{isIt ? "Registrato!" : "Successfully saved!"}</h3>
    </div>
  );

  return (
    <div className="aurora-glass-card p-4 sm:p-5 space-y-4 text-left">
      <div className="text-center space-y-1">
        <h3 className="text-base font-bold text-white">{isIt ? "Registrazione Documento" : "ID Registration"}</h3>
        <p className="text-[11px] text-slate-400 max-w-sm mx-auto leading-relaxed">{isIt ? "La legge italiana richiede l'identificazione degli ospiti prima dell'arrivo." : "Italian law requires guest registration before arrival."}</p>
      </div>

      {state.status === 'idle' && !state.isScanning ? (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-2 gap-2">
            {(['identita', 'passaporto'] as const).map(type => (
              <button key={type} onClick={() => { setDocType(type); setForm(f => ({ ...f, documentType: type })); }} className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${docType === type ? 'bg-emerald-500/15 border-emerald-500 text-white' : 'bg-white/[0.03] border-white/10 text-slate-400'}`}>
                <FileText className="w-3.5 h-3.5" />
                <span>{type === 'identita' ? (isIt ? "Carta d'Identità" : "ID Card") : (isIt ? "Passaporto" : "Passport")}</span>
              </button>
            ))}
          </div>

          <label className="w-full py-5 px-4 rounded-2xl bg-white/[0.03] border border-dashed border-white/10 hover:border-emerald-500/30 flex flex-col items-center justify-center gap-2 cursor-pointer transition">
            <Camera className="w-6 h-6 text-emerald-400" />
            <span className="text-xs font-bold text-white">{isIt ? "Scatta Foto Documento" : "Snap ID Photo"}</span>
            <input type="file" accept="image/*" capture="environment" onChange={handleFile} className="hidden" />
          </label>
          <div className="text-center">
            <button onClick={() => setState(s => ({ ...s, status: 'success' }))} className="text-xs text-emerald-400 underline font-mono cursor-pointer font-bold">{isIt ? "Compila Manualmente" : "Fill Manually"}</button>
          </div>
        </div>
      ) : state.isScanning ? (
        <div className="p-6 text-center space-y-3">
          <Loader2 className="w-7 h-7 text-emerald-400 animate-spin mx-auto" />
          <p className="text-xs font-bold text-white">{isIt ? "Analisi in corso..." : "Analyzing..."} ({state.scanProgress}%)</p>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-4 animate-fade-in">
          <p className="text-[11px] text-emerald-300 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 leading-relaxed">{isIt ? "Verifica e correggi i dati estratti." : "Verify and correct the extracted data."}</p>

          {state.error && <div className="p-2.5 rounded-xl bg-red-950/20 border border-red-500/30 text-rose-300 text-xs">{state.error}</div>}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className={labelC}>{isIt ? "Cognome *" : "Surname *"}</label>
              <input type="text" required value={form.surname} onChange={e => setForm({ ...form, surname: e.target.value.toUpperCase() })} className={inputC} />
            </div>
            <div className="space-y-1">
              <label className={labelC}>{isIt ? "Nome *" : "Name *"}</label>
              <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value.toUpperCase() })} className={inputC} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className={labelC}>{isIt ? "Num. Documento *" : "Doc Number *"}</label>
              <input type="text" required value={form.documentNumber} onChange={e => setForm({ ...form, documentNumber: e.target.value.toUpperCase() })} className={`${inputC} font-mono`} />
            </div>
            <div className="space-y-1">
              <label className={labelC}>{isIt ? "Data Nascita *" : "Birth Date *"}</label>
              <input type="date" required value={form.birthDate} onChange={e => setForm({ ...form, birthDate: e.target.value })} className={inputC} />
            </div>
          </div>

          <div className="space-y-1">
            <label className={labelC}>{isIt ? "Nazionalità *" : "Nationality *"}</label>
            <input type="text" required value={form.nationality} onChange={e => setForm({ ...form, nationality: e.target.value.toUpperCase() })} className={inputC} />
          </div>

          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={state.isSubmitting} className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer">
              {state.isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              <span>{isIt ? "Salva e Conferma" : "Confirm & Save"}</span>
            </button>
            {onCancel && <button type="button" onClick={onCancel} className="py-3 px-4 rounded-xl bg-white/[0.04] text-slate-400 font-bold text-xs border border-white/5 cursor-pointer">{isIt ? "Annulla" : "Cancel"}</button>}
          </div>
        </form>
      )}
    </div>
  );
};