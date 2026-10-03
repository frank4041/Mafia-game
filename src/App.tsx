import React, { useState, useEffect, useCallback } from 'react';
import { GameState, ChatMessage, Player } from './types';
import { createPlayers, generateRoomCode, getRoleInfo } from './gameData';
import { Village } from './components/Village';
import { RoleCard } from './components/RoleCard';

const INITIAL_STATE: GameState = {
  phase: 'lobby',
  players: [],
  currentPlayerId: 'player-0',
  round: 1,
  chat: [],
  votes: [],
  history: [],
  roomCode: generateRoomCode(),
  nightTarget: null,
  protectedPlayer: null,
  investigatedPlayer: null,
  investigationResult: null,
  winner: null,
  lastNightEliminated: null,
  lastVoteEliminated: null,
};

function App() {
  const [game, setGame] = useState<GameState>(INITIAL_STATE);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [showRoleCard, setShowRoleCard] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [phaseTimer, setPhaseTimer] = useState(0);
  const [notification, setNotification] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(true);

  const currentPlayer = game.players.find(p => p.id === game.currentPlayerId);
  
  // Contextual hints based on phase and role
  const getContextualHint = (): string | null => {
    if (!currentPlayer || !showHint) return null;
    
    switch (game.phase) {
      case 'day-discussion':
        if (currentPlayer.role === 'police') return '💡 The Police knows something the rest of the village doesn\'t. Sharing that information can help, but may also make you a target.';
        if (currentPlayer.role === 'thief') return '💡 You don\'t have to stay quiet. Accusing other players and creating believable stories can help hide your identity.';
        return '💡 Pay attention to what people say and what they do across multiple rounds. The truth is in the patterns.';
      case 'day-voting':
        return '💡 An accusation highlights a player, but a vote is the actual decision. Think carefully before you vote.';
      case 'night':
        if (currentPlayer.role === 'doctor') return '💡 Someone was protected last night. The Thieves may try to target them again.';
        if (currentPlayer.role === 'thief') return '💡 Think about who might be the Police. Avoid drawing attention to yourself.';
        return null;
      default:
        return null;
    }
  };

  // Phase timer
  useEffect(() => {
    setShowHint(true);
    if (game.phase === 'day-discussion') {
      setPhaseTimer(60);
    } else if (game.phase === 'day-voting') {
      setPhaseTimer(30);
    } else if (game.phase === 'night') {
      setPhaseTimer(20);
    }
  }, [game.phase]);

  useEffect(() => {
    if (phaseTimer > 0 && ['day-discussion', 'day-voting', 'night'].includes(game.phase)) {
      const interval = setInterval(() => {
        setPhaseTimer(t => {
          if (t <= 1) {
            advancePhase();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [phaseTimer, game.phase]);

  const advancePhase = useCallback(() => {
    setGame(prev => {
      const next = { ...prev };
      
      switch (prev.phase) {
        case 'day-discussion':
          next.phase = 'day-voting';
          next.votes = [];
          break;
        case 'day-voting':
          // Resolve votes
          const voteCounts: Record<string, number> = {};
          prev.votes.forEach(v => {
            voteCounts[v.targetId] = (voteCounts[v.targetId] || 0) + 1;
          });
          
          let maxVotes = 0;
          let eliminatedId: string | null = null;
          Object.entries(voteCounts).forEach(([id, count]) => {
            if (count > maxVotes) {
              maxVotes = count;
              eliminatedId = id;
            }
          });
          
          if (eliminatedId) {
            const player = prev.players.find(p => p.id === eliminatedId);
            if (player) {
              next.players = prev.players.map(p => 
                p.id === eliminatedId ? { ...p, isAlive: false, isEliminated: true } : p
              );
              next.lastVoteEliminated = player.name;
              next.history = [...prev.history, {
                round: prev.round,
                eliminatedPlayer: { name: player.name, role: player.role },
                accusations: prev.chat.filter(m => m.isAccusation).map(m => ({
                  accuserId: m.playerId,
                  targetId: m.targetId || '',
                })),
                votes: prev.votes,
              }];
            }
          } else {
            next.lastVoteEliminated = null;
          }
          next.phase = 'sunset';
          break;
        case 'sunset':
          next.phase = 'night';
          next.nightTarget = null;
          next.protectedPlayer = null;
          next.investigatedPlayer = null;
          next.investigationResult = null;
          // Clear accusations
          next.players = prev.players.map(p => ({ ...p, isAccused: false, accusedBy: null, isProtected: false }));
          break;
        case 'night':
          // Resolve night actions
          let nightEliminated: string | null = null;
          
          // Check if thief target was protected
          if (prev.nightTarget && prev.nightTarget !== prev.protectedPlayer) {
            nightEliminated = prev.nightTarget;
          }
          
          if (nightEliminated) {
            const player = prev.players.find(p => p.id === nightEliminated);
            if (player) {
              next.players = prev.players.map(p => 
                p.id === nightEliminated ? { ...p, isAlive: false, isEliminated: true } : p
              );
              next.lastNightEliminated = player.name;
            }
          } else {
            next.lastNightEliminated = null;
          }
          
          next.phase = 'morning';
          break;
        case 'morning':
          // Check win conditions
          const alivePlayers = prev.players.filter(p => p.isAlive);
          const aliveThieves = alivePlayers.filter(p => p.role === 'thief');
          const aliveVillage = alivePlayers.filter(p => p.role !== 'thief');
          
          if (aliveThieves.length === 0) {
            next.phase = 'game-over';
            next.winner = 'village';
          } else if (aliveThieves.length >= aliveVillage.length) {
            next.phase = 'game-over';
            next.winner = 'thieves';
          } else {
            next.phase = 'day-discussion';
            next.round = prev.round + 1;
            next.chat = [];
            next.votes = [];
          }
          break;
        default:
          break;
      }
      
      return next;
    });
  }, []);

  const startGame = (playerCount: number) => {
    const players = createPlayers(playerCount);
    setGame({
      ...INITIAL_STATE,
      phase: 'role-reveal',
      players,
      roomCode: generateRoomCode(),
    });
    setShowRoleCard(true);
  };

  const handleChat = () => {
    if (!chatInput.trim() || !currentPlayer) return;
    
    const isAccusation = chatInput.toLowerCase().includes('accuse') || chatInput.toLowerCase().includes('is thief');
    let targetId: string | undefined;
    
    if (isAccusation) {
      // Try to find accused player name
      const accused = game.players.find(p => 
        p.isAlive && chatInput.toLowerCase().includes(p.name.toLowerCase())
      );
      if (accused) {
        targetId = accused.id;
        // Mark as accused
        setGame(prev => ({
          ...prev,
          players: prev.players.map(p => 
            p.id === accused.id ? { ...p, isAccused: true, accusedBy: prev.currentPlayerId } : p
          ),
        }));
      }
    }
    
    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      playerId: currentPlayer.id,
      playerName: currentPlayer.name,
      text: chatInput,
      timestamp: Date.now(),
      isAccusation,
      targetId,
    };
    
    setGame(prev => ({ ...prev, chat: [...prev.chat, message] }));
    setChatInput('');
  };

  const handleVote = (targetId: string) => {
    if (!currentPlayer) return;
    setGame(prev => ({
      ...prev,
      votes: [...prev.votes.filter(v => v.voterId !== currentPlayer.id), { voterId: currentPlayer.id, targetId }],
    }));
    setSelectedPlayer(null);
    setNotification(`You voted for ${game.players.find(p => p.id === targetId)?.name}!`);
    setTimeout(() => setNotification(null), 2000);
  };

  const handleNightAction = (targetId: string) => {
    if (!currentPlayer) return;
    
    if (currentPlayer.role === 'police') {
      const target = game.players.find(p => p.id === targetId);
      const isThief = target?.role === 'thief';
      setGame(prev => ({
        ...prev,
        investigatedPlayer: targetId,
        investigationResult: isThief,
      }));
    } else if (currentPlayer.role === 'doctor') {
      setGame(prev => ({
        ...prev,
        protectedPlayer: targetId,
        players: prev.players.map(p => 
          p.id === targetId ? { ...p, isProtected: true } : p
        ),
      }));
    } else if (currentPlayer.role === 'thief') {
      setGame(prev => ({
        ...prev,
        nightTarget: targetId,
      }));
    }
    
    setSelectedPlayer(null);
  };

  const simulateBotActions = () => {
    // Simulate other players chatting
    const aliveBots = game.players.filter(p => p.id !== game.currentPlayerId && p.isAlive);
    if (aliveBots.length === 0) return;
    
    const bot = aliveBots[Math.floor(Math.random() * aliveBots.length)];
    const messages = [
      "I have a bad feeling about someone here...",
      "We need to figure this out quickly!",
      "I think we should be more careful tonight.",
      "Has anyone noticed anything suspicious?",
      "I'm not sure who to trust right now.",
      "Let's think about who was quiet last round.",
      "I have evidence! Listen carefully.",
      "Something doesn't add up here...",
    ];
    
    const message: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random()}`,
      playerId: bot.id,
      playerName: bot.name,
      text: messages[Math.floor(Math.random() * messages.length)],
      timestamp: Date.now(),
      isAccusation: false,
    };
    
    setGame(prev => ({ ...prev, chat: [...prev.chat, message] }));
  };

  // Render based on phase
  const renderPhaseUI = () => {
    switch (game.phase) {
      case 'lobby':
        return <LobbyScreen onStart={startGame} roomCode={game.roomCode} />;
      
      case 'role-reveal':
        return null; // Handled by RoleCard overlay
      
      case 'day-discussion':
        return (
          <DayDiscussionUI
            game={game}
            chatInput={chatInput}
            setChatInput={setChatInput}
            onSendChat={handleChat}
            onSimulate={simulateBotActions}
            phaseTimer={phaseTimer}
            showHistory={showHistory}
            setShowHistory={setShowHistory}
          />
        );
      
      case 'day-voting':
        return (
          <VotingUI
            game={game}
            selectedPlayer={selectedPlayer}
            onSelectPlayer={setSelectedPlayer}
            onVote={handleVote}
            phaseTimer={phaseTimer}
          />
        );
      
      case 'sunset':
        return <SunsetOverlay />;
      
      case 'night':
        return (
          <NightUI
            game={game}
            currentPlayer={currentPlayer!}
            selectedPlayer={selectedPlayer}
            onSelectPlayer={setSelectedPlayer}
            onAction={handleNightAction}
            phaseTimer={phaseTimer}
          />
        );
      
      case 'morning':
        return <MorningOverlay game={game} />;
      
      case 'game-over':
        return <GameOverScreen game={game} onRestart={() => setGame(INITIAL_STATE)} />;
      
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-screen overflow-hidden relative" style={{ fontFamily: 'Nunito, sans-serif' }}>
      {/* Village background - always visible */}
      {game.phase !== 'lobby' && (
        <Village
          players={game.players}
          phase={game.phase}
          round={game.round}
          selectedPlayerId={selectedPlayer}
          onPlayerClick={(id) => setSelectedPlayer(id === selectedPlayer ? null : id)}
          selectablePlayers={
            game.phase === 'day-voting' || game.phase === 'night'
              ? game.players.filter(p => p.isAlive && p.id !== game.currentPlayerId).map(p => p.id)
              : undefined
          }
        />
      )}
      
      {/* Phase-specific UI overlay */}
      {renderPhaseUI()}
      
      {/* Role card overlay */}
      {showRoleCard && currentPlayer && (
        <RoleCard
          role={currentPlayer.role}
          playerName={currentPlayer.name}
          onContinue={() => {
            setShowRoleCard(false);
            setGame(prev => ({ ...prev, phase: 'day-discussion' }));
          }}
        />
      )}
      
      {/* Notification toast */}
      {notification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] animate-[slideDown_0.3s_ease-out]">
          <div className="bg-white px-6 py-3 rounded-2xl shadow-xl font-bold text-gray-800" style={{ fontFamily: 'Fredoka, sans-serif' }}>
            {notification}
          </div>
        </div>
      )}
      
      {/* Contextual hint */}
      {getContextualHint() && (
        <div className="fixed top-16 left-4 right-16 z-[55] animate-[slideUp_0.5s_ease-out]">
          <div className="bg-yellow-50/90 backdrop-blur-sm border border-yellow-200 rounded-2xl px-4 py-2 shadow-md flex items-start gap-2">
            <span className="text-sm">{getContextualHint()}</span>
            <button 
              onClick={() => setShowHint(false)}
              className="text-yellow-600 hover:text-yellow-800 text-xs font-bold shrink-0 mt-0.5"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      
      {/* My Role button */}
      {currentPlayer && !['lobby', 'role-reveal', 'game-over'].includes(game.phase) && (
        <button
          onClick={() => setShowRoleCard(true)}
          className="fixed top-4 right-4 z-[60] bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full shadow-lg font-bold text-xs hover:bg-white active:scale-95 transition-all flex items-center gap-1"
          style={{ fontFamily: 'Fredoka, sans-serif' }}
        >
          {getRoleInfo(currentPlayer.role).emoji} My Role
        </button>
      )}
      
      {/* Player status panel */}
      {currentPlayer && ['day-discussion', 'day-voting'].includes(game.phase) && (
        <div className="fixed top-14 left-4 z-[55] bg-white/80 backdrop-blur-sm rounded-2xl p-3 shadow-lg max-w-[160px]">
          <div className="text-xs font-bold text-gray-500 mb-2" style={{ fontFamily: 'Fredoka, sans-serif' }}>
            👥 Village ({game.players.filter(p => p.isAlive).length} alive)
          </div>
          <div className="space-y-1 max-h-[200px] overflow-y-auto">
            {game.players.map(p => (
              <div key={p.id} className={`flex items-center gap-1.5 text-xs ${!p.isAlive ? 'opacity-40 line-through' : ''}`}>
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                <span className="font-medium truncate">{p.name}</span>
                {p.isAccused && <span className="text-red-500">🔥</span>}
                {!p.isAlive && <span className="text-gray-400">💀</span>}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Phase advance button (for demo) */}
      {['day-discussion', 'day-voting', 'night', 'sunset', 'morning'].includes(game.phase) && (
        <button
          onClick={advancePhase}
          className="fixed bottom-4 right-4 z-[90] bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg font-bold text-sm hover:bg-white active:scale-95 transition-all"
          style={{ fontFamily: 'Fredoka, sans-serif' }}
        >
          Next Phase →
        </button>
      )}
    </div>
  );
}

// ===== SUB-COMPONENTS =====

const LobbyScreen: React.FC<{ onStart: (count: number) => void; roomCode: string }> = ({ onStart, roomCode }) => {
  const [playerCount, setPlayerCount] = useState(6);
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-sky-400 via-purple-400 to-pink-400">
      <div className="text-center p-8 max-w-md w-full">
        {/* Logo */}
        <div className="mb-8">
          <div className="text-6xl mb-4">🏘️</div>
          <h1 className="text-5xl font-bold text-white drop-shadow-lg" style={{ fontFamily: 'Fredoka, sans-serif' }}>
            Police & Thief
          </h1>
          <p className="text-white/80 mt-2 text-lg">A Social Deduction Game</p>
        </div>
        
        {/* Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl">
          {/* Room code */}
          <div className="mb-6">
            <div className="text-sm text-gray-500 font-medium">Room Code</div>
            <div className="text-3xl font-bold text-purple-600 tracking-widest mt-1" style={{ fontFamily: 'Fredoka, sans-serif' }}>
              {roomCode}
            </div>
          </div>
          
          {/* Player count */}
          <div className="mb-6">
            <div className="text-sm text-gray-500 font-medium mb-2">Players</div>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setPlayerCount(Math.max(4, playerCount - 1))}
                className="w-10 h-10 rounded-full bg-gray-100 font-bold text-xl hover:bg-gray-200 active:scale-90 transition-all"
              >
                -
              </button>
              <span className="text-3xl font-bold text-gray-800 w-12" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                {playerCount}
              </span>
              <button
                onClick={() => setPlayerCount(Math.min(10, playerCount + 1))}
                className="w-10 h-10 rounded-full bg-gray-100 font-bold text-xl hover:bg-gray-200 active:scale-90 transition-all"
              >
                +
              </button>
            </div>
            <div className="text-xs text-gray-400 mt-1">4-10 players • 1 Police, 1 Doctor, Thieves & Civilians</div>
          </div>
          
          {/* Start button */}
          <button
            onClick={() => onStart(playerCount)}
            className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-bold text-xl hover:from-purple-600 hover:to-pink-600 active:scale-95 transition-all shadow-lg"
            style={{ fontFamily: 'Fredoka, sans-serif' }}
          >
            Start Game 🎮
          </button>
        </div>
        
        {/* Features */}
        <div className="mt-6 grid grid-cols-3 gap-3 text-white/80 text-xs">
          <div className="bg-white/10 rounded-xl p-2">🔍 Police</div>
          <div className="bg-white/10 rounded-xl p-2">💊 Doctor</div>
          <div className="bg-white/10 rounded-xl p-2">🦊 Thieves</div>
        </div>
      </div>
    </div>
  );
};

const DayDiscussionUI: React.FC<{
  game: GameState;
  chatInput: string;
  setChatInput: (v: string) => void;
  onSendChat: () => void;
  onSimulate: () => void;
  phaseTimer: number;
  showHistory: boolean;
  setShowHistory: (v: boolean) => void;
}> = ({ game, chatInput, setChatInput, onSendChat, onSimulate, phaseTimer, showHistory, setShowHistory }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30">
      {/* Timer bar */}
      <div className="w-full h-1 bg-white/20">
        <div 
          className="h-full bg-yellow-400 transition-all duration-1000"
          style={{ width: `${(phaseTimer / 60) * 100}%` }}
        />
      </div>
      
      {/* Discussion panel */}
      <div className="bg-white/90 backdrop-blur-md rounded-t-3xl shadow-2xl max-h-[45vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-xl">☀️</span>
            <h3 className="font-bold text-gray-800" style={{ fontFamily: 'Fredoka, sans-serif' }}>
              Day Discussion
            </h3>
            <span className="text-sm text-gray-400">• {phaseTimer}s</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold hover:bg-purple-200 transition-all"
            >
              📜 History
            </button>
            <button
              onClick={onSimulate}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold hover:bg-blue-200 transition-all"
            >
              🤖 Bot Chat
            </button>
          </div>
        </div>
        
        {/* History panel */}
        {showHistory && (
          <div className="px-4 py-3 bg-purple-50 border-b border-purple-100 max-h-32 overflow-y-auto">
            {game.history.length === 0 ? (
              <p className="text-sm text-gray-400">No history yet...</p>
            ) : (
              game.history.map((h, i) => (
                <div key={i} className="mb-2 text-sm">
                  <span className="font-bold text-purple-700">Round {h.round}</span>
                  {h.eliminatedPlayer && (
                    <span className="text-gray-600"> — {h.eliminatedPlayer.name} eliminated ({h.eliminatedPlayer.role})</span>
                  )}
                </div>
              ))
            )}
          </div>
        )}
        
        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 min-h-[100px] max-h-[25vh]">
          {game.chat.length === 0 && (
            <div className="text-center text-gray-400 text-sm py-4">
              💬 Discussion started! Talk, accuse, and find the thieves.
            </div>
          )}
          {game.chat.map(msg => (
            <div key={msg.id} className={`flex ${msg.playerId === game.currentPlayerId ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                msg.isAccusation 
                  ? 'bg-red-100 text-red-800 border border-red-200' 
                  : msg.playerId === game.currentPlayerId
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {msg.playerId !== game.currentPlayerId && (
                  <div className="font-bold text-xs mb-0.5 opacity-70">{msg.playerName}</div>
                )}
                {msg.isAccusation && <span className="font-bold">🔥 ACCUSATION: </span>}
                {msg.text}
              </div>
            </div>
          ))}
        </div>
        
        {/* Input */}
        <div className="px-4 py-3 border-t border-gray-100">
          <div className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && onSendChat()}
              placeholder='Type to discuss... (try "accuse [name]")'
              className="flex-1 px-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
            <button
              onClick={onSendChat}
              className="px-4 py-2 bg-purple-500 text-white rounded-full font-bold text-sm hover:bg-purple-600 active:scale-95 transition-all"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const VotingUI: React.FC<{
  game: GameState;
  selectedPlayer: string | null;
  onSelectPlayer: (id: string | null) => void;
  onVote: (id: string) => void;
  phaseTimer: number;
}> = ({ game, selectedPlayer, onSelectPlayer, onVote, phaseTimer }) => {
  const alivePlayers = game.players.filter(p => p.isAlive);
  const hasVoted = game.votes.some(v => v.voterId === game.currentPlayerId);
  
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-6 shadow-2xl max-w-md w-full mx-4 animate-[slideUp_0.3s_ease-out]">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="text-3xl mb-1">⚖️</div>
          <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Fredoka, sans-serif' }}>
            Who is the Thief?
          </h2>
          <p className="text-sm text-gray-500">Vote to eliminate a suspect • {phaseTimer}s</p>
        </div>
        
        {/* Timer bar */}
        <div className="w-full h-2 bg-gray-100 rounded-full mb-4 overflow-hidden">
          <div 
            className="h-full bg-orange-400 rounded-full transition-all duration-1000"
            style={{ width: `${(phaseTimer / 30) * 100}%` }}
          />
        </div>
        
        {/* Players grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {alivePlayers.filter(p => p.id !== game.currentPlayerId).map(player => (
            <button
              key={player.id}
              onClick={() => onSelectPlayer(player.id === selectedPlayer ? null : player.id)}
              className={`p-3 rounded-2xl border-2 transition-all active:scale-95 ${
                selectedPlayer === player.id
                  ? 'border-red-400 bg-red-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: player.color }}
                >
                  {player.name[0]}
                </div>
                <span className="font-bold text-sm text-gray-800">{player.name}</span>
              </div>
              {player.isAccused && (
                <div className="text-xs text-red-500 mt-1">🔥 Accused</div>
              )}
            </button>
          ))}
        </div>
        
        {/* Vote button */}
        <button
          onClick={() => selectedPlayer && onVote(selectedPlayer)}
          disabled={!selectedPlayer || hasVoted}
          className={`w-full py-3 rounded-2xl font-bold text-lg transition-all ${
            hasVoted
              ? 'bg-green-100 text-green-700'
              : selectedPlayer
              ? 'bg-red-500 text-white hover:bg-red-600 active:scale-95 shadow-lg'
              : 'bg-gray-200 text-gray-400'
          }`}
          style={{ fontFamily: 'Fredoka, sans-serif' }}
        >
          {hasVoted ? '✓ Vote Cast!' : selectedPlayer ? `Vote for ${game.players.find(p => p.id === selectedPlayer)?.name}` : 'Select a player'}
        </button>
        
        {/* Skip vote */}
        {!hasVoted && (
          <button
            onClick={() => onVote(game.currentPlayerId)}
            className="w-full mt-2 py-2 text-gray-400 text-sm hover:text-gray-600 transition-all"
          >
            Skip vote (abstain)
          </button>
        )}
      </div>
    </div>
  );
};

const SunsetOverlay: React.FC = () => (
  <div className="fixed inset-0 z-40 flex items-center justify-center bg-gradient-to-b from-orange-500/80 via-pink-500/60 to-purple-900/80 backdrop-blur-sm animate-[fadeIn_2s_ease-in]">
    <div className="text-center text-white">
      <div className="text-6xl mb-4 animate-pulse">🌅</div>
      <h2 className="text-4xl font-bold" style={{ fontFamily: 'Fredoka, sans-serif' }}>
        Sunset
      </h2>
      <p className="text-white/70 mt-2 text-lg">The village grows quiet...</p>
      <p className="text-white/50 mt-1">Characters return to their homes</p>
    </div>
  </div>
);

const NightUI: React.FC<{
  game: GameState;
  currentPlayer: Player;
  selectedPlayer: string | null;
  onSelectPlayer: (id: string | null) => void;
  onAction: (id: string) => void;
  phaseTimer: number;
}> = ({ game, currentPlayer, selectedPlayer, onSelectPlayer, onAction, phaseTimer }) => {
  const roleInfo = getRoleInfo(currentPlayer.role);
  const alivePlayers = game.players.filter(p => p.isAlive && p.id !== currentPlayer.id);
  const hasActed = game.nightTarget !== null || game.protectedPlayer !== null || game.investigatedPlayer !== null;
  
  if (currentPlayer.role === 'civilian') {
    return (
      <div className="fixed inset-0 z-30 flex items-center justify-center">
        <div className="text-center text-white animate-pulse">
          <div className="text-5xl mb-4">😴</div>
          <h2 className="text-3xl font-bold" style={{ fontFamily: 'Fredoka, sans-serif' }}>
            You are asleep...
          </h2>
          <p className="text-white/60 mt-2">Nothing happens for you at night</p>
          <p className="text-white/40 mt-4 text-sm">Waiting • {phaseTimer}s</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center">
      <div className="bg-indigo-900/90 backdrop-blur-md rounded-3xl p-6 shadow-2xl max-w-md w-full mx-4 border border-indigo-400/30 animate-[slideUp_0.3s_ease-out]">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="text-4xl mb-2">{roleInfo.emoji}</div>
          <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Fredoka, sans-serif' }}>
            {roleInfo.title} — Night Action
          </h2>
          <p className="text-indigo-200 text-sm mt-1">{roleInfo.actionDesc}</p>
          <p className="text-indigo-300/60 text-xs mt-2">⏱ {phaseTimer}s remaining</p>
        </div>
        
        {/* Investigation result */}
        {game.investigationResult !== null && (
          <div className={`mb-4 p-4 rounded-2xl text-center ${
            game.investigationResult ? 'bg-red-500/30 border border-red-400/50' : 'bg-green-500/30 border border-green-400/50'
          }`}>
            <div className="text-2xl mb-1">{game.investigationResult ? '🚨' : '✅'}</div>
            <p className="text-white font-bold">
              {game.investigationResult 
                ? `${game.players.find(p => p.id === game.investigatedPlayer)?.name} IS a Thief!`
                : `${game.players.find(p => p.id === game.investigatedPlayer)?.name} is NOT a Thief.`
              }
            </p>
          </div>
        )}
        
        {/* Player selection */}
        {!hasActed && (
          <>
            <div className="grid grid-cols-2 gap-2 mb-4 max-h-[30vh] overflow-y-auto">
              {alivePlayers.map(player => (
                <button
                  key={player.id}
                  onClick={() => onSelectPlayer(player.id === selectedPlayer ? null : player.id)}
                  className={`p-3 rounded-xl border-2 transition-all active:scale-95 ${
                    selectedPlayer === player.id
                      ? 'border-yellow-400 bg-yellow-400/20'
                      : 'border-indigo-400/30 hover:border-indigo-300/50 bg-indigo-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: player.color }}
                    >
                      {player.name[0]}
                    </div>
                    <span className="font-bold text-sm text-white">{player.name}</span>
                  </div>
                </button>
              ))}
            </div>
            
            {/* Action button */}
            <button
              onClick={() => selectedPlayer && onAction(selectedPlayer)}
              disabled={!selectedPlayer}
              className={`w-full py-3 rounded-2xl font-bold transition-all ${
                selectedPlayer
                  ? 'bg-yellow-400 text-gray-900 hover:bg-yellow-300 active:scale-95 shadow-lg'
                  : 'bg-indigo-700 text-indigo-300'
              }`}
              style={{ fontFamily: 'Fredoka, sans-serif' }}
            >
              {currentPlayer.role === 'police' && selectedPlayer ? `🔍 Investigate ${game.players.find(p => p.id === selectedPlayer)?.name}` : ''}
              {currentPlayer.role === 'doctor' && selectedPlayer ? `💊 Protect ${game.players.find(p => p.id === selectedPlayer)?.name}` : ''}
              {currentPlayer.role === 'thief' && selectedPlayer ? `🦊 Eliminate ${game.players.find(p => p.id === selectedPlayer)?.name}` : ''}
              {!selectedPlayer ? 'Select a target...' : ''}
            </button>
          </>
        )}
        
        {hasActed && (
          <div className="text-center text-indigo-200 text-sm">
            ✓ Action confirmed. Waiting for others...
          </div>
        )}
      </div>
    </div>
  );
};

const MorningOverlay: React.FC<{ game: GameState }> = ({ game }) => {
  const nightEliminated = game.lastNightEliminated 
    ? game.players.find(p => p.name === game.lastNightEliminated)
    : null;
  
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-gradient-to-b from-amber-200/80 via-orange-200/60 to-sky-300/80 backdrop-blur-sm animate-[fadeIn_2s_ease-in]">
      <div className="text-center text-gray-800 max-w-sm mx-4">
        <div className="text-6xl mb-4">🌄</div>
        <h2 className="text-4xl font-bold mb-2" style={{ fontFamily: 'Fredoka, sans-serif' }}>
          Morning
        </h2>
        <p className="text-gray-600 text-lg mb-4">The village wakes up...</p>
        
        {nightEliminated && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg mb-4">
            <div className="text-3xl mb-2">😢</div>
            <p className="font-bold text-xl text-gray-800">{nightEliminated.name} is missing!</p>
            <p className="text-gray-500 text-sm mt-1">
              They were a <span className="font-bold">{nightEliminated.role}</span>
            </p>
          </div>
        )}
        
        {!nightEliminated && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg mb-4">
            <div className="text-3xl mb-2">🎉</div>
            <p className="font-bold text-xl text-gray-800">Everyone survived the night!</p>
            <p className="text-gray-500 text-sm mt-1">Perhaps the Doctor saved someone...</p>
          </div>
        )}
      </div>
    </div>
  );
};

const GameOverScreen: React.FC<{ game: GameState; onRestart: () => void }> = ({ game, onRestart }) => {
  const isVillageWin = game.winner === 'village';
  
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${
      isVillageWin 
        ? 'bg-gradient-to-br from-green-400 to-emerald-600' 
        : 'bg-gradient-to-br from-red-500 to-purple-800'
    }`}>
      <div className="text-center text-white max-w-md mx-4 p-8">
        <div className="text-7xl mb-4">{isVillageWin ? '🎉' : '🦊'}</div>
        <h1 className="text-5xl font-bold mb-2" style={{ fontFamily: 'Fredoka, sans-serif' }}>
          {isVillageWin ? 'Village Wins!' : 'Thieves Win!'}
        </h1>
        <p className="text-white/80 text-lg mb-8">
          {isVillageWin 
            ? 'The thieves have been eliminated. Peace returns to the village!'
            : 'The thieves have taken over. The village falls into chaos!'}
        </p>
        
        {/* Role reveal */}
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 mb-6">
          <h3 className="font-bold mb-3" style={{ fontFamily: 'Fredoka, sans-serif' }}>Role Reveal</h3>
          <div className="grid grid-cols-2 gap-2">
            {game.players.map(player => (
              <div key={player.id} className="flex items-center gap-2 bg-white/10 rounded-xl p-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: player.color }}
                >
                  {player.name[0]}
                </div>
                <span className="text-sm font-medium">{player.name}</span>
                <span className="text-xs ml-auto opacity-70">
                  {getRoleInfo(player.role).emoji} {player.role}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <button
          onClick={onRestart}
          className="px-8 py-3 bg-white text-gray-800 rounded-2xl font-bold text-lg hover:bg-white/90 active:scale-95 transition-all shadow-lg"
          style={{ fontFamily: 'Fredoka, sans-serif' }}
        >
          Play Again 🔄
        </button>
      </div>
    </div>
  );
};

export default App;
