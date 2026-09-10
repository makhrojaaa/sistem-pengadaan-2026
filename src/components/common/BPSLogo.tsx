import React from 'react';

interface BPSLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textColor?: 'light' | 'dark';
  className?: string;
}

export const BPSLogo: React.FC<BPSLogoProps> = ({
  size = 'md',
  showText = false,
  textColor = 'light',
  className = '',
}) => {
  const sizeMap = {
    sm: { icon: 28, text: 'text-xs', sub: 'text-[9px]' },
    md: { icon: 38, text: 'text-sm', sub: 'text-[10px]' },
    lg: { icon: 48, text: 'text-base', sub: 'text-xs' },
    xl: { icon: 64, text: 'text-lg', sub: 'text-xs' },
  };

  const dim = sizeMap[size];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Official BPS Emblem (Tricolor: Blue, Green, Orange) */}
      <svg
        width={dim.icon}
        height={dim.icon}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0 drop-shadow-sm"
        aria-label="Logo Resmi Badan Pusat Statistik"
      >
        {/* Top-Left Segment: BPS Blue (#005C9E) */}
        <path
          d="M 47 10 
             C 27.5 11.2 12.8 26.2 10.5 45.5 
             C 10.1 48.5 10.5 50 12.5 50 
             C 14.5 50 25.5 35 34.5 28.5 
             C 41 23.5 47 20 47 10 Z"
          fill="#005C9E"
        />
        <path
          d="M 48 18 
             C 32 20 20 32 18 47 
             L 28 47 
             C 30 37 38 29 48 27 Z"
          fill="#0077C8"
        />

        {/* Top-Right Segment: BPS Green (#43A047 / #48A942) */}
        <path
          d="M 53 10 
             C 53 20 59 23.5 65.5 28.5 
             C 74.5 35 85.5 50 87.5 50 
             C 89.5 50 89.9 48.5 89.5 45.5 
             C 87.2 26.2 72.5 11.2 53 10 Z"
          fill="#43A047"
        />
        <path
          d="M 52 27 
             C 62 29 70 37 72 47 
             L 82 47 
             C 80 32 68 20 52 18 Z"
          fill="#54B848"
        />

        {/* Central Dynamic Cross / Bar Element */}
        <path
          d="M 33 53 
             L 47 53 
             L 47 37 
             L 53 37 
             L 53 53 
             L 67 53 
             L 67 59 
             L 53 59 
             L 53 72 
             L 47 72 
             L 47 59 
             L 33 59 Z"
          fill="#005C9E"
        />

        {/* Bottom Segment: BPS Vibrant Orange (#F58220 / #F7931E) */}
        <path
          d="M 17 56 
             C 19.5 75 34.5 89 53 89.8 
             C 53 78 47 74 41 69 
             C 32 62 22 56 17 56 Z"
          fill="#F58220"
        />
        <path
          d="M 83 56 
             C 78 56 68 62 59 69 
             C 53 74 47 78 47 89.8 
             C 65.5 89 80.5 75 83 56 Z"
          fill="#FF9E1B"
        />
        <path
          d="M 32 76 
             C 38 81 44 83 50 83 
             C 56 83 62 81 68 76 
             L 65 69 
             C 60 74 55 76 50 76 
             C 45 76 40 74 35 69 Z"
          fill="#E65100"
        />
      </svg>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-black tracking-tight leading-none ${dim.text} ${
                textColor === 'light' ? 'text-white' : 'text-slate-900'
              }`}
            >
              BADAN PUSAT STATISTIK
            </span>
          </div>
          <span
            className={`font-semibold tracking-wider uppercase mt-0.5 leading-none ${dim.sub} ${
              textColor === 'light' ? 'text-orange-400' : 'text-blue-700'
            }`}
          >
            KABUPATEN TANAH DATAR
          </span>
        </div>
      )}
    </div>
  );
};
