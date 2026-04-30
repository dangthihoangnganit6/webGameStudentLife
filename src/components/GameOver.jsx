import React from 'react';
import { AlertTriangle, RefreshCcw, Skull } from 'lucide-react';

const GameOver = ({ onReset, type = "expelled", title, message }) => {
  const isStroke = type === 'stroke';
  
  return (
    <div className={`absolute inset-0 z-[20000] flex items-center justify-center p-6 transition-colors duration-1000 w-full h-full ${isStroke ? 'bg-black' : 'bg-slate-950'}`}>
      <div 
        className={`absolute inset-0 animate-pulse transition-opacity duration-1000 ${
          isStroke 
          ? 'bg-[radial-gradient(circle_at_center,rgba(71,85,105,0.4)_0%,transparent_70%)]' 
          : 'bg-[radial-gradient(circle_at_center,rgba(185,28,28,0.25)_0%,transparent_70%)]'
        }`}
      ></div>
      
      <div className="max-w-2xl w-full text-center relative z-10 transition-transform duration-500 hover:scale-[1.02]">
        <div className={`mb-10 inline-flex p-12 rounded-full border-[3px] transition-all duration-700 ${
          isStroke 
          ? 'bg-slate-900/50 border-slate-700 shadow-[0_0_80px_rgba(71,85,105,0.4)]' 
          : 'bg-red-600/10 border-red-600/20 shadow-[0_0_80px_rgba(185,28,28,0.4)]'
        } animate-bounce`}>
          {isStroke ? (
            <Skull className="w-24 h-24 text-slate-400" />
          ) : (
            <AlertTriangle className="w-24 h-24 text-red-600" />
          )}
        </div>
        
        <h1 className={`text-8xl font-black mb-6 uppercase italic tracking-tighter leading-none transition-colors ${isStroke ? 'text-slate-500' : 'text-white'}`}>
          GAME OVER
        </h1>
        
        <p className={`font-black uppercase tracking-[0.5em] text-lg mb-12 transition-colors ${isStroke ? 'text-slate-600' : 'text-red-500'}`}>
          {title || (isStroke ? "Đột quỵ không qua khỏi" : "Bạn đã bị đuổi học")}
        </p>
        
        <div className={`border p-12 rounded-[56px] backdrop-blur-3xl mb-16 transition-all ${
          isStroke 
          ? 'bg-slate-900/40 border-slate-800 shadow-2xl' 
          : 'bg-white/5 border-white/10 shadow-2xl shadow-red-500/5'
        }`}>
          <p className={`leading-relaxed italic text-2xl ${isStroke ? 'text-slate-500' : 'text-slate-300'}`}>
            "{message || (isStroke ? "Bạn đã bị đột quỵ vì làm việc quá sức" : "Vì không đăng ký tín chỉ đúng hạn, nhà trường đã ra quyết định thôi học đối với bạn.")}"
          </p>
        </div>

        <button
          onClick={onReset}
          className={`group relative inline-flex items-center gap-4 px-12 py-6 rounded-full font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-2xl ${
            isStroke 
            ? 'bg-slate-800 text-slate-400 shadow-slate-900/50 hover:bg-slate-700 hover:text-white' 
            : 'bg-white text-slate-950 shadow-white/5 hover:bg-red-50'
          }`}
        >
          <RefreshCcw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-700" />
          CHƠI LẠI TỪ ĐẦU
        </button>
      </div>
    </div>
  );
};

export default GameOver;
