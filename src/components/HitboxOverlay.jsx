import React from 'react';

export default function HitboxOverlay({ visible }) {
  if (!visible) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-[2000]">
      <svg width="1440" height="1024" viewBox="0 0 1440 1024" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clipPath="url(#clip0_101_75)">
          <g filter="url(#filter0_d_101_75)">
            <path d="M191.27 240L270.77 291.5L388.77 366.5L296.27 416.5L223.27 376L198.52 353.75L149.645 322.625L99.27 291.5L191.27 240Z" fill="#D9D9D9"/>
            <path d="M270.498 291.92L270.502 291.922L387.782 366.464L296.274 415.929L223.562 375.59L198.854 353.378L198.823 353.35L198.789 353.328L149.913 322.203L149.907 322.2L100.256 291.52L191.251 240.582L270.498 291.92Z" stroke="black"/>
          </g>
          <path d="M731.735 49L842.77 111L731.735 182.5L678.296 148L627.77 121L731.735 49Z" fill="#D9D9D9"/>
          <path d="M286.27 305L462.27 213.5L508.27 247.5L533.77 267.5L351.77 369L286.27 305Z" fill="#D9D9D9"/>
          <path d="M1187.77 124.5L1440.27 265.5L1187.77 411L921.77 255.5L1187.77 124.5Z" fill="#D9D9D9"/>
          <path d="M554.27 512.5L572.77 448L711.27 372.5L944.27 516L757.27 629.5L554.27 512.5Z" fill="#D9D9D9"/>
          <path d="M1115.77 660L1294.27 769L1140.27 856.5L961.77 757L1115.77 660Z" fill="#D9D9D9"/>
          <path d="M1185.27 916L1321.27 828.5L1479.27 928L1341.27 1008L1185.27 916Z" fill="#D9D9D9"/>
          <path d="M309.27 817L465.27 722L539.27 765.5L382.77 858L309.27 817Z" fill="#D9D9D9"/>
          <path d="M590.77 919L710.77 853L880.27 939.5L750.27 1017L590.77 919Z" fill="#D9D9D9"/>
          <path d="M46.77 916L304.77 768L392.27 808L124.77 961L46.77 916Z" fill="#D9D9D9"/>
          <path d="M289.365 849.5L338.77 837.5L285.27 930L248.77 915L289.365 849.5Z" fill="#D9D9D9"/>
          <path d="M1315.77 524.5L1442.27 452.5V549.5V598L1315.77 524.5Z" fill="#D9D9D9"/>
          <path d="M1.76999 534V487L79.77 534L1.76999 577V534Z" fill="#D9D9D9"/>
          <path opacity="0.3" d="M623.27 892.5L758.635 949.237L706.127 1040.18L552.77 939.5L623.27 892.5Z" fill="#FF0000"/>
          <rect opacity="0.3" x="741.77" y="562.79" width="165.579" height="74" transform="rotate(-30 741.77 562.79)" fill="#FF0000"/>
          <rect opacity="0.3" x="1024.81" y="708.7" width="116" height="91.6224" transform="rotate(30 1024.81 708.7)" fill="#F30000"/>
          <rect opacity="0.3" x="1393.08" y="463.796" width="104.046" height="98.631" transform="rotate(30 1393.08 463.796)" fill="#FF0000"/>
          <rect opacity="0.3" x="718" y="102.933" width="87.8652" height="77.1384" transform="rotate(-30 718 102.933)" fill="#FF0000"/>
          <rect opacity="0.3" x="1272.94" y="875.544" width="131.552" height="82.6615" transform="rotate(30 1272.94 875.544)" fill="#FF0000"/>
          <path opacity="0.3" d="M615.77 472L719.82 532.073L650.27 641L548.77 584.5L615.77 472Z" fill="#FF0000"/>
          <rect opacity="0.3" x="392.144" y="776.016" width="92.5861" height="72.9416" transform="rotate(-30 392.144 776.016)" fill="#FF0000"/>
          <rect opacity="0.3" x="103" y="927" width="188" height="50.8487" transform="rotate(-30 103 927)" fill="#FF0B0B"/>
          <rect opacity="0.3" x="1018.14" y="211.567" width="125.185" height="135.103" transform="rotate(30 1018.14 211.567)" fill="#FF0000"/>
          <rect opacity="0.3" x="343" y="312.855" width="144.45" height="94.1648" transform="rotate(-30 343 312.855)" fill="#FF0000"/>
        </g>
        <defs>
          <filter id="filter0_d_101_75" x="95.27" y="240" width="297.5" height="184.5" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
            <feOffset dy="4"/>
            <feGaussianBlur stdDeviation="2"/>
            <feComposite in2="hardAlpha" operator="out"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_101_75"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_101_75" result="shape"/>
          </filter>
          <clipPath id="clip0_101_75">
            <rect width="1440" height="1024" fill="white" transform="translate(-0.230011)"/>
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}
