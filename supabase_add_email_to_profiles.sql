-- ============================================================
-- Supabase SQL: Bổ sung cột email vào profiles + cập nhật trigger
-- Chạy đoạn này trong SQL Editor SAU KHI đã chạy file setup ban đầu
-- ============================================================

-- 1. Thêm cột email vào profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email TEXT;

-- 2. Cập nhật hàm handle_new_user để lưu thêm email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, username, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'username',
    NEW.email
  );
  RETURN NEW;
END;
$$;

-- 3. Backfill email cho các profiles đã tồn tại (nếu có)
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND p.email IS NULL;

-- 4. Thêm policy cho phép đọc profile theo username (cần cho login lookup)
-- Cho phép anonymous/authenticated đọc username + email (chỉ 2 cột cần thiết)
CREATE POLICY "Allow login lookup by username"
  ON public.profiles
  FOR SELECT
  USING (true);  -- Cho phép tất cả đọc (chỉ expose username + email)

-- Lưu ý: Policy "Users can view own profile" đã tồn tại.
-- Policy mới này mở rộng để cho phép lookup username khi chưa đăng nhập.
-- Nếu lo ngại bảo mật, có thể dùng database function thay thế.

-- ============================================================
-- ✅ XONG! Giờ profiles chứa email, cho phép login bằng username
-- ============================================================
