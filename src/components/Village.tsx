import React, { useMemo } from 'react';
import { Player, GamePhase } from '../types';
import { Character } from './Character';

interface VillageProps {
  players: Player[];
  phase: GamePhase;
  round: number;
  selectedPlayerId: string | null;
  onPlayerClick: (id: string) => void;
  selectablePlayers?: string[];
}

export const Village: React.FC<VillageProps> = ({
  players,
  phase,
  round,
  selectedPlayerId,
  onPlayerClick,
  selectablePlayers,
}) => {
  const phaseStr = phase as string;
  const isNight = phaseStr === 'night' || phaseStr === 'sunset';
  const isSunset = phaseStr === 'sunset';
  const isMorning = phaseStr === 'morning';
  const isDay = phaseStr === 'day-discussion' || phaseStr === 'day-voting';

  const stars = useMemo(() => Array.from({ length: 30 }).map((_, i) => ({
    width: ((i * 7 + 3) % 4) + 1,
    height: ((i * 7 + 3) % 4) + 1,
    left: `${(i * 31 + 17) % 100}%`,
    top: `${(i * 23 + 7) % 40}%`,
    delay: `${(i * 0.7) % 3}s`,
    duration: `${2 + (i * 0.5) % 3}s`,
  })), []);
  
  const skyGradient = isNight
    ? 'from-indigo-950 via-purple-950 to-slate-900'
    : isSunset
    ? 'from-orange-400 via-pink-400 to-purple-600'
    : isMorning
    ? 'from-amber-200 via-orange-200 to-sky-300'
    : 'from-sky-300 via-sky-400 to-sky-500';

  const groundColor = isNight ? 'bg-emerald-900' : isSunset ? 'bg-emerald-700' : 'bg-emerald-500';

  return (
    <div className={`relative w-full h-full overflow-hidden bg-gradient-to-b ${skyGradient} transition-all duration-[3000ms]`}>
      {isNight && (
        <div className="absolute inset-0">
          {stars.map((star, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white animate-pulse"
              style={{
                width: star.width,
                height: star.height,
                left: star.left,
                top: star.top,
                animationDelay: star.delay,
                animationDuration: star.duration,
              }}
            />
          ))}
          <div className="absolute top-8 right-12 w-16 h-16 rounded-full bg-yellow-100 shadow-lg shadow-yellow-200/50" />
        </div>
      )}
      
      {isDay && (
        <div className="absolute top-6 left-12 w-20 h-20 rounded-full bg-yellow-300 shadow-lg shadow-yellow-300/50 animate-pulse" />
      )}
      
      {!isNight && (
        <>
          <div className="absolute top-12 left-1/4 w-24 h-8 bg-white/60 rounded-full animate-[float_8s_ease-in-out_infinite]" />
          <div className="absolute top-20 right-1/4 w-32 h-10 bg-white/40 rounded-full animate-[float_10s_ease-in-out_infinite_1s]" />
          <div className="absolute top-8 left-1/2 w-20 h-6 bg-white/50 rounded-full animate-[float_12s_ease-in-out_infinite_2s]" />
        </>
      )}
      
      <div className={`absolute bottom-0 left-0 right-0 h-[55%] ${groundColor} transition-colors duration-[3000ms]`}>
        <div className="absolute top-[20%] left-[25%] w-[50%] h-[50%] rounded-[40%] bg-amber-200/40 border-2 border-amber-300/30" />
        
        <div className="absolute top-[38%] left-[46%]">
          <svg width="32" height="32" viewBox="0 0 32 32">
            <ellipse cx="16" cy="24" rx="12" ry="6" fill="#7BA4C7" opacity="0.6" />
            <rect x="14" y="10" width="4" height="14" fill="#9CA3AF" rx="2" />
            <circle cx="16" cy="10" r="4" fill="#60A5FA" opacity="0.5" />
            <circle cx="16" cy="8" r="2" fill="#93C5FD" opacity="0.7" />
          </svg>
        </div>
        
        <div className="absolute top-[45%] left-[20%] w-[60%] h-[2px] bg-amber-300/30 rounded-full" />
        <div className="absolute top-[30%] left-[48%] w-[2px] h-[40%] bg-amber-300/30 rounded-full" />
        
        <House x={8} y={10} color="#E8A87C" roofColor="#C38D6B" isNight={isNight} />
        <House x={22} y={5} color="#85CDCA" roofColor="#5BA3A0" isNight={isNight} />
        <House x={42} y={2} color="#D4A5A5" roofColor="#B07878" isNight={isNight} />
        <House x={62} y={5} color="#9BC1BC" roofColor="#6E9A95" isNight={isNight} />
        <House x={78} y={10} color="#E6B8A2" roofColor="#C49580" isNight={isNight} />
        <House x={88} y={25} color="#B8D4AA" roofColor="#8FB082" isNight={isNight} />
        <House x={85} y={45} color="#F2C6A5" roofColor="#D4A07A" isNight={isNight} />
        <House x={75} y={60} color="#A8D5BA" roofColor="#7BB094" isNight={isNight} />
        <House x={12} y={55} color="#C9B1D0" roofColor="#A08BAA" isNight={isNight} />
        <House x={5} y={35} color="#F5D5A0" roofColor="#D4B070" isNight={isNight} />
        
        <Tree x={18} y={40} />
        <Tree x={70} y={35} />
        <Tree x={35} y={70} />
        <Tree x={60} y={72} />
        <Tree x={82} y={65} />
        
        <div className="absolute top-[75%] left-[30%] text-lg">🌸</div>
        <div className="absolute top-[80%] left-[50%] text-lg">🌼</div>
        <div className="absolute top-[72%] left-[65%] text-lg">🌺</div>
        <div className="absolute top-[85%] left-[40%] text-lg">🌻</div>
      </div>
      
      {players.map((player, i) => (
        <Character
          key={player.id}
          color={player.color}
          name={player.name}
          isAlive={player.isAlive}
          isAccused={player.isAccused}
          isProtected={player.isProtected}
          x={isNight ? player.housePosition.x : player.position.x}
          y={isNight ? player.housePosition.y : player.position.y}
          onClick={() => selectablePlayers?.includes(player.id) ? onPlayerClick(player.id) : undefined}
          isSelected={selectedPlayerId === player.id}
          isNight={isNight}
          animDelay={i * 0.3}
          showName={!isNight}
        />
      ))}
      
      {isDay && (
        <>
          <div className="absolute text-lg animate-[float_6s_ease-in-out_infinite]" style={{ top: '20%', left: '30%' }}>🦋</div>
          <div className="absolute text-sm animate-[float_8s_ease-in-out_infinite_1s]" style={{ top: '25%', left: '60%' }}>🐦</div>
          <div className="absolute text-sm animate-[float_7s_ease-in-out_infinite_2s]" style={{ top: '30%', left: '45%' }}>🦋</div>
        </>
      )}
      
      {isDay && (
        <>
          <div className="absolute" style={{ left: '30%', top: '62%' }}>
            <div className="w-1 h-8 bg-gray-600 mx-auto" />
            <div className="w-3 h-3 bg-yellow-400 rounded-full -mt-1 mx-auto opacity-30" />
          </div>
          <div className="absolute" style={{ left: '60%', top: '60%' }}>
            <div className="w-1 h-8 bg-gray-600 mx-auto" />
            <div className="w-3 h-3 bg-yellow-400 rounded-full -mt-1 mx-auto opacity-30" />
          </div>
        </>
      )}
      
      {isNight && (
        <>
          <div className="absolute text-lg animate-pulse" style={{ top: '65%', left: '40%' }}>🦉</div>
          <div className="absolute text-sm animate-pulse" style={{ top: '70%', left: '55%', animationDelay: '1s' }}>✨</div>
        </>
      )}
      
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40">
        <div className="px-4 py-2 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 text-white font-bold" style={{ fontFamily: 'Fredoka, sans-serif' }}>
          Round {round} • {isNight ? '🌙 Night' : isSunset ? '🌅 Sunset' : isMorning ? '🌄 Morning' : '☀️ Day'}
        </div>
      </div>
    </div>
  );
};

