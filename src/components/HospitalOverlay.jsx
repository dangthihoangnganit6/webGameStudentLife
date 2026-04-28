import React from 'react';
import { Activity, HeartPulse } from 'lucide-react';

const HospitalOverlay = ({ progress }) => {
  return (
    <div className="fixed inset-0 z-[10000] bg-white/90 backdrop-blur-2xl flex items-center justify-center p-6 text-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.1)_0%,transparent_70%)] animate-pulse"></div>
      
      <div className="max-w-2xl w-full text-center relative z-10">
        <div className="mb-10 inline-flex p-10 bg-red-500/10 rounded-full border-[3px] border-red-500/20 shadow-2xl animate-pulse">
          <Activity className="w-24 h-24 text-red-600" />
        </div>
        
        <h2 className="text-6xl font-black uppercase italic tracking-tighter mb-4">Đang được điều trị</h2>
        <p className="text-slate-500 font-bold uppercase tracking-[0.5em] text-xl mb-16">Hệ thống đang phục hồi năng lượng</p>
        
        <div className="bg-slate-100 p-12 rounded-[56px] shadow-inner border-2 border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <HeartPulse className="w-8 h-8 text-red-500 animate-bounce" />
              <span className="text-xs font-black uppercase text-slate-400 tracking-widest">Tình trạng phục hồi</span>
            </div>
            <span className="text-4xl font-black text-slate-800 tabular-nums">{Math.round(progress)}%</span>
          </div>
          
          <div className="h-10 w-full bg-slate-200 rounded-full overflow-hidden border-4 border-white shadow-lg p-1.5 font-bold tracking-widest text-lg">
             <div 
              className="h-full bg-gradient-to-r from-red-600 to-rose-500 rounded-full transition-all duration-300 relative overflow-hidden"
              style={{ width: `${progress}%` }}
             >
                <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.3)_50%,transparent_100%)] animate-[shimmer_2s_infinite]"></div>
             </div>
          </div>
        </div>
        
        <p className="mt-12 text-slate-400 text-xl italic font-medium">"Hãy nghỉ ngơi thật tốt, sức khỏe là vàng!"</p>
      </div>
    </div>
  );
};

export default HospitalOverlay;
