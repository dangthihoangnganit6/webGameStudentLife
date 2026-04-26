import React from 'react';
import { Zap, Coins, Clock } from 'lucide-react';

const HUD = ({ stats }) => {
  const formatTime = (time) => {
    const paddedHour = String(time.hour).padStart(2, '0');
    const paddedMinute = String(time.minute).padStart(2, '0');
    return `Ngày ${time.day}, ${paddedHour}:${paddedMinute}`;
  };

  return (
    <div className="fixed top-6 left-6 right-6 flex justify-between items-start pointer-events-none">
      {/* Stats Bar */}
      <div className="flex gap-4 pointer-events-auto">
        <div className="glass-morphism px-4 py-3 flex items-center gap-3">
          <Zap className="text-yellow-400 w-5 h-5 fill-yellow-400" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-slate-400">Năng lượng</span>
            <div className="w-32 h-2 bg-slate-800 rounded-full mt-1 overflow-hidden border border-slate-700">
              <div 
                className="h-full bg-gradient-to-r from-yellow-500 to-yellow-300 transition-all duration-500" 
                style={{ width: `${stats.energy}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="glass-morphism px-4 py-3 flex items-center gap-3">
          <Coins className="text-emerald-400 w-5 h-5" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-slate-400">Tiền bạc</span>
            <span className="text-xl font-black text-emerald-400">${stats.money}</span>
          </div>
        </div>
      </div>

      {/* Time Display */}
      <div className="glass-morphism px-6 py-3 flex items-center gap-3 pointer-events-auto">
        <Clock className="text-indigo-400 w-5 h-5" />
        <span className="text-lg font-bold text-indigo-400">{formatTime(stats.time)}</span>
      </div>
    </div>
  );
};

export default HUD;
