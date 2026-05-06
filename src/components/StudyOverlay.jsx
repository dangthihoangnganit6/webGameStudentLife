import React from 'react';
import { GraduationCap } from 'lucide-react';

const StudyOverlay = ({ progress }) => {
  return (
    <div className="absolute inset-0 w-full h-full bg-slate-900/90 backdrop-blur-xl z-[10000] flex flex-col items-center justify-center p-6 text-center">
      <div className="relative mb-12 animate-bounce">
        <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 scale-150 rounded-full"></div>
        <GraduationCap className="w-24 h-24 text-blue-500 relative z-10" />
      </div>

      <h2 className="text-6xl font-black text-white mb-4 uppercase italic tracking-tighter">Đang ngồi trong lớp...</h2>
      <p className="text-slate-400 text-2xl mb-16 max-w-2xl">Lớp học đang diễn ra sôi nổi, hãy chú ý nghe giảng nhé!</p>

      <div className="w-full max-w-3xl bg-slate-800 h-10 rounded-full overflow-hidden border-4 border-white/10 shadow-2xl">
        <div 
          className="h-full bg-gradient-to-r from-blue-600 via-sky-500 to-blue-400 transition-all duration-100 ease-linear flex items-center justify-end px-5"
          style={{ width: `${progress}%` }}
        >
           <span className="text-sm font-black text-white mix-blend-overlay uppercase tracking-widest">{Math.round(progress)}%</span>
        </div>
      </div>
      
      <div className="mt-8 flex gap-2">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-100"></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-200"></div>
      </div>
    </div>
  );
};

export default StudyOverlay;
