import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

const GameOver = ({ onReset }) => {
  return (
    <div className="fixed inset-0 bg-slate-950 z-[20000] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(185,28,28,0.15)_0%,transparent_70%)] animate-pulse"></div>
      
      <div className="max-w-md w-full text-center relative z-10">
        <div className="mb-8 inline-flex p-6 bg-red-600/10 rounded-full border-2 border-red-600/20 shadow-2xl shadow-red-600/20 animate-bounce">
          <AlertTriangle className="w-16 h-16 text-red-600" />
        </div>
        
        <h1 className="text-5xl font-black text-white mb-4 uppercase italic tracking-tighter leading-none">
          GAME OVER
        </h1>
        
        <p className="text-red-500 font-bold uppercase tracking-widest text-sm mb-6">
          Bạn đã bị đuổi học
        </p>
        
        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl mb-12">
          <p className="text-slate-300 leading-relaxed italic">
            "Vì không đăng ký tín chỉ đúng hạn, nhà trường đã ra quyết định thôi học đối với bạn. Hãy cố gắng hơn ở kỳ tới!"
          </p>
        </div>

        <button
          onClick={onReset}
          className="group relative inline-flex items-center gap-3 bg-white text-slate-950 px-10 py-5 rounded-full font-black text-lg hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-white/10"
        >
          <RefreshCcw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
          CHƠI LẠI TỪ ĐẦU
        </button>
      </div>
    </div>
  );
};

export default GameOver;
