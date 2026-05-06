import React from 'react';
import useGameStore from '../store/useGameStore';
import InteractionModal from './InteractionModal';
import AttendanceTimer from './AttendanceTimer';
import CookingOverlay from './CookingOverlay';
import SleepOverlay from './SleepOverlay';
import HospitalOverlay from './HospitalOverlay';
import TutoringOverlay from './TutoringOverlay';
import TermTimer from './TermTimer';
import ElectricityBillOverlay from './ElectricityBillOverlay';
import GameOver from './GameOver';
import WaitingOverlay from './WaitingOverlay';
import StartScreen from './StartScreen';
import HitboxOverlay from './HitboxOverlay';
import { X, GraduationCap, Zap, Coins, Clock, User, BookOpen, Briefcase, Heart, Bike } from 'lucide-react';
import { MAP_CONFIG, OBSTACLES } from '../game/constants';
import { LOCATIONS } from '../data/locations';

import pathImage from '../assets/path.png';
import hospitalImage from '../assets/hospital.png';
import universityImage from '../assets/university.png';
import apartmentImage from '../assets/apartment.png';
import supermarketImage from '../assets/supermarket.png';
import homeImage from '../assets/home.png';
import jobCenterImage from '../assets/job_center.png';
import spriteUpImage from '../assets/sprite_up.png';
import spriteRightImage from '../assets/sprite_right.png';
import stadiumImage from '../assets/stadium.png';
import homeOfStudentImage from '../assets/home_of_student.png';
import cantinImage from '../assets/cantin.png';
import parkImage from '../assets/park.png';
import bikeDownImage from '../assets/bike_down.png';
import bikeUpImage from '../assets/bike_up.png';
import shopImage from '../assets/shop.png';
import coffeeImage from '../assets/coffee.png';
import university1Image from '../assets/university1.png';

import studyImage from '../assets/study.png';
import workImage from '../assets/work.png';
import energyImage from '../assets/energy.png';
import parkingImage from '../assets/parking.png';

import background1 from '../assets/background1.png';
import background2 from '../assets/background2.png';
import background3 from '../assets/background3.png';
import background4 from '../assets/background4.png';
import background5 from '../assets/background5.png';
import background6 from '../assets/background6.png';
import background7 from '../assets/background7.png';

const IMAGE_MAP = {
  'hospital.png': hospitalImage,
  'stadium.png': stadiumImage,
  'park.png': parkImage,
  'university.png': universityImage,
  'apartment.png': apartmentImage,
  'supermarket.png': supermarketImage,
  'home.png': homeImage,
  'job_center.png': jobCenterImage,
  'home_of_student.png': homeOfStudentImage,
  'cantin.png': cantinImage,
  'shop.png': shopImage,
  'coffee.png': coffeeImage,
  'university1.png': university1Image
};

