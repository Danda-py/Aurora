import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  RefreshCw, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ExternalLink, 
  Trash2, 
  Power, 
  ShieldCheck, 
  Copy, 
  Check,
  Globe
} from 'lucide-react';

interface ChannelFeed {
  id: string;
  name: string;
  channelType: 'airbnb' | 'booking' | 'bed_and_breakfast' | 'vrbo' | 'custom';
  url: string;
  enabled: boolean;
  lastSync?: string;
  lastStatus?: 'success' | 'error' | 'pending';
  lastError?: string;
  importedReservationsCount?: number;
}

interface ChannelManagerConfig {
  enabled: boolean;
  autoSyncIntervalMinutes: number;
  channels: ChannelFeed[];
  lastGlobalSync?: string;
}

interface Props {
  onRefreshPasses?: () => Promise<void>;
}

export const ChannelManagerTab: React.FC<Props> = ({ onRefreshPasses }) => {
  const [config, setConfig] = useState<ChannelManagerConfig>({
    enabled: true,
    autoSyncIntervalMinutes: 15,
    channels: []
  });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedAuroraIcal, setCopiedAuroraIcal] = useState(false);

  // New channel modal state
  const [isAddingChannel, setIsAddingChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelType, setNewChannelType] = useState<ChannelFeed['channelType']>('bed_and_breakfast');
  const [newChannelUrl, setNewChannelUrl] = useState('');

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/channels/config');
      const data = await res.json();
      if (data.success && data.config) {
        setConfig(data.config);
      }
    } catch (err: any) {
      console.error('Errore caricamento canali:', err);
      setStatusMessage({ type: 'error', text: 'Impossibile caricare configurazione Channel Manager.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSyncAll = async () => {
    try {
      setSyncing(true);
      setStatusMessage(null);
      const res = await fetch('/api/channels/sync-now', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage({ 
          type: 'success', 
          text: data.message || 'Sincronizzazione completata con successo!' 
        });
        await fetchConfig();
        if (onRefreshPasses) {
          await onRefreshPasses();
        }
      } else {
        throw new Error(data.error || 'Errore durante la sincronizzazione');
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Errore di connessione' });
    } finally {
      setSyncing(false);
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  const handleSaveConfig = async (updatedConfig: ChannelManagerConfig) => {
    try {
      setSaving(true);
      const res = await fetch('/api/channels/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedConfig)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setConfig(data.config);
        setStatusMessage({ type: 'success', text: 'Impostazioni Channel Manager salvate.' });
      } else {
        throw new Error(data.error || 'Errore nel salvataggio');
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  const toggleChannel = async (id: string) => {
    const updatedChannels = config.channels.map(c => 
      c.id === id ? { ...c, enabled: !c.enabled } : c
    );
    const updated = { ...config, channels: updatedChannels };
    setConfig(updated);
    await handleSaveConfig(updated);
  };

  const deleteChannel = async (id: string) => {
    if (!confirm('Rimuovere questo canale iCal?')) return;
    const updatedChannels = config.channels.filter(c => c.id !== id);
    const updated = { ...config, channels: updatedChannels };
    setConfig(updated);
    await handleSaveConfig(updated);
  };

  const handleAddChannelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelUrl.trim()) return;

    const newFeed: ChannelFeed = {
      id: `channel_${Date.now()}`,
      name: newChannelName.trim() || getDefaultChannelName(newChannelType),
      channelType: newChannelType,
      url: newChannelUrl.trim(),
      enabled: true,
      importedReservationsCount: 0
    };

    const updated = {
      ...config,
      channels: [...config.channels, newFeed]
    };

    setIsAddingChannel(false);
    setNewChannelName('');
    setNewChannelUrl('');
    setConfig(updated);
    await handleSaveConfig(updated);
  };

  const getDefaultChannelName = (type: ChannelFeed['channelType']) => {
    switch (type) {
      case 'bed_and_breakfast': return 'Bed-and-Breakfast.it';
      case 'airbnb': return 'Airbnb';
      case 'booking': return 'Booking.com';
      case 'vrbo': return 'Vrbo / Expedia';
      default: return 'Canale iCal';
    }
  };

  const auroraExportUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/api/ical/export.ics` 
    : '/api/ical/export.ics';

  const copyAuroraExport = () => {
    navigator.clipboard.writeText(auroraExportUrl);
    setCopiedAuroraIcal(true);
    setTimeout(() => setCopiedAuroraIcal(false), 2500);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-3 text-gray-500">
        <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
        <span className="text-xs font-mono">Caricamento Channel Manager...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Banner Header */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-teal-500/10 via-emerald-50 to-white border border-teal-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-bold text-gray-900 text-sm sm:text-base">
            <Calendar className="w-5 h-5 text-teal-600" />
            <span>Channel Manager & Sincronizzazione iCal</span>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            Sincronizza automaticamente le prenotazioni di Casa Aurora da Bed-and-Breakfast.it, Airbnb e Booking.com senza usare le email.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSyncAll}
            disabled={syncing}
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Sincronizzazione in corso...' : 'Sincronizza Ora Tutti'}</span>
          </button>
        </div>
      </div>

      {/* Status Feedback Notification */}
      {statusMessage && (
        <div className={`p-4 rounded-xl text-xs flex items-center gap-2.5 font-mono ${
          statusMessage.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
            : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Sync Interval & Status Bar */}
      <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-gray-600 font-mono">
            <Clock className="w-4 h-4 text-gray-400" />
            <span>Ultima Sincronizzazione Globale:</span>
          </div>
          <span className="font-bold text-gray-900 font-mono">
            {config.lastGlobalSync ? new Date(config.lastGlobalSync).toLocaleString('it-IT') : 'Mai eseguita'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-gray-600 font-mono text-[11px]">Sincronizzazione Automatica:</label>
          <select
            value={config.autoSyncIntervalMinutes}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              const updated = { ...config, autoSyncIntervalMinutes: val, enabled: val > 0 };
              setConfig(updated);
              handleSaveConfig(updated);
            }}
            className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-mono text-gray-800 focus:outline-none"
          >
            <option value={10}>Ogni 10 minuti</option>
            <option value={15}>Ogni 15 minuti (Consigliato)</option>
            <option value={30}>Ogni 30 minuti</option>
            <option value={60}>Ogni 60 minuti</option>
            <option value={0}>Disabilitata (Solo manuale)</option>
          </select>
        </div>
      </div>

      {/* Channels List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-mono font-bold text-gray-500 uppercase tracking-wider">
            Canali iCal Collegati ({config.channels.length})
          </h4>
          <button
            type="button"
            onClick={() => setIsAddingChannel(true)}
            className="px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Collega Nuovo Canale</span>
          </button>
        </div>

        {config.channels.length === 0 ? (
          <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-200 text-gray-500 text-xs space-y-2">
            <p>Nessun canale iCal attualmente configurato.</p>
            <p className="text-gray-400">Clicca su "Collega Nuovo Canale" per inserire il link iCal di Bed-and-Breakfast.it o Airbnb.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {config.channels.map((ch) => (
              <div
                key={ch.id}
                className={`p-4 rounded-2xl border transition ${
                  ch.enabled ? 'bg-white border-gray-200' : 'bg-gray-50/70 border-gray-200 opacity-60'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-gray-900">{ch.name}</span>
                      <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full ${
                        ch.channelType === 'bed_and_breakfast' ? 'bg-amber-100 text-amber-800' :
                        ch.channelType === 'airbnb' ? 'bg-rose-100 text-rose-800' :
                        ch.channelType === 'booking' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {ch.channelType.replace(/_/g, ' ')}
                      </span>
                      {ch.lastStatus === 'success' && (
                        <span className="flex items-center gap-1 text-[11px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          <Check className="w-3 h-3" />
                          <span>Attivo</span>
                        </span>
                      )}
                      {ch.lastStatus === 'error' && (
                        <span className="flex items-center gap-1 text-[11px] text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                          <AlertCircle className="w-3 h-3" />
                          <span>Errore</span>
                        </span>
                      )}
                    </div>

                    <div className="text-xs font-mono text-gray-500 truncate max-w-xl">
                      {ch.url || 'Nessun URL inserito'}
                    </div>

                    <div className="flex items-center gap-4 text-[11px] text-gray-500 font-mono pt-1">
                      <span>Prenotazioni importate: <strong className="text-gray-900">{ch.importedReservationsCount ?? 0}</strong></span>
                      {ch.lastSync && (
                        <span>Ultimo sync: {new Date(ch.lastSync).toLocaleTimeString('it-IT')}</span>
                      )}
                      {ch.lastError && (
                        <span className="text-rose-600 truncate max-w-sm">⚠️ {ch.lastError}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleChannel(ch.id)}
                      className={`p-2 rounded-xl text-xs font-mono transition cursor-pointer ${
                        ch.enabled 
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' 
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                      title={ch.enabled ? 'Disattiva canale' : 'Attiva canale'}
                    >
                      <Power className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteChannel(ch.id)}
                      className="p-2 rounded-xl text-xs font-mono text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      title="Elimina canale"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Add Channel */}
      {isAddingChannel && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-xl border border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-gray-900">Collega Feed iCal Channel Manager</h3>
              <button
                type="button"
                onClick={() => setIsAddingChannel(false)}
                className="text-gray-400 hover:text-gray-600 text-xs font-mono"
              >
                ✕ Chiudi
              </button>
            </div>

            <form onSubmit={handleAddChannelSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-700 font-mono mb-1">Piattaforma / Canale</label>
                <select
                  value={newChannelType}
                  onChange={(e) => {
                    const t = e.target.value as any;
                    setNewChannelType(t);
                    setNewChannelName(getDefaultChannelName(t));
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white font-mono"
                >
                  <option value="bed_and_breakfast">Bed-and-Breakfast.it</option>
                  <option value="airbnb">Airbnb</option>
                  <option value="booking">Booking.com</option>
                  <option value="vrbo">Vrbo / Expedia</option>
                  <option value="custom">Altro (iCal personalizzato)</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-mono mb-1">Nome Identificativo</label>
                <input
                  type="text"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  placeholder="Es. Bed-and-Breakfast.it Aurora"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-mono mb-1">URL Calendario iCal (.ics o webcal://)</label>
                <input
                  type="url"
                  required
                  value={newChannelUrl}
                  onChange={(e) => setNewChannelUrl(e.target.value)}
                  placeholder="https://www.bed-and-breakfast.it/ical/..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white font-mono text-xs"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Incolla il link di sincronizzazione esportato dal portale della prenotazione.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingChannel(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-mono"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold"
                >
                  Aggiungi Canale
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Export Aurora iCal Feed for Other Portals */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
        <div className="flex items-center gap-2 font-bold text-gray-900 text-xs sm:text-sm">
          <Globe className="w-4 h-4 text-indigo-600" />
          <span>Esporta Calendario di Casa Aurora (Link iCal per i portali)</span>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">
          Usa questo link nei tuoi account Airbnb, Booking o Bed-and-Breakfast per sincronizzare all'esterno le date occupate di Casa Aurora ed evitare overbooking:
        </p>
        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={auroraExportUrl}
            className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 font-mono text-xs select-all"
          />
          <button
            type="button"
            onClick={copyAuroraExport}
            className="px-3 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-mono text-xs flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
          >
            {copiedAuroraIcal ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedAuroraIcal ? 'Copiato!' : 'Copia Link'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
