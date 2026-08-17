import React from 'react';

/**
 * Official Somali National University (Jaamacadda Ummadda Soomaaliyeed) Emblem Logo Component
 */
const SnuLogo = ({ className = "w-10 h-10", showText = false, textClassName = "text-white" }) => {
  return (
    <div className="inline-flex items-center gap-3">
      <svg
        viewBox="0 0 400 480"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${className} shrink-0 drop-shadow-[0_4px_12px_rgba(2,132,199,0.35)] transition-transform hover:scale-105 duration-300`}
      >
        <defs>
          {/* Blue Shield Gradient */}
          <linearGradient id="snuSkyGrad" x1="200" y1="50" x2="200" y2="400" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="50%" stopColor="#0EA5E9" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>

          {/* Gold Laurel & Scales Gradient */}
          <linearGradient id="snuGoldGrad" x1="0" y1="0" x2="400" y2="480" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="40%" stopColor="#F59E0B" />
            <stop offset="80%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#92400E" />
          </linearGradient>

          {/* Crimson Ribbon Gradient */}
          <linearGradient id="snuCrimsonGrad" x1="50" y1="400" x2="350" y2="460" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#B91C1C" />
            <stop offset="50%" stopColor="#881337" />
            <stop offset="100%" stopColor="#7F1D1D" />
          </linearGradient>

          {/* Book Page Shading */}
          <linearGradient id="bookPageGrad" x1="100" y1="200" x2="300" y2="340" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="85%" stopColor="#F1F5F9" />
            <stop offset="100%" stopColor="#E2E8F0" />
          </linearGradient>

          {/* Beacon / Radiant Sun Gradient */}
          <linearGradient id="beaconGrad" x1="200" y1="80" x2="200" y2="280" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FDBA74" />
            <stop offset="50%" stopColor="#FB923C" />
            <stop offset="100%" stopColor="#E29578" />
          </linearGradient>

          {/* Gold Outline Glow Filter */}
          <filter id="goldGlow" x="-10%" y="-10%" width="120%" height="120%" filterUnits="userSpaceOnUse">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#D97706" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* 1. Main Egg/Oval Crest Shield (Somali Sky Blue) */}
        <path
          d="M 200 45 C 310 110, 360 220, 320 395 C 275 425, 125 425, 80 395 C 40 220, 90 110, 200 45 Z"
          fill="url(#snuSkyGrad)"
          stroke="url(#snuGoldGrad)"
          strokeWidth="6"
        />

        {/* 2. Beacon Pillar & Sunburst Rays */}
        <g opacity="0.95">
          {/* Beacon Column in center */}
          <path
            d="M 182 95 L 218 95 L 214 380 L 186 380 Z"
            fill="url(#beaconGrad)"
          />
          {/* Sun Rays radiating outwards */}
          <path d="M 200 190 L 120 145 M 200 190 L 135 115 M 200 190 L 160 90 M 200 190 L 240 90 M 200 190 L 265 115 M 200 190 L 280 145"
            stroke="url(#snuGoldGrad)"
            strokeWidth="5.5"
            strokeLinecap="round"
          />
          {/* Rising Sun Half Circle */}
          <circle cx="200" cy="190" r="32" fill="#92400E" opacity="0.85" />
          <circle cx="200" cy="190" r="32" fill="url(#snuGoldGrad)" opacity="0.6" />
        </g>

        {/* 3. Open Book of Knowledge */}
        <g filter="url(#goldGlow)">
          {/* Book Base Outline / Cover */}
          <path
            d="M 100 200 C 145 210, 185 225, 200 232 C 215 225, 255 210, 300 200 L 292 345 C 250 355, 215 342, 200 338 C 185 342, 150 355, 108 345 Z"
            fill="#92400E"
            stroke="url(#snuGoldGrad)"
            strokeWidth="4"
          />
          {/* Book Left Page */}
          <path
            d="M 104 205 C 148 214, 184 227, 198 233 L 198 335 C 184 329, 148 316, 112 340 Z"
            fill="url(#bookPageGrad)"
            stroke="#CBD5E1"
            strokeWidth="2"
          />
          {/* Book Right Page */}
          <path
            d="M 296 205 C 252 214, 216 227, 202 233 L 202 335 C 216 329, 252 316, 288 340 Z"
            fill="url(#bookPageGrad)"
            stroke="#CBD5E1"
            strokeWidth="2"
          />
          {/* Spine Crease */}
          <line x1="200" y1="233" x2="200" y2="336" stroke="#94A3B8" strokeWidth="2.5" />
        </g>

        {/* 4. Scales of Justice (Overlaying the Book) */}
        <g stroke="url(#snuGoldGrad)" strokeLinecap="round" strokeLinejoin="round" fill="none">
          {/* Center Column */}
          <line x1="200" y1="120" x2="200" y2="230" strokeWidth="6" />
          
          {/* Horizontal Beam Bar */}
          <line x1="120" y1="140" x2="280" y2="140" strokeWidth="6.5" />
          <circle cx="120" cy="140" r="4.5" fill="#D97706" />
          <circle cx="200" cy="140" r="6" fill="#FDE047" />
          <circle cx="280" cy="140" r="4.5" fill="#D97706" />

          {/* Left Pan Chains */}
          <line x1="120" y1="140" x2="100" y2="245" strokeWidth="3" />
          <line x1="120" y1="140" x2="142" y2="245" strokeWidth="3" />
          {/* Left Pan */}
          <path d="M 92 245 C 92 275, 150 275, 150 245 Z" fill="url(#snuGoldGrad)" strokeWidth="3.5" />

          {/* Right Pan Chains */}
          <line x1="280" y1="140" x2="258" y2="245" strokeWidth="3" />
          <line x1="280" y1="140" x2="300" y2="245" strokeWidth="3" />
          {/* Right Pan */}
          <path d="M 250 245 C 250 275, 308 275, 308 245 Z" fill="url(#snuGoldGrad)" strokeWidth="3.5" />
        </g>

        {/* 5. Twin Golden Laurel / Wheat Stalks (Left & Right framing) */}
        {/* Left Laurel */}
        <g fill="url(#snuGoldGrad)" stroke="#B45309" strokeWidth="1">
          <path d="M 75 390 C 35 270, 60 140, 160 55 C 150 70, 75 160, 85 380 Z" opacity="0.4" />
          {/* Wheat grains left */}
          <ellipse cx="68" cy="330" rx="14" ry="24" transform="rotate(-30 68 330)" />
          <ellipse cx="55" cy="275" rx="14" ry="24" transform="rotate(-20 55 275)" />
          <ellipse cx="52" cy="215" rx="13" ry="23" transform="rotate(-10 52 215)" />
          <ellipse cx="60" cy="160" rx="13" ry="23" transform="rotate(5 60 160)" />
          <ellipse cx="80" cy="115" rx="12" ry="22" transform="rotate(22 80 115)" />
          <ellipse cx="115" cy="80" rx="11" ry="20" transform="rotate(38 115 80)" />
          <ellipse cx="155" cy="58" rx="10" ry="18" transform="rotate(55 155 58)" />
        </g>

        {/* Right Laurel */}
        <g fill="url(#snuGoldGrad)" stroke="#B45309" strokeWidth="1">
          <path d="M 325 390 C 365 270, 340 140, 240 55 C 250 70, 325 160, 315 380 Z" opacity="0.4" />
          {/* Wheat grains right */}
          <ellipse cx="332" cy="330" rx="14" ry="24" transform="rotate(30 332 330)" />
          <ellipse cx="345" cy="275" rx="14" ry="24" transform="rotate(20 345 275)" />
          <ellipse cx="348" cy="215" rx="13" ry="23" transform="rotate(10 348 215)" />
          <ellipse cx="340" cy="160" rx="13" ry="23" transform="rotate(-5 340 160)" />
          <ellipse cx="320" cy="115" rx="12" ry="22" transform="rotate(-22 320 115)" />
          <ellipse cx="285" cy="80" rx="11" ry="20" transform="rotate(-38 285 80)" />
          <ellipse cx="245" cy="58" rx="10" ry="18" transform="rotate(-55 245 58)" />
        </g>

        {/* 6. White Somali Star at Apex */}
        <g filter="url(#goldGlow)">
          <path
            d="M 200 12 L 208 34 L 232 34 L 213 48 L 220 70 L 200 56 L 180 70 L 187 48 L 168 34 L 192 34 Z"
            fill="#FFFFFF"
            stroke="url(#snuGoldGrad)"
            strokeWidth="2.5"
          />
        </g>

        {/* 7. Crimson Ribbon Banner at bottom */}
        <g>
          {/* Left ribbon tail */}
          <path d="M 40 435 L 75 410 L 85 440 L 50 460 Z" fill="#7F1D1D" stroke="url(#snuGoldGrad)" strokeWidth="2" />
          {/* Right ribbon tail */}
          <path d="M 360 435 L 325 410 L 315 440 L 350 460 Z" fill="#7F1D1D" stroke="url(#snuGoldGrad)" strokeWidth="2" />
          
          {/* Main Curved Banner */}
          <path
            d="M 65 420 C 130 400, 270 400, 335 420 C 345 442, 330 455, 310 458 C 240 442, 160 442, 90 458 C 70 455, 55 442, 65 420 Z"
            fill="url(#snuCrimsonGrad)"
            stroke="url(#snuGoldGrad)"
            strokeWidth="3.5"
          />
          {/* Inner banner text path */}
          <text
            x="200"
            y="432"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="15"
            fontWeight="bold"
            letterSpacing="1.2"
            fontFamily="sans-serif"
          >
            JAAMACADDA UMMADDA
          </text>
          <text
            x="200"
            y="449"
            textAnchor="middle"
            fill="#FDE047"
            fontSize="12.5"
            fontWeight="bold"
            letterSpacing="2"
            fontFamily="sans-serif"
          >
            SOOMAALIYEED
          </text>
        </g>
      </svg>

      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold tracking-tight text-base leading-tight ${textClassName}`}>
            SNU AI Assistant
          </span>
          <span className="text-[11px] font-medium text-sky-400/90 tracking-wide uppercase">
            Jaamacadda Ummadda Soomaaliyeed
          </span>
        </div>
      )}
    </div>
  );
};

export default SnuLogo;