export default function GameLayout({ appState }) {
  // Consolidate all appState destructuring
  const {
    notifications, setNotifications,
    timeLeftToEnroll,
    showExhaustedPopup, handleExhaustedOk,
    showTutorAlert, setShowTutorAlert,
    systemAlert, setSystemAlert,
    showDebug, setShowDebug,
    isGameStarted, setIsGameStarted,
    frame, scaleFactor, DESIGN_WIDTH, DESIGN_HEIGHT, gameContainerRef,
    handleAction,
    signInWithGoogle, handleLogout,
    session,
    showLogin, setShowLogin, handleLoginSuccess
  } = appState;

  // Lấy dữ liệu global từ store
  const {
    position, direction, stats, playerStats,
    isModalOpen, activeLocation, interactionStep, setInteractionStep, closeModal,
    isClassStarting, nextClassTimer, checkInWindow,
    isCooking, cookingProgress,
    isSleeping, sleepProgress,
    isHospitalized, hospitalizationProgress,
    isTutoring, tutoringProgress,
    isWaiting, waitingProgress,
    payElectricityBill,
    resetGame,
  } = useGameStore();

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const countdownTime = playerStats.isEnrolled
    ? (playerStats.isPaid
      ? (isClassStarting ? "ĐANG DIỄN RA" : formatTime(nextClassTimer))
      : "CHỜ NỘP TIỀN")
    : formatTime(timeLeftToEnroll);

  return (
    <div className="w-full min-h-screen bg-[#E6E9D7] flex flex-col items-center font-sans overflow-x-hidden relative">
      {/* Header - TopAppBar – Figma spec */}
      <div
        className="flex flex-row items-center justify-between px-6 w-full shrink-0 sticky top-0 z-[1000]"
        style={{
          height: 67,
          background: '#0F172A',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0px 1px 2px rgba(0,0,0,0.05)',
        }}
      >
        <div className="flex items-center gap-3">
          <span
            className="text-white select-none"
            style={{
              fontFamily: "'Manrope', sans-serif",
              fontWeight: 800,
              fontSize: 24,
              lineHeight: '32px',
              letterSpacing: '-0.6px',
            }}
          >
            Student Life
          </span>
        </div>
        <div className="flex flex-row items-center gap-4">
          {session ? (
            <div className="group flex items-center gap-4 bg-white/5 pl-1 pr-1 py-1 rounded-full border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer shadow-inner">
              <div className="relative">
                <div className="w-10 h-10 rounded-full border-2 border-indigo-400/50 overflow-hidden shadow-md transition-transform group-hover:scale-105">
                  {session?.user?.user_metadata?.avatar_url ? (
                    <img
                      src={session.user.user_metadata.avatar_url}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-black text-lg bg-gradient-to-br from-indigo-500 to-purple-500 uppercase">
                      {session?.user?.user_metadata?.full_name?.charAt(0) || "U"}
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-[#0F172A] rounded-full shadow-sm"></div>
              </div>

              <div className="flex flex-col mr-2">
                <span className="text-white font-bold text-sm tracking-tight leading-none group-hover:text-indigo-300 transition-colors">
                  {session?.user?.user_metadata?.full_name || 'Học viên'}
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[9px] text-indigo-400 font-black uppercase tracking-widest bg-indigo-400/10 px-1.5 py-0.5 rounded">Pro Player</span>
                  <button
                    onClick={handleLogout}
                    className="text-white/30 text-[9px] uppercase tracking-widest font-black hover:text-red-400 transition-colors"
                  >
                    Thoát
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              {/* Đăng nhập – Figma w=124 pill */}
              <button
                onClick={() => setShowLogin(true)}
                style={{
                  width: 124,
                  height: 36,
                  background: '#FFFFFF',
                  borderRadius: 9999,
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: "'Manrope', sans-serif",
                  fontWeight: 700,
                  fontSize: 16,
                  lineHeight: '24px',
                  color: '#0F172A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                className="transition-all hover:opacity-85 active:scale-95"
              >
                Đăng nhập
              </button>
              {/* Đăng ký – Figma w=135 pill + shadow */}
              <button
                onClick={() => appState.setShowSignUp?.(true)}
                style={{
                  width: 135,
                  height: 36,
                  background: '#FFFFFF',
                  borderRadius: 9999,
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: "'Manrope', sans-serif",
                  fontWeight: 700,
                  fontSize: 16,
                  lineHeight: '24px',
                  color: '#0F172A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0px 4px 6px -1px rgba(0,0,0,0.1), 0px 2px 4px -2px rgba(0,0,0,0.1)',
                }}
                className="transition-all hover:opacity-85 active:scale-95"
              >
                Đăng ký
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="w-full max-w-[1764px] flex flex-col pt-8 pb-[80px] px-6 gap-6 min-h-[1242px]">
        {/* Container */}
        <div className="flex flex-row items-start gap-6 w-full flex-1">

          {/* Aside - SideNavBar (Left Column) */}
          <div className="box-border flex flex-col items-start p-6 gap-4 w-[275px] h-[1049px] bg-white/40 border border-white/30 shadow-sm backdrop-blur-md rounded-xl shrink-0 overflow-y-auto relative z-50">
            {/* Header section in sidebar */}
            <div className="flex flex-col w-[225px] gap-4">
              {/* Stat 4 - Header */}
              <div className="flex flex-row items-center p-3 gap-4 w-full h-16 bg-white/40 rounded-lg shrink-0">
                <div className="flex justify-center items-center w-10 h-10 bg-[#F3E8FF] rounded-lg shrink-0">
                  <img src={background4} alt="icon" className="w-10 h-10 object-contain" />
                </div>
                <div className="font-sans font-bold text-base text-[#9333EA]">
                  Năm {Math.ceil(stats.time.day / 2)} - Học kì {stats.time.day % 2 === 0 ? 2 : 1}
                </div>
              </div>

              {/* Stat 1 - Năng lượng */}
              <div className="flex flex-row items-center p-3 gap-4 w-full h-16 bg-white/40 rounded-lg shrink-0">
                <div className="flex justify-center items-center w-10 h-10 bg-[#DBEAFE] rounded-lg shrink-0">
                  <img src={background1} alt="icon" className="w-10 h-10 object-contain" />
                </div>
                <div className="flex-1 h-2 bg-[#E2E8F0] rounded-full relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 bg-[#3B82F6] rounded-full" style={{ width: `${stats.energy}%` }}></div>
                </div>
                <div className="font-sans font-bold text-base text-[#2563EB] whitespace-nowrap">
                  {stats.energy}%
                </div>
              </div>

              {/* Stat 2 - Tiền */}
              <div className="flex flex-row items-center p-3 gap-4 w-full h-16 bg-white/40 rounded-lg shrink-0">
                <div className="flex justify-center items-center w-10 h-10 bg-[#DCFCE7] rounded-lg shrink-0">
                  <img src={background2} alt="icon" className="w-10 h-10 object-contain" />
                </div>
                <div className="font-sans font-bold text-base text-[#16A34A]">
                  {(stats.money / 1000).toFixed(0)}k
                </div>
              </div>

              {/* Stat 3 - Số buổi đã học */}
              <div className="flex flex-row items-center p-3 gap-4 w-full h-16 bg-white/40 rounded-lg shrink-0">
                <div className="flex justify-center items-center w-10 h-10 bg-[#F3E8FF] rounded-lg shrink-0">
                  <img src={background3} alt="icon" className="w-10 h-10 object-contain" />
                </div>
                <div className="font-sans font-bold text-base text-[#9333EA]">
                  {playerStats.attendanceCount}
                </div>
              </div>

              {/* Stat 6 - Số buổi vắng */}
              <div className="flex flex-row items-center p-3 gap-4 w-full h-16 bg-white/40 rounded-lg shrink-0">
                <div className="flex justify-center items-center w-10 h-10 bg-[#F3E8FF] rounded-lg shrink-0">
                  <img src={background6} alt="icon" className="w-[35px] h-[35px] object-contain" />
                </div>
                <div className="font-sans font-bold text-base text-[#FF383C]">
                  {playerStats.missedClasses}
                </div>
              </div>

              {/* Stat 5 - Đếm ngược thời gian */}
              <div className="flex flex-row items-center p-3 gap-4 w-full h-16 bg-white/40 rounded-lg shrink-0">
                <div className="flex justify-center items-center w-10 h-10 bg-[#F3E8FF] rounded-lg shrink-0">
                  <img src={background5} alt="icon" className="w-[42px] h-[42px] object-contain" />
                </div>
                <div className="font-sans font-bold text-base text-[#9333EA]">
                  {countdownTime}
                </div>
              </div>

              {/* Stat 7 - Thời gian năng lượng ở trạng thái tốt */}
              <div className="flex flex-row items-center p-3 gap-4 w-full h-16 bg-white/40 rounded-lg shrink-0">
                <div className="flex justify-center items-center w-10 h-10 bg-[#F3E8FF] rounded-lg shrink-0">
                  <img src={background7} alt="icon" className="w-10 h-10 object-contain transform scale-x-[-1]" />
                </div>
                <div className="font-sans font-bold text-base text-[#FF383C]">
                  {formatTime(playerStats.energyBuffTimer)}
                </div>
              </div>
            </div>

            {/* Debug Toggle */}
            <div className="mt-auto pt-4 w-full border-t border-white/20">
              <button
                onClick={() => setShowDebug(!showDebug)}
                className={`w-full py-3 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all border flex items-center justify-center gap-2 ${showDebug
                  ? 'bg-red-100 border-red-200 text-red-600 shadow-sm'
                  : 'bg-white/40 border-white/30 text-[#64748B] hover:bg-white/60'
                  }`}
              >
                {showDebug ? 'Tắt Debug Mode' : 'Bật Debug Mode'}
              </button>
            </div>
          </div>

          {/* GAME VIEWPORT */}
          <div
            ref={gameContainerRef}
            className="relative overflow-hidden shadow-md flex-1 h-[1049px] rounded-xl flex items-center justify-center isolate m-0 p-0 bg-slate-900 z-10"
          >
            {/* GAME CONTAINER (SCALED) */}
            <div
              className="relative overflow-hidden transform-gpu flex-shrink-0"
              style={{
                width: DESIGN_WIDTH,
                height: DESIGN_HEIGHT,
                transform: `scale(${scaleFactor})`,
                transformOrigin: 'center'
              }}
            >
              {!isGameStarted ? (
                <StartScreen onStart={() => setIsGameStarted(true)} />
              ) : (
                <>
                  {playerStats.isExpelled && (
                    <GameOver
                      onReset={() => {
                        resetGame();
                        setIsGameStarted(false);
                      }}
                      type="expelled"
                      title="Bạn đã bị đuổi học"
                      message={playerStats.expulsionReason === 'attendance'
                        ? "Vì vắng học quá 3 buổi, nhà trường đã ra quyết định thôi học đối với bạn."
                        : "Vì không đăng ký tín chỉ đúng hạn, nhà trường đã ra quyết định thôi học đối với bạn."
                      }
                    />
                  )}

                  {playerStats.isStroke && (
                    <GameOver
                      onReset={() => {
                        resetGame();
                        setIsGameStarted(false);
                      }}
                      type="stroke"
                      title="Đột quỵ không qua khỏi"
                      message="Vì học tập và làm việc quá sức mà không chú ý đến sức khỏe, bạn đã bị đột quỵ không qua khỏi. Hãy biết cân bằng cuộc sống!"
                    />
                  )}

                  {isCooking && <CookingOverlay progress={cookingProgress} />}
                  {isSleeping && <SleepOverlay progress={sleepProgress} />}
                  {isHospitalized && <HospitalOverlay progress={hospitalizationProgress} />}
                  {isTutoring && <TutoringOverlay progress={tutoringProgress} />}
                  {isWaiting && <WaitingOverlay progress={waitingProgress} />}

                  <ElectricityBillOverlay
                    bill={playerStats.electricityBill}
                    onPay={payElectricityBill}
                    money={stats.money}
                  />

                  {/* World Map */}
                  <div
                    className="absolute inset-0 z-10 isolate m-0 p-0"
                    style={{ width: MAP_CONFIG.WIDTH, height: MAP_CONFIG.HEIGHT }}
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const clickX = (e.clientX - rect.left) / scaleFactor;
                      const clickY = (e.clientY - rect.top) / scaleFactor;
                      console.log("Scaled Click:", clickX, clickY);
                    }}
                  >
                    <img
                      src={pathImage}
                      alt="Map Base"
                      className="absolute top-0 left-0 block w-full h-full object-cover"
                      style={{ zIndex: 0 }}
                    />

                    {LOCATIONS.map(loc => {
                      const d = loc.display;
                      const tFlip = d.rotation === 180 ? 'scaleX(-1)' : `rotate(${d.rotation || 0}deg)`;

                      const buildingBaseY = d.y + d.h * 0.75;
                      const playerFeetX = position.x + 10;
                      const playerFeetY = position.y + 50;

                      const isOccluded =
                        playerFeetX > d.x + d.w * 0.17 &&
                        playerFeetX < d.x + d.w * 0.83 &&
                        playerFeetY > d.y + d.h * 0.17 &&
                        playerFeetY <= buildingBaseY;

                      return (
                        <React.Fragment key={loc.id}>

                          <img
                            src={IMAGE_MAP[loc.image]}
                            alt={loc.name}
                            className="absolute transition-opacity duration-300 ease-in-out"
                            style={{
                              left: d.x,
                              top: d.y,
                              width: d.w,
                              height: d.h,
                              transform: tFlip,
                              transformOrigin: 'center',
                              zIndex: isOccluded ? 10000 + Math.floor(buildingBaseY) : Math.floor(buildingBaseY),
                              opacity: isOccluded ? 0.3 : 1
                            }}
                          />
                        </React.Fragment>
                      );
                    })}

                    {/* Hiển thị vùng va chạm (Obstacles) & Interactions (SVG Overlay) */}
                    <HitboxOverlay visible={showDebug} />

                    {/* Debug Interaction Point */}
                    {showDebug && (
                      playerStats.isRidingBicycle ? (
                        <div
                          style={{
                            position: 'absolute',
                            left: position.x + 10,
                            top: position.y + 50,
                            width: 40,
                            height: 4,
                            backgroundColor: 'red',
                            borderRadius: '2px',
                            transform: 'translate(-50%, -50%) rotate(30deg)',
                            zIndex: 3000,
                            pointerEvents: 'none',
                            boxShadow: '0 0 10px red'
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            position: 'absolute',
                            left: position.x + 10,
                            top: position.y + 50,
                            width: 8,
                            height: 8,
                            backgroundColor: 'red',
                            borderRadius: '50%',
                            transform: 'translate(-50%, -50%)',
                            zIndex: 3000,
                            pointerEvents: 'none',
                            boxShadow: '0 0 10px red'
                          }}
                        />
                      )
                    )}

                    {/* Player */}
                    <div
                      className="absolute overflow-visible flex items-end justify-center drop-shadow-2xl"
                      style={{
                        width: 20, height: 50, left: position.x, top: position.y,
                        zIndex: 5000
                      }}
                    >
                      {/* Bóng đổ (Shadow) */}
                      <div className="absolute bottom-[-2px] w-[110%] h-2 bg-black/40 rounded-[100%] blur-[1px]"></div>

                      {/* Sprite Khung hiển thị */}
                      <div
                        className="absolute bottom-0 h-full overflow-hidden"
                        style={{
                          width: playerStats.isRidingBicycle ? '60px' : '40px',
                          left: '50%',
                          marginLeft: playerStats.isRidingBicycle ? '-30px' : '-20px',
                          transform: `scaleX(${playerStats.isRidingBicycle
                            ? (direction === 'left' || direction === 'right' ? -1 : 1)
                            : (direction === 'left' || direction === 'down' ? -1 : 1)
                            })`
                        }}
                      >
                        <img
                          src={playerStats.isRidingBicycle
                            ? (direction === 'right' || direction === 'down' ? bikeDownImage : bikeUpImage)
                            : (direction === 'right' || direction === 'down' ? spriteRightImage : spriteUpImage)
                          }
                          alt="Character"
                          className="absolute top-0 left-0 max-w-none pointer-events-none"
                          style={{
                            height: '100%',
                            width: playerStats.isRidingBicycle ? '200%' : '400%',
                            transform: `translateX(-${(playerStats.isRidingBicycle ? frame % 2 : frame) * (playerStats.isRidingBicycle ? 50 : 25)}%)`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* UI Overlays (Constrained to Viewport) */}
            <div className="absolute inset-0 pointer-events-none z-[100]">
              {/* Notifications - Constrained and on top */}
              {!playerStats.isExpelled && !playerStats.isStroke && (
                <div className="absolute bottom-6 right-6 flex flex-col gap-3 w-full max-w-xs pointer-events-none z-[11000]">
                  {notifications.map(n => (
                    <div key={n.id} className="bg-slate-900/95 backdrop-blur-xl border border-white/10 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center justify-between gap-4 animate-in slide-in-from-right duration-500 pointer-events-auto">
                      <span className="text-sm font-bold leading-tight">{n.text}</span>
                      <button
                        onClick={() => setNotifications(prev => prev.filter(item => item.id !== n.id))}
                        className="p-1 hover:bg-white/10 rounded-full transition-colors flex-shrink-0"
                      >
                        <X className="w-4 h-4 text-white/40" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Exhausted Popup */}
              {showExhaustedPopup && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center backdrop-blur-sm pointer-events-auto z-[10500]">
                  <div className="bg-slate-900 border-2 border-red-500 p-8 rounded-[32px] max-w-sm text-center shadow-2xl animate-in zoom-in-95 duration-500">
                    <h3 className="text-2xl font-black text-red-500 uppercase mb-4 tracking-widest">CẢNH BÁO</h3>
                    <p className="text-white text-lg mb-8 leading-relaxed font-bold">
                      Bạn đã kiệt sức và được ai đó đưa đến bệnh viện!
                    </p>
                    <button
                      onClick={handleExhaustedOk}
                      className="bg-red-600 hover:bg-red-500 text-white font-black py-3 px-12 rounded-xl text-lg hover:scale-105 transition-all shadow-xl"
                    >
                      OK
                    </button>
                  </div>
                </div>
              )}

              {/* System Alert Popup */}
              {systemAlert && !playerStats.isExpelled && !playerStats.isStroke && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center backdrop-blur-sm pointer-events-auto z-[10500]">
                  <div className="bg-slate-900 border-2 p-8 rounded-[32px] max-w-sm text-center shadow-2xl animate-in zoom-in-95 duration-500"
                    style={{
                      borderColor: systemAlert.type === 'income' ? '#10B981' : (systemAlert.type === 'expense' ? '#F43F5E' : '#F59E0B'),
                      boxShadow: systemAlert.type === 'income' ? '0 0 50px rgba(16,185,129,0.2)' : (systemAlert.type === 'expense' ? '0 0 50px rgba(244,63,94,0.2)' : '0 0 50px rgba(245,158,11,0.2)')
                    }}>
                    <h3 className="text-2xl font-black uppercase mb-4 tracking-widest"
                      style={{ color: systemAlert.type === 'income' ? '#10B981' : (systemAlert.type === 'expense' ? '#F43F5E' : '#F59E0B') }}>
                      {systemAlert.title}
                    </h3>
                    <p className="text-white text-lg mb-8 leading-relaxed font-bold">
                      {systemAlert.message}
                    </p>
                    <button
                      onClick={() => {
                        if (systemAlert.onOk) systemAlert.onOk();
                        setSystemAlert(null);
                      }}
                      className="text-white font-black py-3 px-12 rounded-xl text-lg hover:scale-105 transition-all shadow-xl"
                      style={{ backgroundColor: systemAlert.type === 'income' ? '#059669' : (systemAlert.type === 'expense' ? '#E11D48' : '#D97706') }}
                    >
                      OK
                    </button>
                  </div>
                </div>
              )}

              {/* Tutor Alert */}
              {showTutorAlert && !playerStats.isExpelled && !playerStats.isStroke && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center backdrop-blur-sm pointer-events-auto z-[10500]">
                  <div className="bg-slate-900 border-2 border-indigo-500 p-8 rounded-[32px] max-w-sm text-center shadow-2xl animate-in zoom-in-95 duration-500">
                    <h3 className="text-2xl font-black text-indigo-500 uppercase mb-4 tracking-widest">THÔNG BÁO</h3>
                    <p className="text-white text-lg mb-8 leading-relaxed font-bold">
                      Nhà học sinh ở cạnh nhà bạn!
                    </p>
                    <button
                      onClick={() => setShowTutorAlert(false)}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-black py-3 px-12 rounded-xl text-lg hover:scale-105 transition-all shadow-xl"
                    >
                      OK
                    </button>
                  </div>
                </div>
              )}


              {/* Interaction Modal */}
              {isModalOpen && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-auto z-[200]">
                  <InteractionModal
                    location={activeLocation}
                    interactionStep={interactionStep}
                    setInteractionStep={setInteractionStep}
                    onClose={closeModal}
                    onAction={handleAction}
                    playerStats={playerStats}
                    stats={stats}
                    isClassStarting={isClassStarting}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* How to Play Section - Full Width */}
        <div className="flex flex-col items-start p-12 w-full min-h-[647px] bg-white/30 rounded-xl mt-[80px]">
          <div className="flex flex-col items-start gap-8 w-full">
            <div className="font-semibold text-2xl text-[#0B1C30]">Hướng dẫn chơi Student Life</div>

            <div className="flex flex-row justify-between items-stretch gap-6 w-full relative">
              {/* Học tập */}
              <div className="box-border flex flex-col items-center py-6 px-6 pb-11 w-full flex-1 bg-white border border-[#F1F5F9] shadow-sm rounded-xl">
                <div className="flex flex-col items-start pb-4 w-16 h-20">
                  <div className="flex justify-center items-center w-16 h-16 bg-[#EFF6FF] rounded-full">
                    <img src={studyImage} alt="Học tập" className="w-16 h-16 object-contain" />
                  </div>
                </div>
                <div className="flex flex-col items-start pb-2">
                  <div className="font-bold text-lg text-center text-[#0B1C30]">Học tập</div>
                </div>
                <div className="flex flex-col items-start px-1 w-full flex-1">
                  <p className="font-medium text-sm leading-5 text-[#64748B] text-left">
                    <span className="font-bold">Bước 1:</span> Đăng ký tín chỉ: Di chuyển đến Trường học để chọn số lượng tín chỉ và độ khó môn học.
                    <br /><br />
                    <span className="font-bold">Bước 2:</span> Học phí: Thanh toán ngay nếu đủ tiền. Nếu không, hóa đơn sẽ được gửi về cho phụ huynh.
                    <br /><br />
                    <span className="font-bold">Bước 3:</span> Hỗ trợ: Quay Về nhà để lấy tiền từ bố mẹ khi nợ học phí.
                    <br /><br />
                    <span className="font-bold">Bước 4:</span> Hoàn tất: Đem tiền quay lại Trường học để nộp học phí.
                    <br /><br />
                    <span className="font-bold">Bước 5:</span> Vào học: Sau khi hoàn thành thủ tục, bạn có thể bắt đầu vào học mỗi khi có lớp mở.
                  </p>
                </div>
              </div>

              {/* Việc làm */}
              <div className="box-border flex flex-col items-center py-6 px-6 pb-11 w-full flex-1 bg-white border border-[#F1F5F9] shadow-sm rounded-xl">
                <div className="flex flex-col items-start pb-4 w-16 h-20">
                  <div className="flex justify-center items-center w-16 h-16 bg-[#F0FDF4] rounded-full">
                    <img src={workImage} alt="Việc làm" className="w-16 h-16 object-contain" />
                  </div>
                </div>
                <div className="flex flex-col items-start pb-2">
                  <div className="font-bold text-lg text-center text-[#0B1C30]">Việc làm</div>
                </div>
                <div className="flex flex-col items-start px-2 w-full flex-1">
                  <p className="font-medium text-sm leading-5 text-[#64748B] text-left">
                    <span className="font-bold">Bước 1:</span> Tìm việc: Di chuyển đến trung tâm môi giới để tìm kiếm công việc phù hợp với năng lực của bạn.
                    <br /><br />
                    <span className="font-bold">Bước 2:</span> Tiếp nhận: Khi nhận việc, hệ thống sẽ thông báo cụ thể về mức lương, chi phí sức khỏe và phí môi giới (nếu có).
                    <br /><br />
                    <span className="font-bold">Bước 3:</span> Thanh toán phí: Thực hiện trả phí môi giới để nhận được địa chỉ nơi làm việc chính xác.
                    <br /><br />
                    <span className="font-bold">Bước 4:</span> Bắt đầu làm: Di chuyển đến địa chỉ đã được thông báo trên bản đồ để bắt đầu làm việc và kiếm thu nhập.
                  </p>
                </div>
              </div>

              {/* Sức khỏe */}
              <div className="box-border flex flex-col items-center py-6 px-6 pb-11 w-full flex-1 bg-white border border-[#F1F5F9] shadow-sm rounded-xl">
                <div className="flex flex-col items-start pb-4 w-16 h-20">
                  <div className="flex justify-center items-center w-16 h-16 bg-[#FEF2F2] rounded-full">
                    <img src={energyImage} alt="Sức khỏe" className="w-16 h-16 object-contain" />
                  </div>
                </div>
                <div className="flex flex-col items-start pb-2">
                  <div className="font-bold text-lg text-center text-[#0B1C30]">Sức khỏe</div>
                </div>
                <div className="flex flex-col items-start px-2 w-full flex-1">
                  <p className="font-medium text-sm leading-5 text-[#64748B] text-left">
                    <span className="font-bold">Bước 1:</span> Quản lý năng lượng: Mọi hoạt động di chuyển và làm việc đều tiêu tốn năng lượng. Nếu năng lượng ở mức yếu, bạn sẽ bị đình chỉ học tập và làm việc.
                    <br /><br />
                    <span className="font-bold">Bước 2:</span> Chọn nơi cư trú: Nếu bạn không thuê nhà trọ, năng lượng sẽ sụt giảm nhanh hơn.
                    <br /><br />
                    <span className="font-bold">Bước 3:</span> Nạp năng lượng tức thời: Di chuyển đến căn tin để mua đồ ăn và hồi phục thể lực ngay lập tức.
                    <br /><br />
                    <span className="font-bold">Bước 4:</span> Nghỉ ngơi dài hạn: ghé siêu thị mua thực phẩm về nhà trọ tự nấu hoặc quay về nhà ngủ để hồi phục hoàn toàn.
                    <br /><br />
                    <span className="font-bold">Bước 5:</span> Bảo trì thể lực: Đi Khám sức khỏe định kỳ để nhận hiệu ứng hỗ trợ, giúp năng lượng không bị tụt trong một khoảng thời gian nhất định.
                  </p>
                </div>
              </div>

              {/* Phương tiện */}
              <div className="box-border flex flex-col items-center py-6 px-6 pb-11 w-full flex-1 bg-white border border-[#F1F5F9] shadow-sm rounded-xl">
                <div className="flex flex-col items-start pb-4 w-16 h-20">
                  <div className="flex justify-center items-center w-16 h-16 bg-[#F8FAFC] rounded-full">
                    <img src={parkingImage} alt="Phương tiện" className="w-16 h-16 object-contain" />
                  </div>
                </div>
                <div className="flex flex-col items-start pb-2">
                  <div className="font-bold text-lg text-center text-[#0B1C30]">Phương tiện</div>
                </div>
                <div className="flex flex-col items-start px-1 w-full flex-1">
                  <p className="font-medium text-sm leading-5 text-[#64748B] text-left">
                    <span className="font-bold">Bước 1:</span> Sở hữu xe: Di chuyển đến Trạm bán xe để chọn mua phương tiện. Xe sẽ giúp bạn Di chuyển nhanh hơn đáng kể trên bản đồ so với việc đi bộ.
                    <br /><br />
                    <span className="font-bold">Bước 2:</span> Sử dụng bãi đỗ: Bạn có thể dừng và gửi phương tiện tại các Bãi đỗ xe được bố trí trên toàn thành phố.
                    <br /><br />
                    <span className="font-bold">Bước 3:</span> Chi phí vận hành: Khi đỗ xe tại bãi, bạn sẽ phải thanh toán một khoản Phí gửi xe.
                    <br /><br />
                    <span className="font-bold">Bước 4:</span> Quản lý phương tiện: Bạn có thể quay lại Bãi đỗ xe để lấy xe hoặc gửi xe vào Bất kỳ lúc nào để thuận tiện cho việc học tập và làm việc.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-row justify-center items-end px-12 pt-4 pb-0 w-full opacity-60">
          <div className="text-[#64748B] text-xs">2026 Student Life Simulation.</div>
        </div>

      </div>
    </div>
  );
}
