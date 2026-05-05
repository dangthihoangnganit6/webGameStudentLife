import { createClient } from '@supabase/supabase-js';

// Đảm bảo lấy đúng biến môi trường Vite và xóa dấu gạch chéo ở cuối URL nếu có
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '');
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Lỗi: Thiếu Supabase URL hoặc Anon Key! Hãy kiểm tra file .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const signInWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
      queryParams: {
        prompt: 'select_account',
      },
    },
  });
  if (error) {
    console.error('Lỗi đăng nhập Google:', error.message);
    alert('Đăng nhập thất bại, vui lòng kiểm tra lại cấu hình Supabase URL trong .env');
  }
};
