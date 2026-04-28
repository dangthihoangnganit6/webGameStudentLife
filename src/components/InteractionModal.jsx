import React, { useState } from 'react';
import { X, GraduationCap, CheckCircle, Wallet, Heart, User, Store, Home, Utensils, ShoppingBag, Briefcase } from 'lucide-react';
import { HOUSING_TYPES, INGREDIENTS } from '../game/constants';
import workOptions from '../data/workOptions.json';

const InteractionModal = ({ 
  location, 
  onClose, 
  interactionStep, 
  setInteractionStep, 
  onAction,
  playerStats,
  stats,
  isClassStarting
}) => {
  const [selectedCredits, setSelectedCredits] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);

  if (!location) return null;

  const renderContent = () => {
    // 1. Initial Proximity Ask
    if (interactionStep === 'ask') {
      return (
        <div className="text-center">
          <p className="text-slate-300 text-lg mb-8 leading-relaxed">
            Bạn muốn vào <span className="text-white font-bold">{location.name}</span> không?
          </p>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setInteractionStep('sub_menu')}
              className="py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
            >
              Có
            </button>
            <button 
              onClick={onClose}
              className="py-4 bg-white/5 hover:bg-white/10 text-slate-400 font-bold rounded-xl transition-all active:scale-95"
            >
              Không
            </button>
          </div>
        </div>
      );
    }

    if (interactionStep === 'confirm_low_energy_study') {
      return (
        <div className="text-center space-y-8">
          <div className="bg-amber-500/10 p-6 rounded-2xl border-2 border-amber-500/30">
            <p className="text-amber-500 font-black text-lg leading-tight uppercase italic">
              "Bạn đang kiệt sức, không nên tiếp tục học, hãy nghỉ ngơi đã"
            </p>
          </div>
          
          <div className="space-y-4">
            <p className="text-white text-xl font-bold tracking-tight">Bạn có muốn học không?</p>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => onAction('check_in')}
                className="py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-emerald-500/20 active:scale-95 uppercase tracking-widest"
              >
                Có
              </button>
              <button 
                onClick={() => setInteractionStep('sub_menu')}
                className="py-5 bg-slate-800 hover:bg-slate-700 text-slate-400 font-black rounded-2xl transition-all active:scale-95 uppercase tracking-widest"
              >
                Không
              </button>
            </div>
          </div>
        </div>
      );
    }

    // --- LOGIC TRƯỜNG HỌC ---
    if (location.id === 'school') {
      if (playerStats.isEnrolled) {
        if (!playerStats.isPaid) {
          return (
            <div className="space-y-6">
              <div className="bg-amber-950/20 p-4 rounded-xl border border-amber-500/30 text-center">
                <Wallet className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <h3 className="text-white font-bold uppercase text-sm">Chưa thanh toán học phí</h3>
                <p className="text-amber-500 text-2xl font-black mt-1">{playerStats.tuitionDue.toLocaleString()}đ</p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <button 
                  disabled={stats.money < playerStats.tuitionDue}
                  onClick={() => onAction('pay_tuition')}
                  className={`w-full py-4 rounded-xl font-bold flex items-center justify-between px-6 transition-all ${
                    stats.money >= playerStats.tuitionDue 
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg' 
                    : 'bg-slate-800 text-slate-500 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Tài khoản cá nhân
                  </div>
                  <span className="text-xs uppercase">Bấm để trả</span>
                </button>

                <button 
                  disabled={playerStats.hasClaimedParentSupport || playerStats.pendingParentSupport}
                  onClick={() => onAction('ask_parents')}
                  className={`w-full py-4 rounded-xl font-bold flex items-center justify-between px-6 transition-all ${
                    playerStats.hasClaimedParentSupport 
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg'
                  } ${playerStats.pendingParentSupport ? 'opacity-50 ring-2 ring-indigo-400' : ''}`}
                >
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    {playerStats.hasClaimedParentSupport ? 'Đã nhận hỗ trợ' : 'Xin bố mẹ'}
                  </div>
                  <span className="text-xs uppercase">
                    {playerStats.hasClaimedParentSupport ? 'HOÀN TẤT' : (playerStats.pendingParentSupport ? 'Đã gửi' : 'Bấm để xin')}
                  </span>
                </button>
              </div>
              
              {playerStats.hasClaimedParentSupport && (
                <p className="text-[10px] text-emerald-400 text-center uppercase font-bold italic">
                   "Bạn đã nhận hỗ trợ từ gia đình cho kỳ này"
                </p>
              )}
              {playerStats.pendingParentSupport && !playerStats.hasClaimedParentSupport && (
                <p className="text-[10px] text-indigo-400 text-center uppercase font-bold italic">
                   "Đã gửi yêu cầu, hãy về Nhà (Bố mẹ) để lấy tiền"
                </p>
              )}
              <button onClick={onClose} className="w-full py-3 text-slate-500 text-sm">Trở lại</button>
            </div>
          );
        }

        return (
          <div className="space-y-6 text-center">
            <div className="bg-indigo-950/30 p-6 rounded-2xl border border-indigo-500/20">
              <GraduationCap className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
              <h3 className="text-white font-black text-xl mb-1 uppercase tracking-tight">Trạng thái học tập</h3>
              <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-4">Đã thanh toán học phí</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/50 p-3 rounded-lg">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Đã học</div>
                  <div className="text-lg font-black text-emerald-400">{playerStats.attendanceCount}/{playerStats.totalCredits}</div>
                </div>
                <div className="bg-slate-900/50 p-3 rounded-lg">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Vắng mặt</div>
                  <div className="text-lg font-black text-red-400">{playerStats.missedClasses}/3</div>
                </div>
              </div>
            </div>

            <button 
              disabled={!isClassStarting}
              onClick={() => {
                if (stats.energy <= 25) {
                  setInteractionStep('confirm_low_energy_study');
                } else {
                  onAction('check_in');
                }
              }}
              className={`w-full py-5 rounded-2xl font-black text-xl transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 ${
                isClassStarting 
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-emerald-500/20' 
                : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
              }`}
            >
              {isClassStarting ? <><CheckCircle /> ĐIỂM DANH NGAY</> : 'CHƯA ĐẾN GIỜ HỌC'}
            </button>
          </div>
        );
      }

      return (
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-indigo-400 font-bold text-xs uppercase tracking-widest">Chọn số tín chỉ</h3>
            <div className="flex gap-2">
              {[15, 20].map(val => (
                <button 
                  key={val}
                  onClick={() => setSelectedCredits(val)}
                  className={`flex-1 py-3 font-bold rounded-lg transition-all border ${
                    selectedCredits === val 
                    ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' 
                    : 'bg-slate-800 border-white/5 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {val} Tín
                </button>
              ))}
            </div>

            <h3 className="text-indigo-400 font-bold text-xs uppercase tracking-widest pt-2">Chọn độ khó</h3>
            <div className="flex gap-2">
              {['easy', 'hard'].map(val => (
                <button 
                  key={val}
                  onClick={() => setSelectedDifficulty(val)}
                  className={`flex-1 py-3 font-bold rounded-lg transition-all border ${
                    selectedDifficulty === val 
                    ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' 
                    : 'bg-slate-800 border-white/5 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {val === 'easy' ? 'Dễ' : 'Khó'}
                </button>
              ))}
            </div>
            <div className="bg-slate-950/80 p-5 rounded-2xl border-2 border-indigo-500/30 mt-4 text-center">
              <div className="text-[10px] uppercase font-black text-slate-500 mb-1">Tổng học phí dự kiến</div>
              <div className="text-3xl font-black text-emerald-400">
                {selectedCredits ? `${(selectedCredits * 1000000).toLocaleString()}đ` : '0đ'}
              </div>
            </div>
          </div>

          <button 
            disabled={!selectedCredits || !selectedDifficulty}
            onClick={() => onAction('enroll', { credits: selectedCredits, difficulty: selectedDifficulty })}
            className={`w-full py-4 rounded-xl font-black text-lg transition-all shadow-xl ${
              (selectedCredits && selectedDifficulty)
              ? 'bg-indigo-600 hover:bg-indigo-500 text-white active:scale-95'
              : 'bg-slate-800 text-slate-600 cursor-not-allowed'
            }`}
          >
            XÁC NHẬN NHẬP HỌC
          </button>
        </div>
      );
    }

    // --- LOGIC NHÀ TRỌ ---
    if (location.id === 'home') {
      if (!playerStats.rentedRoom) {
        return (
          <div className="space-y-6">
            <h3 className="text-white font-black uppercase text-xl text-center italic tracking-tighter">Chọn nơi cư trú</h3>
            <div className="space-y-3">
              {HOUSING_TYPES.map(type => (
                <button
                  key={type.id}
                  onClick={() => onAction('rent_room', type)}
                  className="w-full p-4 bg-slate-800/50 hover:bg-indigo-600 group rounded-2xl border border-white/5 transition-all text-left flex justify-between items-center"
                >
                  <div>
                    <div className="text-white font-bold group-hover:text-white">{type.label}</div>
                    <div className="text-[10px] text-slate-500 group-hover:text-indigo-200 uppercase">{type.description}</div>
                  </div>
                  <div className="text-emerald-400 font-black text-xl group-hover:text-white">{type.price.toLocaleString()}đ</div>
                </button>
              ))}
            </div>
            <button onClick={onClose} className="w-full py-3 text-slate-500 text-xs">Trở lại</button>
          </div>
        );
      }

      return (
        <div className="space-y-6">
          <div className="bg-indigo-950/20 p-6 rounded-2xl border border-indigo-500/20 text-center">
            <Home className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
            <h3 className="text-white font-black text-xl uppercase italic">Phòng của bạn</h3>
            <p className="text-slate-400 text-[10px] mt-1 font-bold uppercase tracking-widest">{playerStats.rentedRoom.label}</p>
          </div>

          <div className="space-y-3">
            <h4 className="text-white font-black text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-orange-400" /> Túi nguyên liệu
            </h4>
            {(() => {
              const counts = playerStats.inventory.reduce((acc, item) => {
                acc[item.name] = (acc[item.name] || 0) + 1;
                return acc;
              }, {});
              
              if (playerStats.inventory.length === 0) {
                return (
                  <div className="bg-slate-900/50 p-6 rounded-xl border border-dashed border-white/10 text-center text-slate-600 text-xs italic">
                      Chưa có nguyên liệu nào. Hãy đi Siêu thị!
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 gap-2">
                  {Object.entries(counts).map(([name, count]) => (
                    <button
                      key={name}
                      onClick={() => onAction('start_cooking', { index: playerStats.inventory.findIndex(i => i.name === name) })}
                      className="flex justify-between items-center bg-slate-800 hover:bg-orange-600/20 p-3 rounded-xl border border-white/5 group transition-all"
                    >
                      <div className="flex items-center gap-3">
                         <Utensils className="w-4 h-4 text-orange-500" />
                         <span className="text-white font-bold text-sm">
                           {name} <span className="text-orange-400 opacity-50 ml-2">x{count}</span>
                         </span>
                      </div>
                      <span className="text-[10px] font-black text-orange-400 uppercase opacity-0 group-hover:opacity-100 transition-opacity">Bắt đầu nấu</span>
                    </button>
                  ))}
                </div>
              );
            })()}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => onAction('start_cooking', { index: 0 })}
              disabled={playerStats.inventory.length === 0}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black py-4 rounded-2xl transition-all shadow-lg"
            >
              NẤU ĂN
            </button>
            <button
              onClick={() => onAction('start_sleeping')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-2xl transition-all shadow-lg"
            >
              NGỦ (30S)
            </button>
          </div>

          {(playerStats.electricityBill.status === 'pending' || playerStats.electricityBill.status === 'overdue') && (
            <div className="bg-amber-950/20 p-5 rounded-2xl border-2 border-amber-500/30">
               <div className="flex justify-between items-center mb-3">
                  <div>
                    <div className="text-[10px] uppercase font-black text-amber-500/60 mb-0.5">Tiền điện {playerStats.electricityBill.status === 'overdue' ? '(Quá hạn)' : ''}</div>
                    <div className="text-xl font-black text-white">{playerStats.electricityBill.amount.toLocaleString()}đ</div>
                  </div>
                  <button
                    disabled={stats.money < playerStats.electricityBill.amount}
                    onClick={() => onAction('pay_electricity_bill')}
                    className={`px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                      stats.money >= playerStats.electricityBill.amount 
                      ? 'bg-amber-500 hover:bg-amber-400 text-white shadow-lg shadow-amber-500/20' 
                      : 'bg-white/5 text-white/20 cursor-not-allowed'
                    }`}
                  >
                    Thanh toán
                  </button>
               </div>
               {playerStats.electricityBill.status === 'overdue' && (
                 <p className="text-[10px] text-rose-400 font-bold animate-pulse">CƯỠNG CHẾ: Hệ thống đang bị quá tải, năng lượng giảm liên tục!</p>
               )}
            </div>
          )}
          
          <button onClick={onClose} className="w-full py-3 text-slate-500 text-xs uppercase font-bold tracking-widest hover:text-white transition-colors border-t border-white/5 pt-6">Rời phòng</button>
        </div>
      );
    }

    // --- LOGIC SIÊU THỊ ---
    if (location.id === 'market') {
      return (
        <div className="space-y-6">
          <div className="bg-emerald-950/20 p-6 rounded-2xl border border-emerald-500/20 text-center">
            <Store className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-white font-black text-xl uppercase italic">Siêu thị</h3>
            <p className="text-slate-400 text-xs mt-1">Cung cấp nguyên liệu tươi ngon mỗi ngày.</p>
          </div>

          <div className="space-y-3">
            {INGREDIENTS.map(item => {
              const count = playerStats.inventory.filter(i => i.id === item.id).length;
              return (
                <button
                  key={item.id}
                  onClick={() => onAction('buy_ingredient', item)}
                  className="w-full p-4 bg-slate-800/50 hover:bg-emerald-600 group rounded-2xl border border-white/5 transition-all text-left flex justify-between items-center"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="text-white font-bold group-hover:text-white">{item.name}</div>
                      {count > 0 && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-black">Có: {count}</span>}
                    </div>
                    <div className="text-[10px] text-slate-500 group-hover:text-emerald-200 uppercase">
                      +{item.energy} Energy | {item.cookTime}s Cook
                    </div>
                  </div>
                  <div className="text-emerald-400 font-black text-xl group-hover:text-white">{item.price.toLocaleString()}đ</div>
                </button>
              );
            })}
          </div>
          
          <button onClick={onClose} className="w-full py-3 text-slate-500 text-xs uppercase font-bold tracking-widest hover:text-white transition-colors border-t border-white/5 pt-6">Rời đi</button>
        </div>
      );
    }

    // --- LOGIC GIA ĐÌNH ---
    if (location.id === 'parents_home') {
      return (
        <div className="space-y-6">
          <div className="bg-emerald-950/20 p-6 rounded-2xl border border-emerald-500/20 text-center">
            <Heart className="w-12 h-12 text-emerald-500 mx-auto mb-4 fill-emerald-500/20" />
            <h3 className="text-white font-bold text-xl uppercase italic">Gia Đình</h3>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">
              {playerStats.pendingParentSupport 
                ? "Bố mẹ đã biết bạn cần tiền học phí. Hãy lấy tiền và tập trung học nhé!" 
                : "Bố mẹ rất mong bạn học tốt. Đừng quên xin tiền khi đến kỳ học."}
            </p>
          </div>

          <button 
            disabled={!playerStats.pendingParentSupport}
            onClick={() => onAction('get_parent_money')}
            className={`w-full py-5 rounded-2xl font-black text-xl transition-all shadow-xl flex items-center justify-center gap-3 ${
              playerStats.pendingParentSupport 
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95 shadow-emerald-500/30' 
              : 'bg-slate-800 text-slate-600 cursor-not-allowed'
            }`}
          >
            {playerStats.pendingParentSupport ? 'XIN TIỀN HỌC PHÍ' : 'BỐ MẸ CHƯA BIẾT'}
          </button>
          
          <button onClick={onClose} className="w-full py-3 text-slate-500 text-xs uppercase font-bold tracking-widest hover:text-white transition-colors">Rời đi</button>
        </div>
      );
    }

    // --- LOGIC LÀM VIÊC ---
    if (location.id === 'work') {
      return (
        <div className="space-y-6">
           <div className="bg-rose-950/20 p-6 rounded-2xl border border-rose-500/20 text-center">
            <Briefcase className="w-12 h-12 text-rose-500 mx-auto mb-4" />
            <h3 className="text-white font-black text-xl uppercase italic">Việc làm thêm</h3>
            <p className="text-slate-400 text-xs mt-1">Kiếm thêm thu nhập để trang trải cuộc sống.</p>
          </div>

          <div className="space-y-3">
            {workOptions.map(job => (
              <button
                key={job.id}
                onClick={() => onAction('work', job)}
                className="w-full p-4 bg-slate-800/50 hover:bg-rose-600 group rounded-2xl border border-white/5 transition-all text-left flex justify-between items-center"
              >
                <div>
                  <div className="text-white font-bold group-hover:text-white">{job.name}</div>
                  <div className="text-[10px] text-slate-500 group-hover:text-rose-200 uppercase">
                    Tiêu tốn: {job.exhaustion} Năng lượng
                  </div>
                </div>
                <div className="text-emerald-400 font-black text-xl group-hover:text-white">+{job.income.toLocaleString()}đ</div>
              </button>
            ))}
          </div>
          
          <button onClick={onClose} className="w-full py-3 text-slate-500 text-xs uppercase font-bold tracking-widest hover:text-white transition-colors border-t border-white/5 pt-6">Rời đi</button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <p className="text-slate-400 text-center italic mb-4">Các chức năng {location.name} đang được cập nhật...</p>
        <button onClick={onClose} className="w-full py-4 bg-white/5 text-slate-400 rounded-xl">Quay lại</button>
      </div>
    );
  };

  return (
    <div className={`fixed inset-0 z-[1000] flex items-center justify-center p-8 ${location.id !== 'market' ? 'bg-slate-950/85 backdrop-blur-md' : ''}`}>
      <div 
        className="w-full max-w-3xl bg-slate-950 border-[3px] border-white/10 rounded-[48px] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
          <span className="text-xs font-black uppercase text-indigo-400 tracking-[0.3em]">{location.id} module</span>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-500" />
          </button>
        </div>
        
        <div className="p-12">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default InteractionModal;

