import React from 'react';
import { Moon } from 'lucide-react';

const SleepOverlay = ({ progress }) => {
  return (
    <div className="absolute inset-0 w-full h-full z-[10000] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center">
      <div className="text-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
          <div className="relative bg-slate-900 border-4 border-indigo-500/50 p-12 rounded-full shadow-2xl">
            <Moon className="w-24 h-24 text-indigo-400 animate-bounce" />
          </div>
        </div>
        
        <h2 className="text-6xl font-black text-white uppercase italic tracking-tighter mb-4">Đang nghỉ ngơi...</h2>
        <p className="text-indigo-400 font-bold uppercase tracking-[0.5em] text-xl mb-12">Zzz zzz zzz</p>
        
        <div className="w-[500px] mx-auto">
          <div className="flex justify-between items-end mb-4">
            <span className="text-xs font-black text-white/40 uppercase tracking-widest">Tiến độ hồi phục</span>
            <span className="text-4xl font-black text-indigo-400 tabular-nums">{Math.round(progress)}%</span>
          </div>
          <div className="h-8 w-full bg-white/5 rounded-full overflow-hidden border-2 border-white/10 p-1.5 shadow-2xl">
            <div 
              className="h-full bg-gradient-to-r from-indigo-600 via-purple-500 to-indigo-400 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            >
              <div className="w-full h-full opacity-30 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.4)_50%,transparent_100%)] animate-[shimmer_1.5s_infinite]"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SleepOverlay;
