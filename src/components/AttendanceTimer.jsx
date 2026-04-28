import React from 'react';
import { Calendar, AlertCircle } from 'lucide-react';

const AttendanceTimer = ({ nextClassTimer, checkInWindow, isClassStarting, playerStats }) => {
  if (playerStats.isDroppedOut) {
    return (
      <div className="w-full glass-morphism p-4 border-2 border-red-500/50 bg-red-950/20 text-red-400 flex items-center gap-3 animate-pulse">
        <AlertCircle className="w-6 h-6" />
        <div>
          <div className="text-[10px] font-black uppercase tracking-tighter">TRẠNG THÁI</div>
          <div className="font-bold">ĐÃ THÔI HỌC (MISS: {playerStats.missedClasses})</div>
        </div>
      </div>
    );
  }

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {isClassStarting && (
        <div className="glass-morphism p-4 border-2 border-indigo-500 bg-indigo-950/30 text-white animate-bounce">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></div>
            <span className="font-black text-sm uppercase tracking-tighter">ĐẾN GIỜ ĐIỂM DANH!</span>
          </div>
          <div className="text-2xl font-mono text-center mt-1">{formatTime(checkInWindow)}</div>
        </div>
      )}

      <div className="glass-morphism p-4 text-white border-white/20">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-indigo-600" />
          <div>
            <div className="text-[10px] font-bold uppercase opacity-50">Buổi học tiếp theo</div>
            <div className="text-xl font-black font-mono">
              {isClassStarting ? "ĐANG DIỄN RA" : formatTime(nextClassTimer)}
            </div>
          </div>
        </div>
        <div className="mt-2 flex gap-1">
          {[...Array(3)].map((_, i) => (
            <div 
              key={i} 
              className={`h-1 flex-1 rounded-full ${i < playerStats.missedClasses ? 'bg-red-500' : 'bg-slate-200'}`}
            ></div>
          ))}
        </div>
        <div className="text-[8px] uppercase font-bold text-slate-400 mt-1">Số lần vắng: {playerStats.missedClasses}/3</div>
      </div>
    </div>
  );
};

export default AttendanceTimer;
