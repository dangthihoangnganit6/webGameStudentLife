import React, { useState } from 'react';
import GoogleIcon from './icons/GoogleIcon';
import { EyeIcon, EyeOffIcon } from './icons/EyeIcon';
import backgroundLoginImg from '../assets/background_login.png';
import { supabase } from '../lib/supabaseClient';

/**
 * SignUp Page – dựng theo Figma spec "sign_up".
 * Props:
 *   onSignUpSuccess()  – gọi khi đăng ký thành công
 *   onGoogleLogin()    – gọi khi bấm "Tiếp tục với Google"
 *   onClose()          – đóng overlay, quay lại game
 *   onLoginClick()     – chuyển sang trang đăng nhập
 */
export default function SignUp({ onSignUpSuccess, onGoogleLogin, onClose, onLoginClick }) {
  const [fullName, setFullName]               = useState('');
  const [username, setUsername]               = useState('');
  const [email, setEmail]                     = useState('');
  const [password, setPassword]               = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword]       = useState(false);
  const [error, setError]                     = useState('');
  const [success, setSuccess]                 = useState('');
  const [loading, setLoading]                 = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // ── Validation ──────────────────────────────────────────
    if (!fullName.trim() || !username.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Vui lòng điền đầy đủ tất cả các trường!');
      return;
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp. Hãy kiểm tra lại!');
      return;
    }
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    // ── Supabase signUp ──────────────────────────────────────
    setLoading(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          username:  username.trim(),
        },
      },
    });
    setLoading(false);

    if (signUpError) {
      // Chuyển error tiếng Anh từ Supabase sang thông báo tiếng Việt
      const msg = signUpError.message.toLowerCase();
      if (msg.includes('already registered') || msg.includes('already exists')) {
        setError('Email này đã được đăng ký. Hãy thử đăng nhập hoặc dùng email khác.');
      } else if (msg.includes('invalid email')) {
        setError('Địa chỉ email không hợp lệ.');
      } else if (msg.includes('password')) {
        setError('Mật khẩu không đáp ứng yêu cầu. Hãy dùng mật khẩu mạnh hơn.');
      } else {
        setError(`Đăng ký thất bại: ${signUpError.message}`);
      }
      return;
    }

    // Supabase trả về user nhưng chưa xác nhận email
    if (data?.user && !data.session) {
      setSuccess('Đăng ký thành công! Hãy kiểm tra email để xác nhận tài khoản trước khi đăng nhập.');
      return;
    }

    // Đã xác nhận ngay (email confirm tắt trong Supabase settings)
    onSignUpSuccess?.();
  };

  // ── Shared style tokens (scaled từ Figma 2576px → responsive) ──────────────
  const font = "'Manrope', sans-serif";

  return (
    <div
      className="flex flex-col"
      style={{
        position: 'fixed',
        inset: 0,
        overflowY: 'auto',
        background: '#F1F5F9',
        fontFamily: font,
        zIndex: 9999,
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&display=swap');`}</style>

      {/* ═══════════════════════════════════════════════════
          HEADER – TopAppBar
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
        {/* Logo */}
        <span
          className="font-extrabold text-white select-none"
          style={{ fontSize: 20, lineHeight: '28px', letterSpacing: '-0.5px' }}
        >
          StudentLife
        </span>

        {/* Right buttons: Quay lại + Đăng nhập */}
        <div className="relative flex items-center" style={{ width: 276, height: 36 }}>
          <button
            onClick={onClose}
            className="absolute font-bold transition-all hover:bg-gray-100 active:scale-95 flex items-center justify-center"
            style={{
              left: 0, top: 0, width: 124, height: 36,
              background: '#FFFFFF', borderRadius: 9999,
              fontSize: 16, lineHeight: '24px', color: '#0F172A', fontFamily: font,
            }}
          >
            Quay lại
          </button>
          <button
            onClick={onLoginClick}
            className="absolute font-bold transition-all hover:bg-gray-100 active:scale-95 flex items-center justify-center"
            style={{
              left: 140, top: 0, width: 135, height: 36,
              background: '#FFFFFF', borderRadius: 9999,
              fontSize: 16, lineHeight: '24px', color: '#0F172A', fontFamily: font,
              boxShadow: '0px 4px 6px -1px rgba(0,0,0,0.1), 0px 2px 4px -2px rgba(0,0,0,0.1)',
            }}
          >
            Đăng nhập
          </button>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════
          MAIN – E6E9D6 background
      ════════════════════════════════════════════════════ */}
      <main
        className="flex-1 flex items-center justify-center px-4 py-12"
        style={{ background: '#E6E9D6' }}
      >
        {/* Background+Shadow card – 2 cột */}
        <div
          className="w-full flex overflow-hidden"
          style={{
            maxWidth: 1400,
            minHeight: 720,
            background: '#FFFFFF',
            boxShadow: '0px 20px 25px -5px rgba(0,0,0,0.1), 0px 8px 10px -6px rgba(0,0,0,0.1)',
            borderRadius: 12,
          }}
        >

          {/* ── LEFT SIDE: Visual / Context ─────────────── */}
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

            {/* Gradient overlay */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(0deg, #0F172A 0%, rgba(15,23,42,0.4) 50%, rgba(15,23,42,0) 100%)',
              }}
              aria-hidden="true"
            />

            {/* Text */}
            <div className="relative z-10 p-12">
              <h2
                className="font-bold text-white mb-4"
                style={{ fontSize: 40, lineHeight: '48px' }}
              >
                Kiến tạo tương lai sinh viên
              </h2>
              <p style={{ fontSize: 20, lineHeight: '32px', color: '#CBD5E1', maxWidth: 500 }}>
                Xây dựng đế chế học thuật của riêng bạn, quản lý ký túc xá và kết nối hàng ngàn
                sinh viên trong thế giới Student Life.
              </p>
            </div>
          </div>

          {/* ── RIGHT SIDE: Sign-up Form ─────────────────── */}
          <div
            className="flex flex-col justify-center flex-1"
            style={{ minWidth: 0, padding: '48px 56px' }}
          >
            {/* Heading */}
            <div className="mb-8">
              <h1
                className="font-bold"
                style={{ fontSize: 32, lineHeight: '40px', color: '#0F172A' }}
              >
                Tạo tài khoản
              </h1>
              <p className="mt-2" style={{ fontSize: 15, lineHeight: '24px', color: '#64748B' }}>
                Bắt đầu hành trình quản lý học đường chuyên nghiệp ngay hôm nay.
              </p>
            </div>

            {/* ── FORM ── */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-0">

              {/* Row 1: Họ và tên + Tên tài khoản (side by side) */}
              <div className="flex gap-4 mb-5">

                {/* Họ và tên */}
                <div className="flex-1 flex flex-col gap-1">
                  <label
                    htmlFor="signup-fullname"
                    style={{ fontSize: 13, fontWeight: 600, color: '#475569', letterSpacing: '0.6px' }}
                  >
                    HỌ VÀ TÊN
                  </label>
                  <input
                    id="signup-fullname"
                    type="text"
                    placeholder="Nguyễn Văn A"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                    className="w-full focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                    style={{
                      height: 52,
                      background: '#FFFFFF',
                      border: '1.5px solid #E2E8F0',
                      borderRadius: 9,
                      padding: '0 18px',
                      fontSize: 16,
                      color: '#0B1C30',
                      fontFamily: font,
                    }}
                  />
                </div>

                {/* Tên tài khoản */}
                <div className="flex-1 flex flex-col gap-1">
                  <label
                    htmlFor="signup-username"
                    style={{ fontSize: 13, fontWeight: 600, color: '#475569', letterSpacing: '0.6px' }}
                  >
                    TÊN TÀI KHOẢN
                  </label>
                  <input
                    id="signup-username"
                    type="text"
                    placeholder="username123"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={(e) => { e.stopPropagation(); if (e.key === ' ') e.preventDefault(); }}
                    className="w-full focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                    style={{
                      height: 52,
                      background: '#FFFFFF',
                      border: '1.5px solid #E2E8F0',
                      borderRadius: 9,
                      padding: '0 18px',
                      fontSize: 16,
                      color: '#0B1C30',
                      fontFamily: font,
                    }}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1 mb-5">
                <label
                  htmlFor="signup-email"
                  style={{ fontSize: 13, fontWeight: 600, color: '#475569', letterSpacing: '0.6px' }}
                >
                  EMAIL
                </label>
                <input
                  id="signup-email"
                  type="email"
                  placeholder="example@studentlife.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => { e.stopPropagation(); if (e.key === ' ') e.preventDefault(); }}
                  className="w-full focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                  style={{
                    height: 52,
                    background: '#FFFFFF',
                    border: '1.5px solid #E2E8F0',
                    borderRadius: 9,
                    padding: '0 18px',
                    fontSize: 16,
                    color: '#0B1C30',
                    fontFamily: font,
                  }}
                />
              </div>

              {/* Mật khẩu */}
              <div className="flex flex-col gap-1 mb-5">
                <label
                  htmlFor="signup-password"
                  style={{ fontSize: 13, fontWeight: 600, color: '#475569', letterSpacing: '0.6px' }}
                >
                  MẬT KHẨU
                </label>
                <div className="relative">
                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => { e.stopPropagation(); if (e.key === ' ') e.preventDefault(); }}
                    className="w-full focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                    style={{
                      height: 52,
                      background: '#FFFFFF',
                      border: '1.5px solid #E2E8F0',
                      borderRadius: 9,
                      padding: '0 48px 0 18px',
                      fontSize: 16,
                      color: '#0B1C30',
                      fontFamily: font,
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute flex items-center justify-center hover:opacity-70 transition-opacity"
                    style={{ right: 14, top: '50%', transform: 'translateY(-50%)' }}
                    aria-label="Hiện/ẩn mật khẩu"
                  >
                    {showPassword
                      ? <EyeOffIcon className="w-5 h-4" fill="#94A3B8" />
                      : <EyeIcon    className="w-5 h-4" fill="#94A3B8" />}
                  </button>
                </div>
              </div>

              {/* Xác nhận mật khẩu */}
              <div className="flex flex-col gap-1 mb-6">
                <label
                  htmlFor="signup-confirm"
                  style={{ fontSize: 13, fontWeight: 600, color: '#475569', letterSpacing: '0.6px' }}
                >
                  XÁC NHẬN MẬT KHẨU
                </label>
                <input
                  id="signup-confirm"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyDown={(e) => { e.stopPropagation(); if (e.key === ' ') e.preventDefault(); }}
                  className="w-full focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                  style={{
                    height: 52,
                    background: '#FFFFFF',
                    border: '1.5px solid #E2E8F0',
                    borderRadius: 9,
                    padding: '0 18px',
                    fontSize: 16,
                    color: '#0B1C30',
                    fontFamily: font,
                  }}
                />
              </div>

              {/* Error */}
              {error && (
                <p
                  className="mb-4 px-3 py-2 rounded-lg text-sm font-semibold"
                  style={{ background: '#FEE2E2', color: '#DC2626' }}
                >
                  {error}
                </p>
              )}

              {/* Success */}
              {success && (
                <p
                  className="mb-4 px-3 py-2 rounded-lg text-sm font-semibold"
                  style={{ background: '#D1FAE5', color: '#065F46' }}
                >
                  {success}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full font-semibold transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  height: 52,
                  background: '#006C49',
                  borderRadius: 9,
                  color: '#FFFFFF',
                  fontSize: 15,
                  letterSpacing: '0.8px',
                  fontWeight: 600,
                  fontFamily: font,
                  boxShadow:
                    '0px 10px 15px -3px rgba(0,108,73,0.2), 0px 4px 6px -4px rgba(0,108,73,0.2)',
                }}
              >
                {loading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG KÝ TÀI KHOẢN'}
              </button>
            </form>

            {/* ── Divider HOẶC ── */}
            <div className="relative flex items-center my-6">
              <div className="flex-1" style={{ height: 1.5, background: '#E2E8F0' }} />
              <span
                className="px-5 font-semibold"
                style={{ fontSize: 13, letterSpacing: '1.5px', color: '#94A3B8' }}
              >
                HOẶC
              </span>
              <div className="flex-1" style={{ height: 1.5, background: '#E2E8F0' }} />
            </div>

            {/* ── Google button ── */}
            <button
              type="button"
              onClick={onGoogleLogin}
              className="w-full flex items-center justify-center gap-4 font-normal transition-all hover:bg-slate-50 active:scale-[0.98]"
              style={{
                height: 56,
                background: '#FFFFFF',
                border: '1.5px solid #E2E8F0',
                borderRadius: 9,
                color: '#334155',
                fontSize: 17,
                fontFamily: font,
              }}
            >
              <GoogleIcon className="w-6 h-6 shrink-0" />
              Tiếp tục với Google
            </button>

            {/* ── Login link ── */}
            <div className="mt-7 flex justify-center">
              <p style={{ fontSize: 15, lineHeight: '24px', color: '#64748B' }}>
                Đã có tài khoản?{' '}
                <span
                  className="cursor-pointer hover:underline font-semibold"
                  style={{ color: '#004AC6' }}
                  onClick={onLoginClick}
                >
                  Đăng nhập ngay
                </span>
              </p>
            </div>
          </div>

        </div>
      </main>

      {/* ═══════════════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════════════════ */}
      <footer
        className="flex flex-col items-center gap-2 py-8 px-6 shrink-0"
        style={{
          background: '#F8FAFC',
          borderTop: '1.5px solid #E2E8F0',
        }}
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

    </div>
  );
}
