-- 1. Xóa trigger và function cũ nếu có
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- 2. Tạo function xử lý user mới
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  gen_username text;
  base_username text;
  is_taken boolean;
  counter integer := 0;
begin
  -- Lấy username từ metadata (nếu đăng ký bằng Email/Password)
  gen_username := new.raw_user_meta_data->>'username';

  -- Nếu không có username (đăng ký bằng Google), tự động tạo
  if gen_username is null or gen_username = '' then
    -- Ưu tiên lấy từ email (phần trước @)
    base_username := split_part(new.email, '@', 1);
    
    -- Nếu email quá ngắn hoặc không hợp lệ, lấy từ full_name
    if base_username is null or length(base_username) < 3 then
      base_username := lower(replace(new.raw_user_meta_data->>'full_name', ' ', '_'));
    end if;

    -- Fallback cuối cùng
    if base_username is null or base_username = '' then
      base_username := 'student';
    end if;

    gen_username := base_username;

    -- Vòng lặp kiểm tra trùng lặp và thêm hậu tố ngẫu nhiên
    loop
      select exists(select 1 from public.profiles where username = gen_username) into is_taken;
      if not is_taken then
        exit;
      end if;
      
      counter := counter + 1;
      gen_username := base_username || '_' || floor(random() * 1000)::text;
      
      -- Sau 10 lần thử vẫn trùng thì dùng 5 ký tự cuối của ID
      if counter > 10 then
         gen_username := base_username || '_' || substring(new.id::text from 1 for 5);
         exit;
      end if;
    end loop;
  end if;

  -- 3. Chèn vào bảng profiles
  insert into public.profiles (id, email, full_name, username, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    gen_username,
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update
  set 
    full_name = excluded.full_name,
    username = coalesce(profiles.username, excluded.username),
    avatar_url = excluded.avatar_url;
  
  return new;
end;
$$;

-- 3. Tạo trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
