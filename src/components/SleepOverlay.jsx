import React from 'react';
import { Moon } from 'lucide-react';

const SleepOverlay = ({ progress }) => {
  return (
    <div className="fixed inset-0 z-[10000] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center">
      <div className="text-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
          <div className="relative bg-slate-900 border-2 border-indigo-500/50 p-8 rounded-full shadow-2xl">
            <Moon className="w-16 h-16 text-indigo-400 animate-bounce" />
          </div>
        </div>
        
        <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-2">Đang nghỉ ngơi...</h2>
        <p className="text-indigo-400 font-bold uppercase tracking-widest text-[10px] mb-8">Zzz zzz zzz</p>
        
        <div className="w-72 mx-auto">
          <div className="flex justify-between items-end mb-2">
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Tiến độ hồi phục</span>
            <span className="text-xl font-black text-indigo-400">{Math.round(progress)}%</span>
          </div>
          <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 p-1">
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
