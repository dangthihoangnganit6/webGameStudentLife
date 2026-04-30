import React from 'react';
import { Zap, AlertTriangle } from 'lucide-react';

const ElectricityBillOverlay = ({ bill, onPay, money }) => {
  if (bill.status === 'none' || bill.status === 'paid') return null;

  return (
    <div className="absolute inset-0 w-full h-full z-[2000] flex items-center justify-center bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-500">
      <div className="glass-morphism p-12 w-full max-w-2xl border-[3px] border-amber-500/40 bg-slate-950/95 shadow-[0_0_100px_rgba(245,158,11,0.15)] rounded-[40px]">
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-amber-500/20 animate-pulse">
            <Zap className="w-10 h-10 text-white" />
          </div>
          
          <h2 className="text-4xl font-black text-white mb-3 uppercase tracking-tighter">Hóa đơn tiền điện</h2>
          <p className="text-amber-200/80 text-xl mb-10 font-bold">Bạn hãy vào nhà trọ để trả tiền điện</p>
          
          <div className="bg-white/5 rounded-[32px] p-10 w-full mb-10 border-2 border-white/5">
            <div className="text-xs uppercase tracking-[0.3em] text-white/40 mb-3 font-black">Số tiền cần thanh toán</div>
            <div className="text-7xl font-black text-amber-400 tabular-nums">
              {bill.amount.toLocaleString()}đ
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={onPay}
              disabled={money < bill.amount}
              className={`w-full py-6 rounded-[24px] font-black text-xl uppercase tracking-[0.2em] transition-all ${
                money >= bill.amount 
                ? 'bg-amber-500 hover:bg-amber-400 text-white shadow-[0_10px_40px_rgba(245,158,11,0.3)] active:scale-95' 
                : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
              }`}
            >
              {money >= bill.amount ? 'Thanh toán ngay' : 'Không đủ tiền'}
            </button>
            
            {bill.status === 'pending' && (
                <div className="flex items-center justify-center gap-3 text-rose-400 font-black text-lg mt-4">
                    <AlertTriangle className="w-6 h-6" />
                    <span>Hết hạn sau: {bill.timeLeftToPay} giây</span>
                </div>
            )}
            
            {bill.status === 'overdue' && (
                <div className="text-rose-500 font-black text-xl animate-pulse mt-4 uppercase tracking-[0.2em]">
                    Đã quá hạn! Năng lượng đang bị trừ mỗi giây
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectricityBillOverlay;
