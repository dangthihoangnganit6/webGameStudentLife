import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../App';
import React from 'react';

// Mocks to prevent heavy canvas/image loading errors in jsdom
vi.mock('../assets/path.png', () => ({ default: 'path.png' }));
vi.mock('../assets/hospital.png', () => ({ default: 'hospital.png' }));
vi.mock('../assets/university.png', () => ({ default: 'university.png' }));
vi.mock('../assets/apartment.png', () => ({ default: 'apartment.png' }));
vi.mock('../assets/supermarket.png', () => ({ default: 'supermarket.png' }));
vi.mock('../assets/home.png', () => ({ default: 'home.png' }));
vi.mock('../assets/job_center.png', () => ({ default: 'job_center.png' }));
vi.mock('../assets/sprite_up.png', () => ({ default: 'sprite_up.png' }));
vi.mock('../assets/sprite_right.png', () => ({ default: 'sprite_right.png' }));
vi.mock('../assets/stadium.png', () => ({ default: 'stadium.png' }));
vi.mock('../assets/home_of_student.png', () => ({ default: 'home_of_student.png' }));

describe('App Render & Variable Checks', () => {
  it('should render the App component without crashing due to undefined variables', () => {
    // Nếu có biến nào bị xoá nhầm (như showExhaustedPopup), render sẽ throw lỗi
    const { container } = render(<App />);
    expect(container).toBeTruthy();
  });
});
