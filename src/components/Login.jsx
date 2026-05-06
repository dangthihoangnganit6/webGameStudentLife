import React, { useState } from 'react';
import GoogleIcon from './icons/GoogleIcon';
import UserIcon from './icons/UserIcon';
import LockIcon from './icons/LockIcon';
import { EyeIcon, EyeOffIcon } from './icons/EyeIcon';
import backgroundLoginImg from '../assets/background_login.png';
import { supabase } from '../lib/supabaseClient';

/**
 * Login Page – dựng theo Figma spec (CSS đã được cung cấp).
 * Props:
 *   onLoginSuccess(session) – gọi khi đăng nhập thành công
 *   onGoogleLogin()         – gọi khi bấm "Tiếp tục với Google"
 */
export default function Login({ onLoginSuccess, onGoogleLogin, onClose, onSignUpClick }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('Vui lòng nhập email/tên tài khoản và mật khẩu!');
      return;
    }

    setLoading(true);

    // Supabase signInWithPassword dùng email
    // Nếu user nhập username thay vì email → tra cứu email từ profiles
    let emailToLogin = username.trim();

    // Nếu input không chứa @ → là username, cần tra cứu email từ bảng profiles
    if (!emailToLogin.includes('@')) {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('username', emailToLogin)
        .single();

      if (profileError || !profileData?.email) {
        setLoading(false);
        setError('Không tìm thấy tài khoản với tên người dùng này.');
        console.log('DEBUG: Profile lookup failed:', profileError?.message);
        return;
      }

      // Dùng email tìm được từ profiles
      emailToLogin = profileData.email;
      console.log('DEBUG: Username → email resolved:', emailToLogin);
    }

    // Đăng nhập bằng email + password
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: emailToLogin,
      password,
    });

    setLoading(false);

    if (signInError) {
      console.log('DEBUG: Sign in error:', signInError.message, 'Status:', signInError.status);
      const msg = signInError.message.toLowerCase();
      if (msg.includes('invalid login credentials') || msg.includes('invalid')) {
        setError('Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại!');
      } else if (msg.includes('email not confirmed')) {
        setError('Tài khoản chưa xác nhận email. Hãy kiểm tra hộp thư.');
      } else {
        setError(`Đăng nhập thất bại: ${signInError.message}`);
      }
      return;
    }

    // Thành công!
    console.log('DEBUG: Sign in success! Session:', data.session);
    console.log('DEBUG: User:', data.session?.user);
    onLoginSuccess?.(data.session);
  };

  return (
    <div
      className="flex flex-col"
      style={{
        position: 'fixed',
        inset: 0,
        overflowY: 'auto',
        background: '#F1F5F9',
        fontFamily: "'Manrope', sans-serif",
        zIndex: 9999,
      }}
    >
      {/* ─── Google Fonts ─────────────────────────────────── */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700&display=swap');`}</style>

      {/* ═══════════════════════════════════════════════════
          TOP NAV BAR
      ════════════════════════════════════════════════════ */}
      <header
        className="flex items-center justify-between px-6 shrink-0"
        style={{
          height: 64,
          background: '#0F172A',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0px 1px 2px rgba(0,0,0,0.05)',
        }}
      >
        {/* Logo / App name */}
        <span
          className="font-bold text-white select-none"
          style={{ fontSize: 20, lineHeight: '28px', letterSpacing: '-0.5px' }}
        >
          StudentLife
        </span>

        {/* Right buttons – Figma: "Quay lại" (124px) + "Đăng ký" (135px, shadow) */}
        <div className="relative flex items-center" style={{ width: 276, height: 36 }}>

          {/* Button: Quay lại – gọi onClose để đóng Login overlay */}
          <button
            onClick={onClose}
            className="absolute font-bold transition-all hover:bg-gray-100 active:scale-95 flex items-center justify-center"
            style={{
              left: 0,
              top: 0,
              width: 124,
              height: 36,
              background: '#FFFFFF',
              borderRadius: 9999,
              fontSize: 16,
              lineHeight: '24px',
              color: '#0F172A',
              fontFamily: 'Manrope, sans-serif',
            }}
          >
            Quay lại
          </button>

          {/* Button: Đăng ký */}
          <button
            onClick={onSignUpClick}
            className="absolute font-bold transition-all hover:bg-gray-100 active:scale-95 flex items-center justify-center"
            style={{
              left: 140,
              top: 0,
              width: 135,
              height: 36,
              background: '#FFFFFF',
              borderRadius: 9999,
              fontSize: 16,
              lineHeight: '24px',
              color: '#0F172A',
              fontFamily: 'Manrope, sans-serif',
              boxShadow: '0px 4px 6px -1px rgba(0,0,0,0.1), 0px 2px 4px -2px rgba(0,0,0,0.1)',
            }}
          >
            Đăng ký
          </button>

        </div>
      </header>

      {/* ═══════════════════════════════════════════════════
          MAIN CONTENT CANVAS
      ════════════════════════════════════════════════════ */}
      <main
        className="flex-1 flex items-center justify-center px-4 py-8"
        style={{ background: '#E6E9D7' }}
      >
        {/* Background+Shadow card */}
        <div
          className="w-full flex overflow-hidden"
          style={{
            maxWidth: 1400,
            minHeight: 700,
            background: '#FFFFFF',
            boxShadow:
              '0px 20px 25px -5px rgba(0,0,0,0.1), 0px 8px 10px -6px rgba(0,0,0,0.1)',
            borderRadius: 12,
          }}
        >
          {/* ─── LEFT SIDE: Visual / Context ─────────────── */}
          <div
            className="relative flex-1 flex flex-col justify-end overflow-hidden"
            style={{ background: '#0F172A', minWidth: 0 }}
          >
            {/* Ảnh nền background_login.png */}
            <img
              src={backgroundLoginImg}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              style={{ opacity: 0.85 }}
              aria-hidden="true"
            />

            {/* Dark gradient overlay at bottom */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(0deg, #0F172A 0%, rgba(15,23,42,0) 50%, rgba(15,23,42,0) 100%)',
              }}
              aria-hidden="true"
            />

            {/* Text content */}
            <div className="relative z-10 p-12">
              <h2
                className="font-bold text-white mb-4"
                style={{ fontSize: 40, lineHeight: '48px' }}
              >
                Chào mừng trở lại
              </h2>
              <p
                style={{
                  fontSize: 22,
                  lineHeight: '32px',
                  color: '#CBD5E1',
                  fontWeight: 400,
                  maxWidth: 500,
                }}
              >
                Quản lý cuộc sống sinh viên của bạn với sự chính xác và hiệu quả tối ưu.
              </p>
            </div>
          </div>

          {/* ─── RIGHT SIDE: Login Form ───────────────────── */}
          <div
            className="flex flex-col justify-center flex-1"
            style={{ minWidth: 0, padding: '64px 64px' }}
          >
            {/* Heading */}
            <div className="mb-8">
              <h1
                className="font-bold"
                style={{ fontSize: 32, lineHeight: '38px', color: '#0B1C30' }}
              >
                Đăng nhập
              </h1>
              <p
                className="mt-2"
                style={{ fontSize: 14, lineHeight: '21px', color: '#434655' }}
              >
                Vui lòng nhập thông tin để truy cập hệ thống
              </p>
            </div>

            {/* ── FORM ── */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-0">
              {/* Username field */}
              <div className="mb-4">
                <label
                  htmlFor="login-username"
                  className="block mb-2"
                  style={{ fontSize: 18, lineHeight: '24px', color: '#434655' }}
                >
                  Tên tài khoản
                </label>
                <div className="relative">
                  {/* Icon người dùng từ Figma SVG */}
                  <span
                    className="absolute flex items-center justify-center"
                    style={{ left: 14, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18 }}
                    aria-hidden="true"
                  >
                    <UserIcon className="w-3 h-3" fill="#737686" />
                  </span>
                  <input
                    id="login-username"
                    type="text"
                    placeholder="Nhập email hoặc tên người dùng"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={(e) => { e.stopPropagation(); if (e.key === ' ') e.preventDefault(); }}
                    className="w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                    style={{
                      height: 50,
                      background: '#EFF4FF',
                      border: '1px solid #C3C6D7',
                      borderRadius: 8,
                      padding: '13px 16px 13px 40px',
                      fontSize: 16,
                      lineHeight: '22px',
                      color: '#0B1C30',
                      fontFamily: 'Manrope, sans-serif',
                    }}
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="mb-3">
                <div className="flex justify-between items-center mb-2">
                  <label
                    htmlFor="login-password"
                    style={{ fontSize: 18, lineHeight: '24px', color: '#434655' }}
                  >
                    Mật khẩu
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="hover:underline"
                    style={{ fontSize: 16, lineHeight: '24px', color: '#004AC6' }}
                  >
                    Quên mật khẩu?
                  </button>
                </div>
                <div className="relative">
                  {/* Icon khoá từ Figma SVG */}
                  <span
                    className="absolute flex items-center justify-center"
                    style={{ left: 14, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18 }}
                    aria-hidden="true"
                  >
                    <LockIcon className="w-3 h-4" fill="#737686" />
                  </span>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => { e.stopPropagation(); if (e.key === ' ') e.preventDefault(); }}
                    className="w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                    style={{
                      height: 50,
                      background: '#EFF4FF',
                      border: '1px solid #C3C6D7',
                      borderRadius: 8,
                      padding: '13px 44px 13px 40px',
                      fontSize: 16,
                      lineHeight: '22px',
                      color: '#0B1C30',
                      fontFamily: 'Manrope, sans-serif',
                    }}
                  />
                  {/* Icon hiện/ẩn mật khẩu */}
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute flex items-center justify-center hover:opacity-70 transition-opacity"
                    style={{ right: 14, top: '50%', transform: 'translateY(-50%)' }}
                    aria-label="Hiện/ẩn mật khẩu"
                  >
                    {showPassword
                      ? <EyeOffIcon className="w-4 h-4" fill="#737686" />
                      : <EyeIcon className="w-4 h-4" fill="#737686" />}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center gap-2 py-2 mb-4">
                <input
                  id="login-remember"
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="cursor-pointer"
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 4,
                    border: '1px solid #C3C6D7',
                    accentColor: '#006C49',
                  }}
                />
                <label
                  htmlFor="login-remember"
                  className="cursor-pointer select-none"
                  style={{ fontSize: 20, lineHeight: '32px', color: '#434655' }}
                >
                  Ghi nhớ đăng nhập
                </label>
              </div>

              {/* Error message */}
              {error && (
                <p
                  className="mb-3 px-3 py-2 rounded-lg text-sm font-semibold"
                  style={{ background: '#FEE2E2', color: '#DC2626', fontSize: 14 }}
                >
                  {error}
                </p>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  height: 65,
                  background: '#006C49',
                  boxShadow: '0px 1px 2px rgba(0,0,0,0.05)',
                  borderRadius: 8,
                  color: '#FFFFFF',
                  fontSize: 24,
                  lineHeight: '26px',
                  fontFamily: 'Manrope, sans-serif',
                }}
              >
                {loading ? 'ĐANG XỬ LÝ...' : 'Đăng nhập'}
              </button>
            </form>

            {/* ── Divider "Hoặc" ── */}
            <div className="relative flex items-center my-8">
              <div
                className="flex-1"
                style={{ height: 1, background: '#C3C6D7' }}
              />
              <div
                className="px-2"
                style={{ background: '#FFFFFF' }}
              >
                <span
                  className="font-semibold"
                  style={{
                    fontSize: 20,
                    lineHeight: '12px',
                    letterSpacing: '0.6px',
                    color: '#434655',
                  }}
                >
                  Hoặc
                </span>
              </div>
              <div
                className="flex-1"
                style={{ height: 1, background: '#C3C6D7' }}
              />
            </div>

            {/* ── Google button ── */}
            <button
              type="button"
              onClick={onGoogleLogin}
              className="w-full flex items-center justify-center gap-3 font-medium transition-all hover:bg-slate-50 active:scale-[0.98]"
              style={{
                height: 76,
                background: '#FFFFFF',
                border: '1px solid #C3C6D7',
                borderRadius: 8,
                color: '#0B1C30',
                fontSize: 19,
                lineHeight: '24px',
                fontFamily: 'Manrope, sans-serif',
              }}
            >
              {/* Google logo SVG chính thức */}
              <GoogleIcon className="w-5 h-5 shrink-0" />
              Tiếp tục với Google
            </button>

            {/* ── Register link ── */}
            <div className="mt-8 flex justify-center">
              <p style={{ fontSize: 20, lineHeight: '24px', color: '#434655' }}>
                Chưa có tài khoản?{' '}
                <span
                  className="cursor-pointer hover:underline font-semibold"
                  style={{ color: '#004AC6' }}
                  onClick={onSignUpClick}
                >
                  Đăng ký ngay
                </span>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* ═══════════════════════════════════════════════════
          FOOTER META
      ════════════════════════════════════════════════════ */}
      <footer
        className="flex flex-col items-center gap-2 py-8 px-6 shrink-0"
        style={{ background: '#F1F5F9' }}
      >
        <p style={{ fontSize: 16, lineHeight: '24px', color: '#737686' }}>
          © 2026 - Student Life Management
        </p>
        <div className="flex gap-6">
          {['Điều khoản dịch vụ', 'Chính sách bảo mật', 'Liên hệ'].map((link) => (
            <a
              key={link}
              href="#"
              className="hover:underline"
              style={{ fontSize: 16, lineHeight: '24px', color: '#737686' }}
            >
              {link}
            </a>
          ))}
        </div>
      </footer>

      {/* ─── Humorous Forgot Password Modal ─── */}
      {showForgotModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div 
            className="w-full max-w-lg bg-white rounded-[24px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            {/* Modal Header */}
            <div className="bg-slate-50 px-8 py-6 border-b border-slate-100">
              <h3 className="text-2xl font-bold text-slate-900">Quên mật khẩu hả bạn ei?</h3>
            </div>

            {/* Modal Body */}
            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">1</div>
                  <p className="text-slate-600 leading-relaxed pt-1">
                    <span className="font-bold text-slate-900">Phương án 1:</span> Đăng ký bằng Google đi cho đời thanh thản, Google lo hết, tôi không phải giữ chìa khóa giùm bạn.
                  </p>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center font-bold">2</div>
                  <p className="text-slate-600 leading-relaxed pt-1">
                    <span className="font-bold text-slate-900">Phương án 2:</span> Vì chủ thớt còn đang chạy ăn từng bữa (và dùng gói Supabase/Email free), nên phí gửi mail xác nhận là một sự xa xỉ.
                  </p>
                </div>
              </div>

              <div className="bg-slate-900 rounded-2xl p-6 text-white italic">
                <span className="font-bold text-emerald-400 not-italic block mb-1">Kết luận:</span>
                Quên thì coi như mất acc, tạo cái mới coi như làm lại cuộc đời. Lần sau nhớ dùng Google OAuth nhé! ✌️
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-6 bg-slate-50 flex flex-col gap-3">
              <button
                onClick={() => {
                  setShowForgotModal(false);
                  onGoogleLogin?.();
                }}
                className="w-full bg-[#006C49] hover:bg-[#005a3d] text-white font-bold py-4 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <GoogleIcon className="w-5 h-5 invert" />
                Quay lại đăng nhập bằng Google
              </button>
              <button
                onClick={() => setShowForgotModal(false)}
                className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold py-3 rounded-xl transition-all"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
