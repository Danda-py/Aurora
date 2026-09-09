import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  PieChart as PieIcon, 
  Calendar, 
  Download, 
  Plus, 
  Check, 
  Calculator, 
  Building2,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { Language } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const HostFinanceModal: React.FC<Props> = ({ isOpen, onClose, language }) => {
  const [selectedMonth, setSelectedMonth] = useState('Ottobre 2024');
  const [avgNightRate, setAvgNightRate] = useState(95);
  const [occupancyDays, setOccupancyDays] = useState(22);
  const [cleaningFee, setCleaningFee] = useState(50);
  const [cleaningCount, setCleaningCount] = useState(6);
  const [fixedExpenses, setFixedExpenses] = useState(280); // Condominium, Wi-Fi, insurance, utilities
  const [taxRate, setTaxRate] = useState(21); // Cedolare secca 21%

  if (!isOpen) return null;

  // Monthly calculated figures
  const grossRevenue = (avgNightRate * occupancyDays) + (cleaningFee * cleaningCount);
  const cleaningExpense = cleaningFee * cleaningCount;
  const totalOperatingExpenses = fixedExpenses + cleaningExpense;
  const taxableIncome = grossRevenue - cleaningExpense;
  const taxes = Math.round((taxableIncome * taxRate) / 100);
  const netProfit = grossRevenue - totalOperatingExpenses - taxes;
  const occupancyPercent = Math.round((occupancyDays / 30) * 100);

  // 6-Month Trend Data
  const monthlyData = [
    { month: 'Mag', entrate: 2150, uscite: 620, guadagno: 1530 },
    { month: 'Giu', entrate: 2680, uscite: 710, guadagno: 1970 },
    { month: 'Lug', entrate: 3450, uscite: 890, guadagno: 2560 },
    { month: 'Ago', entrate: 3820, uscite: 940, guadagno: 2880 },
    { month: 'Set', entrate: 2890, uscite: 740, guadagno: 2150 },
    { month: 'Ott', entrate: grossRevenue, uscite: totalOperatingExpenses + taxes, guadagno: netProfit },
  ];

  const maxVal = Math.max(...monthlyData.map(d => d.entrate), 4000);

  const exportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Mese,Entrate Lorde,Spese Operative,Tasse,Guadagno Netto,Occupazione %\n"
      + monthlyData.map(e => `${e.month},€${e.entrate},€${e.uscite},€${Math.round(e.entrate * 0.18)},€${e.guadagno},${occupancyPercent}%`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Aurora_Conti_Host_${selectedMonth.replace(' ', '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Pie chart angles
  const totalPie = Math.max(1, netProfit + totalOperatingExpenses + taxes);
  const profitPct = Math.max(0, Math.round((netProfit / totalPie) * 100));
  const expPct = Math.round((totalOperatingExpenses / totalPie) * 100);
  const taxPct = Math.round((taxes / totalPie) * 100);

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-[#fcfaf7] rounded-3xl max-w-4xl w-full p-5 sm:p-7 border border-[#e8dfcf] shadow-2xl text-slate-900 space-y-6 my-auto max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e8dfcf] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-md border border-amber-300">
                Host Tool • Foglio Excel & Sheets
              </span>
              <span className="text-xs font-semibold text-slate-500">Da 1 a 50 case</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 mt-1">
              Conti della Tua Attività Sotto Controllo
            </h2>
            <p className="text-xs text-slate-600">
              Entrate, uscite, tasse e guadagni netti calcolati in automatico per Appartamento Aurora.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="py-2 px-3 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-teal-200" />
              <span>Esporta Foglio CSV</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-white border border-[#e8dfcf] shadow-xs">
            <span className="text-[11px] font-bold text-slate-500 block">Entrate Totali (Lordo)</span>
            <span className="text-xl sm:text-2xl font-black font-serif text-teal-800 mt-1 block">
              € {grossRevenue.toLocaleString('it-IT')}
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 block">
              +12.4% vs mese scorso
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#e8dfcf] shadow-xs">
            <span className="text-[11px] font-bold text-slate-500 block">Spese Operative</span>
            <span className="text-xl sm:text-2xl font-black font-serif text-amber-700 mt-1 block">
              € {totalOperatingExpenses.toLocaleString('it-IT')}
            </span>
            <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">
              Pulizie + Utenze fisse
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#e8dfcf] shadow-xs">
            <span className="text-[11px] font-bold text-slate-500 block">Tasse Stimate (21%)</span>
            <span className="text-xl sm:text-2xl font-black font-serif text-rose-700 mt-1 block">
              € {taxes.toLocaleString('it-IT')}
            </span>
            <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">
              Cedolare secca
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-900 to-slate-900 text-white shadow-md">
            <span className="text-[11px] font-bold text-teal-200 block">Guadagno Netto Reale</span>
            <span className="text-xl sm:text-2xl font-black font-serif text-amber-300 mt-1 block">
              € {netProfit.toLocaleString('it-IT')}
            </span>
            <span className="text-[10px] text-teal-100 font-semibold mt-0.5 block">
              Occupazione: {occupancyPercent}% ({occupancyDays} notti)
            </span>
          </div>
        </div>

        {/* Visual Charts: Entrate vs Uscite & Donut Ripartizione */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          {/* Bar chart (Pure SVG) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#e8dfcf] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-bold font-serif text-slate-900">
                Entrate vs Uscite (Ultimi 6 Mesi)
              </h3>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="flex items-center gap-1 font-semibold text-teal-800">
                  <span className="w-2.5 h-2.5 rounded bg-teal-800" /> Entrate
                </span>
                <span className="flex items-center gap-1 font-semibold text-amber-600">
                  <span className="w-2.5 h-2.5 rounded bg-amber-500" /> Uscite
                </span>
              </div>
            </div>
            
            <div className="h-52 w-full pt-4 flex items-end justify-between gap-2 border-b border-slate-200 pb-2">
              {monthlyData.map((d, i) => {
                const hEntrate = Math.round((d.entrate / maxVal) * 100);
                const hUscite = Math.round((d.uscite / maxVal) * 100);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex items-end justify-center gap-1 h-36">
                      <div 
                        style={{ height: `${hEntrate}%` }} 
                        className="w-1/2 bg-teal-700 hover:bg-teal-800 rounded-t-sm transition-all duration-300 relative group"
                        title={`Entrate ${d.month}: €${d.entrate}`}
                      />
                      <div 
                        style={{ height: `${hUscite}%` }} 
                        className="w-1/2 bg-amber-500 hover:bg-amber-600 rounded-t-sm transition-all duration-300 relative group"
                        title={`Uscite ${d.month}: €${d.uscite}`}
                      />
                    </div>
                    <span className="text-[11px] font-medium text-slate-600 mt-1">{d.month}</span>
                    <span className="text-[9px] font-mono text-slate-400">€{d.guadagno}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Donut Chart (Pure SVG) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#e8dfcf] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-bold font-serif text-slate-900">
                Riepilogo: Ripartizione Ricavi Mese
              </h3>
              <span className="text-[10px] bg-teal-50 text-teal-800 font-bold px-2 py-0.5 rounded border border-teal-200">
                {selectedMonth}
              </span>
            </div>

            <div className="h-52 w-full flex items-center justify-around gap-4">
              
              {/* Custom SVG Donut */}
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  {/* Background circle */}
                  <circle cx="18" cy="18" r="14" fill="transparent" stroke="#f1ece3" strokeWidth="4.5" />
                  
                  {/* Segment 1: Net Profit (Teal) */}
                  <circle 
                    cx="18" cy="18" r="14" fill="transparent" stroke="#0f766e" strokeWidth="4.5" 
                    strokeDasharray={`${profitPct * 0.88} 100`} 
                    strokeDashoffset="0"
                  />
                  
                  {/* Segment 2: Operating Expenses (Amber) */}
                  <circle 
                    cx="18" cy="18" r="14" fill="transparent" stroke="#f59e0b" strokeWidth="4.5" 
                    strokeDasharray={`${expPct * 0.88} 100`} 
                    strokeDashoffset={`-${profitPct * 0.88}`}
                  />
                  
                  {/* Segment 3: Taxes (Red) */}
                  <circle 
                    cx="18" cy="18" r="14" fill="transparent" stroke="#ef4444" strokeWidth="4.5" 
                    strokeDasharray={`${taxPct * 0.88} 100`} 
                    strokeDashoffset={`-${(profitPct + expPct) * 0.88}`}
                  />
                </svg>

                <div className="absolute text-center">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Netto</span>
                  <span className="text-sm font-black text-teal-800">{profitPct}%</span>
                </div>
              </div>

              {/* Legend with exact amounts */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-teal-700" />
                  <div>
                    <span className="font-bold text-slate-900 block">Guadagno Netto ({profitPct}%)</span>
                    <span className="text-[11px] font-mono text-slate-500">€ {netProfit.toLocaleString('it-IT')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500" />
                  <div>
                    <span className="font-bold text-slate-900 block">Spese Operative ({expPct}%)</span>
                    <span className="text-[11px] font-mono text-slate-500">€ {totalOperatingExpenses.toLocaleString('it-IT')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500" />
                  <div>
                    <span className="font-bold text-slate-900 block">Tasse ({taxPct}%)</span>
                    <span className="text-[11px] font-mono text-slate-500">€ {taxes.toLocaleString('it-IT')}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Interactive Simulator / Sliders to compute real earnings */}
        <div className="p-5 rounded-2xl bg-[#f4eee4] border border-[#e5dcce] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-amber-800" />
              <h4 className="font-bold text-xs sm:text-sm text-slate-900 font-serif">
                Simulatore & Calcolatore Redditività
              </h4>
            </div>
            <span className="text-[11px] text-slate-600 font-medium">Modifica i valori per ricalcolare</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Slider 1: Prezzo medio per notte */}
            <div className="space-y-1.5 bg-white p-3.5 rounded-xl border border-[#e8dfcf]">
              <div className="flex justify-between text-xs font-bold text-slate-800">
                <span>Prezzo Notte (ADR):</span>
                <span className="text-teal-800">€ {avgNightRate}</span>
              </div>
              <input
                type="range"
                min="50"
                max="250"
                step="5"
                value={avgNightRate}
                onChange={(e) => setAvgNightRate(Number(e.target.value))}
                className="w-full accent-teal-800 cursor-pointer"
              />
            </div>

            {/* Slider 2: Notti occupate */}
            <div className="space-y-1.5 bg-white p-3.5 rounded-xl border border-[#e8dfcf]">
              <div className="flex justify-between text-xs font-bold text-slate-800">
                <span>Notti Prenotate / Mese:</span>
                <span className="text-teal-800">{occupancyDays} notti ({occupancyPercent}%)</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                value={occupancyDays}
                onChange={(e) => setOccupancyDays(Number(e.target.value))}
                className="w-full accent-teal-800 cursor-pointer"
              />
            </div>

            {/* Slider 3: Spese fisse mensili */}
            <div className="space-y-1.5 bg-white p-3.5 rounded-xl border border-[#e8dfcf]">
              <div className="flex justify-between text-xs font-bold text-slate-800">
                <span>Spese Fisse / Mese:</span>
                <span className="text-amber-800">€ {fixedExpenses}</span>
              </div>
              <input
                type="range"
                min="100"
                max="800"
                step="20"
                value={fixedExpenses}
                onChange={(e) => setFixedExpenses(Number(e.target.value))}
                className="w-full accent-amber-800 cursor-pointer"
              />
            </div>

          </div>
        </div>

        {/* Footer info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 pt-2 border-t border-[#e8dfcf]">
          <p>
            Modello finanziario compatibile con Google Sheets ed Excel. Dati memorizzati in locale.
          </p>
          <button
            onClick={onClose}
            className="self-end sm:self-auto py-2 px-6 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition cursor-pointer"
          >
            Chiudi
          </button>
        </div>

      </div>
    </div>
  );
};
