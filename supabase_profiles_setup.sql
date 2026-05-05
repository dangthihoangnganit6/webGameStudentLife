-- ============================================================
-- Supabase SQL: Tạo bảng profiles + trigger tự động cho đăng ký
-- Dự án: Vùng Vẫy (Student Life)
-- Chạy đoạn SQL này trong Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Tạo bảng profiles
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name  TEXT,
  username   TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Bật Row Level Security (RLS) cho bảng profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Cho phép user đọc profile của chính mình
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Cho phép user cập nhật profile của chính mình
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Policy: Cho phép insert khi id trùng với user đang đăng nhập
-- (cần thiết cho trigger hoạt động với service_role, nhưng thêm để an toàn)
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 2. Tạo hàm handle_new_user()
-- ─────────────────────────────────────────────────────────────
-- Hàm này tự động trích xuất full_name và username từ
-- raw_user_meta_data của bản ghi auth.users mới tạo,
-- rồi chèn vào bảng public.profiles.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER          -- Chạy với quyền owner (bỏ qua RLS)
SET search_path = public  -- Tránh lỗ hổng search_path injection
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, username)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'username'
  );
  RETURN NEW;
END;
$$;

-- 3. Tạo Trigger
-- ─────────────────────────────────────────────────────────────
-- Kích hoạt hàm handle_new_user() ngay sau khi có bản ghi mới
-- được INSERT vào bảng auth.users (= ngay khi đăng ký thành công)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- ✅ XONG! Sau khi chạy, mỗi lần user đăng ký:
--    auth.users → trigger → profiles row tự động tạo
-- ============================================================
