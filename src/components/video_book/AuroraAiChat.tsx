import React, { useEffect, useRef, useState } from 'react';
import { Bot, LoaderCircle, Paperclip, Send, X } from 'lucide-react';
import { GuestPass } from '../../types';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  imagePreview?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  pass: GuestPass;
}

const welcomeMessage: ChatMessage = {
  role: 'model',
  text: 'Ciao, sono Aurora AI. Posso aiutarti con l appartamento, Morbegno e le esperienze in Valtellina.'
};

const MAX_IMAGE_BYTES = 6 * 1024 * 1024;

export const AuroraAiChat: React.FC<Props> = ({ isOpen, onClose, pass }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
  const [question, setQuestion] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [attachedImage, setAttachedImage] = useState<{ dataUrl: string; mimeType: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isSending]);

  // Lock the page scroll behind the modal so gestures only scroll the chat.
  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!/^image\/(png|jpe?g|webp|heic|heif)$/i.test(file.type)) {
      setError('Formato immagine non supportato. Usa JPG, PNG, WEBP o HEIC.');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError('La foto e troppo grande. Allega un immagine sotto i 6MB.');
      return;
    }
    setError('');
    const reader = new FileReader();
    reader.onload = () => {
      setAttachedImage({ dataUrl: reader.result as string, mimeType: file.type });
    };
    reader.readAsDataURL(file);
  };

  const submitQuestion = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = question.trim();
    if ((!text && !attachedImage) || isSending) return;

    const nextMessages = [...messages, { role: 'user' as const, text, imagePreview: attachedImage?.dataUrl }];
    setMessages(nextMessages);
    setQuestion('');
    const imageToSend = attachedImage;
    setAttachedImage(null);
    setError('');
    setIsSending(true);

    try {
      const response = await fetch('/api/aurora-ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestToken: pass.token,
          question: text,
          history: messages.slice(1),
          image: imageToSend?.dataUrl,
          imageMimeType: imageToSend?.mimeType
        })
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Impossibile ricevere una risposta.');
      setMessages(currentMessages => [...currentMessages, { role: 'model', text: data.answer }]);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Aurora AI non e disponibile al momento.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60 p-3 backdrop-blur-sm sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="aurora-ai-title">
      <section className="flex h-[min(42rem,calc(100dvh-1.5rem))] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/15 bg-[#0d1518] shadow-2xl sm:h-[min(42rem,calc(100dvh-3rem))]">
        <header className="flex items-center justify-between border-b border-white/10 px-4 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-[#62e6bd] text-[#07110d]"><Bot className="h-5 w-5" /></div>
            <div><h2 id="aurora-ai-title" className="m-0 text-sm font-bold text-white">Aurora AI</h2><p className="m-0 text-xs text-white/55">Concierge digitale</p></div>
          </div>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white" aria-label="Chiudi Aurora AI"><X className="h-5 w-5" /></button>
        </header>
        <div className="flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4">
          {messages.map((message, index) => (
            <div key={`${message.role}-${index}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${message.role === 'user' ? 'rounded-br-md bg-[#62e6bd] text-[#07110d]' : 'rounded-bl-md bg-white/10 text-white/90'}`}>
                {message.imagePreview && (
                  <img src={message.imagePreview} alt="Foto allegata" className="mb-2 max-h-48 w-full rounded-xl object-cover" />
                )}
                {message.text && <p className="m-0 whitespace-pre-wrap">{message.text}</p>}
              </div>
            </div>
          ))}
          {isSending && <div className="flex justify-start"><div className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-white/10 px-3.5 py-2.5 text-sm text-white/70"><LoaderCircle className="h-4 w-4 animate-spin" />Aurora AI sta pensando</div></div>}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={submitQuestion} className="border-t border-white/10 p-3">
          {error && <p className="mb-2 text-xs text-rose-300">{error}</p>}
          {attachedImage && (
            <div className="mb-2 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-2">
              <img src={attachedImage.dataUrl} alt="Anteprima foto" className="h-12 w-12 rounded-lg object-cover" />
              <span className="flex-1 text-xs text-white/60">Foto pronta per l'invio</span>
              <button type="button" onClick={() => setAttachedImage(null)} className="rounded-full p-1 text-white/50 hover:bg-white/10 hover:text-white" aria-label="Rimuovi foto">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          <div className="flex items-end gap-2 rounded-xl border border-white/10 bg-white/5 p-1.5 focus-within:border-[#62e6bd]/60">
            <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/heic,image/heif" onChange={handleFileSelect} className="hidden" />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-white/60 transition hover:bg-white/10 hover:text-white"
              aria-label="Allega foto"
            >
              <Paperclip className="h-4 w-4" />
            </button>
            <textarea value={question} onChange={event => setQuestion(event.target.value)} maxLength={1000} rows={1} placeholder="Chiedi di Morbegno, esperienze o Aurora" className="max-h-28 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-white/40" />
            <button type="submit" disabled={(!question.trim() && !attachedImage) || isSending} className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#62e6bd] text-[#07110d] transition hover:bg-[#93f4d4] disabled:cursor-not-allowed disabled:opacity-40" aria-label="Invia domanda"><Send className="h-4 w-4" /></button>
          </div>
        </form>
      </section>
    </div>
  );
};