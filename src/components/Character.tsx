import React from 'react';

interface CharacterProps {
  color: string;
  name: string;
  isAlive: boolean;
  isAccused: boolean;
  isProtected: boolean;
  x: number;
  y: number;
  size?: number;
  onClick?: () => void;
  isSelected?: boolean;
  showName?: boolean;
  isNight?: boolean;
  animDelay?: number;
}

export const Character: React.FC<CharacterProps> = ({
  color,
  name,
  isAlive,
  isAccused,
  isProtected,
  x,
  y,
  size = 48,
  onClick,
  isSelected,
  showName = true,
  isNight = false,
  animDelay = 0,
}) => {
  const opacity = isAlive ? 1 : 0.3;
  const bodyColor = isAlive ? color : '#888';
  
  return (
    <div
      className="absolute flex flex-col items-center transition-all duration-1000 ease-in-out cursor-pointer group"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -50%)',
        opacity,
        zIndex: isSelected ? 50 : 10,
      }}
      onClick={onClick}
    >
      {isAccused && isAlive && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 animate-bounce">
          <span className="text-2xl">🔥</span>
        </div>
      )}
      
      {isProtected && isAlive && (
        <div className="absolute -top-2 -right-2 animate-pulse">
          <span className="text-lg">🛡️</span>
        </div>
      )}
      
      {isSelected && (
        <div 
          className="absolute rounded-full animate-ping"
          style={{
            width: size + 16,
            height: size + 16,
            border: `3px solid ${color}`,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
      )}
      
      <div
        className="relative transition-transform duration-200 hover:scale-110"
        style={{
          animation: `bob 2s ease-in-out infinite`,
          animationDelay: `${animDelay}s`,
        }}
      >
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
          <ellipse cx="32" cy="42" rx="18" ry="20" fill={bodyColor} />
          <circle cx="32" cy="22" r="14" fill={bodyColor} />
          <circle cx="27" cy="20" r="3" fill="white" />
          <circle cx="37" cy="20" r="3" fill="white" />
          <circle cx="28" cy="20" r="1.5" fill="#1a1a2e" />
          <circle cx="38" cy="20" r="1.5" fill="#1a1a2e" />
          {isAlive ? (
            <path d="M27 27 Q32 31 37 27" stroke="#1a1a2e" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          ) : (
            <path d="M27 29 Q32 26 37 29" stroke="#1a1a2e" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          )}
          {isAlive && (
            <>
              <circle cx="22" cy="24" r="3" fill="#FF9999" opacity="0.4" />
              <circle cx="42" cy="24" r="3" fill="#FF9999" opacity="0.4" />
            </>
          )}
          {!isAlive && (
            <>
              <path d="M25 18 L29 22 M29 18 L25 22" stroke="#1a1a2e" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M35 18 L39 22 M39 18 L35 22" stroke="#1a1a2e" strokeWidth="1.5" strokeLinecap="round" />
            </>
          )}
        </svg>
        
        {isNight && isAlive && (
          <div
            className="absolute inset-0 rounded-full opacity-20 blur-md"
            style={{ backgroundColor: color }}
          />
        )}
      </div>
      
      {showName && (
        <div
          className="mt-1 px-2 py-0.5 rounded-full text-xs font-bold text-white shadow-md whitespace-nowrap"
          style={{ backgroundColor: bodyColor, fontFamily: 'Fredoka, sans-serif' }}
        >
          {name}
        </div>
      )}
    </div>
  );
};