const House: React.FC<{ x: number; y: number; color: string; roofColor: string; isNight: boolean }> = ({ x, y, color, roofColor, isNight }) => (
  <div
    className="absolute transition-all duration-1000"
    style={{ left: `${x}%`, top: `${y}%` }}
  >
    <svg width="40" height="44" viewBox="0 0 40 44">
      <polygon points="20,2 38,18 2,18" fill={roofColor} />
      <rect x="6" y="18" width="28" height="24" fill={color} rx="2" />
      <rect x="16" y="28" width="8" height="14" fill="#5C4033" rx="1" />
      <rect x="10" y="22" width="6" height="6" fill={isNight ? '#FFE066' : '#87CEEB'} rx="1" />
      <rect x="24" y="22" width="6" height="6" fill={isNight ? '#FFE066' : '#87CEEB'} rx="1" />
      {isNight && (
        <>
          <rect x="10" y="22" width="6" height="6" fill="#FFE066" opacity="0.6" rx="1" />
          <rect x="24" y="22" width="6" height="6" fill="#FFE066" opacity="0.6" rx="1" />
        </>
      )}
    </svg>
  </div>
);

const Tree: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <div className="absolute" style={{ left: `${x}%`, top: `${y}%` }}>
    <svg width="28" height="36" viewBox="0 0 28 36">
      <rect x="12" y="24" width="4" height="12" fill="#8B6914" />
      <circle cx="14" cy="16" r="12" fill="#2D8B4E" />
      <circle cx="10" cy="12" r="8" fill="#3DA85E" />
      <circle cx="18" cy="14" r="7" fill="#34A853" />
    </svg>
  </div>
);
