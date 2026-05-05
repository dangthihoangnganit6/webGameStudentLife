/**
 * GoogleIcon – Logo chữ G của Google (4 màu chính thức).
 * Dùng: <GoogleIcon className="w-5 h-5" />
 */
export default function GoogleIcon({ className = 'w-5 h-5' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Blue – phần bên phải chữ G */}
      <path
        d="M23.52 12.273c0-.851-.076-1.67-.218-2.455H12v4.642h6.458a5.52 5.52 0 0 1-2.394 3.622v3.01h3.878c2.27-2.09 3.578-5.17 3.578-8.82Z"
        fill="#4285F4"
      />
      {/* Green – phần dưới */}
      <path
        d="M12 24c3.24 0 5.956-1.075 7.942-2.907l-3.878-3.011c-1.075.72-2.45 1.146-4.064 1.146-3.125 0-5.773-2.111-6.72-4.948H1.276v3.11A12 12 0 0 0 12 24Z"
        fill="#34A853"
      />
      {/* Yellow – phần trái */}
      <path
        d="M5.28 14.28A7.213 7.213 0 0 1 4.904 12c0-.792.136-1.562.376-2.28V6.61H1.276A12.003 12.003 0 0 0 0 12c0 1.936.464 3.766 1.276 5.39l4.004-3.11Z"
        fill="#FBBC05"
      />
      {/* Red – phần trên */}
      <path
        d="M12 4.772c1.762 0 3.344.605 4.587 1.794l3.442-3.442C17.951 1.19 15.235 0 12 0A12 12 0 0 0 1.276 6.61l4.004 3.11C6.227 6.883 8.875 4.772 12 4.772Z"
        fill="#EA4335"
      />
    </svg>
  );
}
