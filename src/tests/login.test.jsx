import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Login from '../components/Login';
import { supabase } from '../lib/supabaseClient';

// KHÔNG khai báo biến mock ở đây nữa vì sẽ bị lỗi Hoisting

// Mock supabase client
vi.mock('../lib/supabaseClient', () => {
  // Định nghĩa các hàm mock bên trong factory để tránh lỗi hoisting
  const mockSingle = vi.fn();
  const mockEq = vi.fn(() => ({ single: mockSingle }));
  const mockSelect = vi.fn(() => ({ eq: mockEq }));
  const mockFrom = vi.fn(() => ({ select: mockSelect }));

  return {
    supabase: {
      from: mockFrom,
      auth: {
        signInWithPassword: vi.fn()
      }
    }
  };
});

describe('Login Component Logic & UI', () => {
  const mockOnLoginSuccess = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('nên hiển thị lỗi nếu bỏ trống tên tài khoản hoặc mật khẩu', async () => {
    render(<Login onLoginSuccess={mockOnLoginSuccess} />);
    
    const submitButton = screen.getByRole('button', { name: /Đăng nhập/i });
    fireEvent.click(submitButton);

    // Kiểm tra thông báo lỗi tiếng Việt từ logic handleSubmit
    expect(await screen.findByText(/Vui lòng nhập email\/tên tài khoản và mật khẩu!/i)).toBeTruthy();
  });

  it('nên tự động chuyển đổi username sang email nếu input không chứa "@"', async () => {
    // Để can thiệp vào kết quả mock bên trong chain, ta truy cập thông qua supabase.from()
    const mockedFrom = supabase.from('profiles');
    const mockedSingle = mockedFrom.select().eq().single;

    // Giả lập tìm thấy email từ username
    mockedSingle.mockResolvedValue({ 
      data: { email: 'test@example.com' }, 
      error: null 
    });

    // Giả lập đăng nhập thành công[cite: 26]
    supabase.auth.signInWithPassword.mockResolvedValue({ 
      data: { session: { user: { id: '123' } } }, 
      error: null 
    });

    render(<Login onLoginSuccess={mockOnLoginSuccess} />);
    
    fireEvent.change(screen.getByPlaceholderText(/Nhập email hoặc tên người dùng/i), { 
      target: { value: 'user123' } 
    });
    fireEvent.change(screen.getByPlaceholderText(/••••••••/i), { 
      target: { value: 'password123' } 
    });

    const submitButton = screen.getByRole('button', { name: /Đăng nhập/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      // Kiểm tra luồng tra cứu profile rồi mới đăng nhập[cite: 26]
      expect(supabase.from).toHaveBeenCalledWith('profiles');
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });
  });

  it('nên hiển thị mật khẩu khi bấm vào icon Eye', () => {
    render(<Login />);
    const passwordInput = screen.getByPlaceholderText(/••••••••/i);
    const toggleButton = screen.getByLabelText(/Hiện\/ẩn mật khẩu/i);

    expect(passwordInput.type).toBe('password'); // Mặc định ẩn[cite: 26]
    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe('text'); // Sau khi click thì hiện[cite: 26]
  });

  it('nên gọi onClose khi bấm nút "Quay lại"', () => {
    render(<Login onClose={mockOnClose} />);
    
    const backButton = screen.getByRole('button', { name: /Quay lại/i });
    fireEvent.click(backButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });
});