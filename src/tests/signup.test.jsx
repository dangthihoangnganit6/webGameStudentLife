import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SignUp from '../components/SignUp';
import { supabase } from '../lib/supabaseClient';

// Mock supabase client
vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      signUp: vi.fn()
    }
  }
}));

describe('SignUp Component Logic & UI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('nên thực hiện đăng ký thành công và hiển thị thông báo xác nhận email', async () => {
    supabase.auth.signUp.mockResolvedValue({
      data: { user: { id: '123' }, session: null },
      error: null
    });

    render(<SignUp />);
    
    // Sử dụng Placeholder hoặc chính xác Text để tránh trùng lặp
    fireEvent.change(screen.getByPlaceholderText(/Nguyễn Văn A/i), { target: { value: 'Nguyễn Văn A' } });
    fireEvent.change(screen.getByPlaceholderText(/username123/i), { target: { value: 'vana123' } });
    fireEvent.change(screen.getByPlaceholderText(/example@studentlife.com/i), { target: { value: 'vana@gmail.com' } });
    
    // SỬA LỖI TRÙNG LẶP: Dùng getByLabelText với chuỗi chính xác thay vì regex chung chung
    fireEvent.change(screen.getByLabelText(/^MẬT KHẨU$/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/XÁC NHẬN MẬT KHẨU/i), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: /ĐĂNG KÝ TÀI KHOẢN/i }));

    await waitFor(() => {
      expect(supabase.auth.signUp).toHaveBeenCalled();
      // Kiểm tra thông báo thành công xuất hiện trong DOM
      expect(screen.getByText(/Hãy kiểm tra email để xác nhận tài khoản/i)).toBeTruthy();
    });
  });

  it('nên hiển thị lỗi tiếng Việt khi email đã tồn tại trong hệ thống', async () => {
    // SỬA LỖI KHÔNG TÌM THẤY: Đảm bảo error message trả về đúng định dạng mà SignUp.jsx xử lý[cite: 27]
    supabase.auth.signUp.mockResolvedValue({
      data: null,
      error: { message: 'already registered' } 
    });

    render(<SignUp />);
    
    // Điền nhanh thông tin hợp lệ để trigger hàm handleSubmit[cite: 27]
    fireEvent.change(screen.getByPlaceholderText(/Nguyễn Văn A/i), { target: { value: 'User Test' } });
    fireEvent.change(screen.getByPlaceholderText(/username123/i), { target: { value: 'usertest' } });
    fireEvent.change(screen.getByPlaceholderText(/example@studentlife.com/i), { target: { value: 'test@gmail.com' } });
    fireEvent.change(screen.getByLabelText(/^MẬT KHẨU$/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/XÁC NHẬN MẬT KHẨU/i), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: /ĐĂNG KÝ TÀI KHOẢN/i }));

    // Đợi thông báo lỗi xuất hiện (findByText tự động bọc trong waitFor)[cite: 27]
    const errorMsg = await screen.findByText(/Email này đã được đăng ký/i);
    expect(errorMsg).toBeTruthy();
  });
});