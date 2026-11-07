import React from 'react';
import { QuinielaView } from './components/quiniela/QuinielaView';
import { ShieldCheck, Trophy } from 'lucide-react';

export const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans">
      {/* App Header */}
      <header className="sticky top-0 z-30 bg-[#0b0e17]/95 backdrop-blur-md border-b border-slate-800/80 safe-top">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-600/30">
              <span className="text-white font-black text-xl tracking-tighter">15</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base sm:text-lg tracking-tight text-white leading-none">
                  La Quiniela Inteligente
                </h1>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  LaLiga 2024/25
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Apuestas Reducidas & Backtesting Oficial</span>
              </p>
            </div>
          </div>

          {/* Quick Info Badges */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Garantías SELAE</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Escrutinio Real</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-12">
        <QuinielaView />
      </main>

      {/* Footer */}
      <footer className="bg-slate-950/80 border-t border-slate-800/80 py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>La Quiniela Inteligente • Optimizador de Apuestas Reducidas y Análisis de Datos</span>
          <span className="text-[11px] text-slate-600">Basado en datos oficiales de Loterías y Apuestas del Estado y LaLiga</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
