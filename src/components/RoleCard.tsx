import React from 'react';
import { Role } from '../types';
import { getRoleInfo } from '../gameData';

interface RoleCardProps {
  role: Role;
  playerName: string;
  onContinue: () => void;
}

export const RoleCard: React.FC<RoleCardProps> = ({ role, playerName, onContinue }) => {
  const info = getRoleInfo(role);
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md animate-[slideUp_0.5s_ease-out]">
        <div className={`relative bg-gradient-to-br ${info.bgGradient} rounded-3xl p-6 shadow-2xl border-4 border-white/20 overflow-hidden`}>
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
          <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-white/5" />
          
          <div className="relative z-10 text-white" style={{ fontFamily: 'Fredoka, sans-serif' }}>
            <div className="text-center mb-4">
              <div className="text-5xl mb-2">{info.emoji}</div>
              <div className="text-sm uppercase tracking-wider opacity-80">Your Role</div>
              <h2 className="text-4xl font-bold">{info.title}</h2>
            </div>
            
            <div className="text-center mb-4">
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                Playing as <strong>{playerName}</strong>
              </span>
            </div>
            
            <div className="bg-white/15 rounded-2xl p-4 mb-3 backdrop-blur-sm">
              <div className="text-xs uppercase tracking-wider opacity-70 mb-1">Your Job</div>
              <p className="text-lg font-medium">{info.job}</p>
            </div>
            
            <div className="bg-white/10 rounded-2xl p-4 mb-3 backdrop-blur-sm">
              <div className="text-xs uppercase tracking-wider opacity-70 mb-1">{info.action}</div>
              <p className="font-medium">{info.actionDesc}</p>
            </div>
            
            <div className="bg-yellow-400/20 border border-yellow-300/30 rounded-2xl p-4 backdrop-blur-sm">
              <div className="text-xs uppercase tracking-wider text-yellow-200 mb-1">💡 Hint</div>
              <p className="text-sm text-yellow-100">{info.hint}</p>
            </div>
            
            <button
              onClick={onContinue}
              className="w-full mt-5 py-3 bg-white text-gray-800 rounded-2xl font-bold text-lg hover:bg-white/90 active:scale-95 transition-all shadow-lg"
            >
              I'm Ready! 🎮
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
