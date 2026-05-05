/**
 * LockIcon – Icon ổ khoá cho trường mật khẩu.
 * Dùng: <LockIcon className="w-3 h-4" fill="#737686" />
 */
export default function LockIcon({ className = 'w-3 h-4', fill = 'currentColor' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 12 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Thân ổ khoá */}
      <rect x="0" y="6" width="12" height="10" rx="2" fill={fill} />
      {/* Vòng cung phía trên */}
      <path
        d="M2 6V4.5C2 2.015 10 2.015 10 4.5V6"
        stroke={fill}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Lỗ khoá */}
      <circle cx="6" cy="11" r="1.5" fill="white" />
    </svg>
  );
}
