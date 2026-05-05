/**
 * EyeIcon & EyeOffIcon – Icon hiện/ẩn mật khẩu.
 * Dùng:
 *   <EyeIcon className="w-4 h-4" fill="#737686" />
 *   <EyeOffIcon className="w-4 h-4" fill="#737686" />
 */

export function EyeIcon({ className = 'w-4 h-4', fill = 'currentColor' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M10 0C5.454 0 1.573 2.878 0 7c1.573 4.122 5.454 7 10 7s8.427-2.878 10-7C18.427 2.878 14.546 0 10 0Z"
        fill={fill}
        fillOpacity="0.15"
      />
      <path
        d="M10 11.667A4.667 4.667 0 1 0 10 2.333a4.667 4.667 0 0 0 0 9.334Z"
        fill={fill}
      />
      <circle cx="10" cy="7" r="2" fill="white" />
    </svg>
  );
}

export function EyeOffIcon({ className = 'w-4 h-4', fill = 'currentColor' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M2 2L18 18M8.34 8.34A3 3 0 0 0 10 13a3 3 0 0 0 2.83-3.95M6.22 6.22C4.27 7.42 2.75 9.1 2 11c1.57 4.12 5.45 7 10 7a9.93 9.93 0 0 0 4.77-1.22M10 4a9.93 9.93 0 0 1 8 4 9.95 9.95 0 0 1-1.68 2.12"
        stroke={fill}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
