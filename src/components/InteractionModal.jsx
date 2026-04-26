import React from 'react';
import { X } from 'lucide-react';

const InteractionModal = ({ location, onClose, onAction }) => {
  if (!location) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-morphism max-w-md w-full bg-slate-900/90 border-2 border-white/10 overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-slate-800/50">
          <h2 className="text-2xl font-black text-white">{location.name}</h2>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>
        
        <div className="p-8">
          <p className="text-slate-300 text-lg mb-8 leading-relaxed">
            {location.description}
          </p>

          <div className="grid grid-cols-1 gap-4">
            {location.id === 'hostel' && (
              <button 
                onClick={() => onAction('rest')}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
              >
                Nghỉ ngơi (+20 Năng lượng, +2 Tiếng)
              </button>
            )}
            {location.id === 'school' && (
              <button 
                onClick={() => onAction('study')}
                className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-purple-500/20"
              >
                Học tập (-10 Năng lượng, +4 Tiếng)
              </button>
            )}
            {location.id === 'work' && (
              <button 
                onClick={() => onAction('work')}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
              >
                Làm thêm (+$50, -30 Năng lượng, +6 Tiếng)
              </button>
            )}
            
            <button 
              onClick={onClose}
              className="w-full py-4 bg-white/5 hover:bg-white/10 text-slate-400 font-bold rounded-xl transition-all"
            >
              Rời đi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractionModal;
