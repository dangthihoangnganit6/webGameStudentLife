/**
 * UserIcon – Icon người dùng trích từ Figma SVG (đã chuẩn hoá toạ độ).
 * Dùng: <UserIcon className="w-3 h-3" fill="#737686" />
 */
export default function UserIcon({ className = 'w-3 h-3', fill = 'currentColor' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Đầu (circle) */}
      <path
        d="M6 6C5.18 6 4.47 5.706 3.88 5.119C3.29 4.531 3 3.825 3 3C3 2.175 3.29 1.469 3.88 0.881C4.47 0.294 5.18 0 6 0C6.82 0 7.53 0.294 8.12 0.881C8.71 1.469 9 2.175 9 3C9 3.825 8.71 4.531 8.12 5.119C7.53 5.706 6.82 6 6 6Z"
        fill={fill}
      />
      {/* Thân (body arc) */}
      <path
        d="M0 12V9.9C0 9.475 0.11 9.084 0.33 8.728C0.55 8.372 0.84 8.1 1.2 7.912C1.98 7.525 2.76 7.234 3.56 7.041C4.36 6.847 5.18 6.75 6 6.75C6.82 6.75 7.64 6.847 8.44 7.041C9.24 7.234 10.03 7.525 10.8 7.912C11.16 8.1 11.45 8.372 11.67 8.728C11.89 9.084 12 9.475 12 9.9V12H0Z"
        fill={fill}
      />
    </svg>
  );
}
