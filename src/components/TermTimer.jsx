import React from 'react';
import { Clock } from 'lucide-react';

const TermTimer = ({ timeLeft, isEnrolled }) => {
  if (isEnrolled) return null;

  const m = Math.floor(timeLeft / 60);
  const s = Math.floor(timeLeft % 60);

  return (
    <div className="fixed top-24 left-6 z-[100] animate-in slide-in-from-left duration-500">
      <div className="glass-morphism px-6 py-4 border-2 border-red-500/30 bg-red-950/20 shadow-2xl shadow-red-500/10">
        <div className="flex items-center gap-4">
          <div className="bg-red-600 p-2 rounded-lg animate-pulse">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-0.5">Hạn đăng ký tín chỉ</div>
            <div className="text-2xl font-mono font-black text-white leading-none">
              {m.toString().padStart(2, '0')}:{s.toString().padStart(2, '0')}
            </div>
          </div>
        </div>
        <div className="mt-3 w-full bg-white/5 h-1 rounded-full overflow-hidden">
          <div 
            className="h-full bg-red-500 transition-all duration-1000 ease-linear"
            style={{ width: `${(timeLeft / 300) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default TermTimer;
