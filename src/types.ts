export type Role = 'police' | 'doctor' | 'thief' | 'civilian';

export type GamePhase = 
  | 'lobby'
  | 'role-reveal'
  | 'day-discussion'
  | 'day-voting'
  | 'sunset'
  | 'night'
  | 'morning'
  | 'elimination'
  | 'game-over';

export const GAME_PHASES: GamePhase[] = [
  'lobby', 'role-reveal', 'day-discussion', 'day-voting',
  'sunset', 'night', 'morning', 'elimination', 'game-over'
];

export interface Player {
  id: string;
  name: string;
  role: Role;
  isAlive: boolean;
  color: string;
  isAccused: boolean;
  accusedBy: string | null;
  isProtected: boolean;
  position: { x: number; y: number };
  housePosition: { x: number; y: number };
  isEliminated: boolean;
}

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  text: string;
  timestamp: number;
  isAccusation: boolean;
  targetId?: string;
}

export interface Vote {
  voterId: string;
  targetId: string;
}

export interface RoundHistory {
  round: number;
  eliminatedPlayer?: { name: string; role: Role };
  accusations: { accuserId: string; targetId: string }[];
  votes: Vote[];
  nightAction?: string;
}

export interface GameState {
  phase: GamePhase;
  players: Player[];
  currentPlayerId: string;
  round: number;
  chat: ChatMessage[];
  votes: Vote[];
  history: RoundHistory[];
  roomCode: string;
  nightTarget: string | null;
  protectedPlayer: string | null;
  investigatedPlayer: string | null;
  investigationResult: boolean | null;
  winner: 'village' | 'thieves' | null;
  lastNightEliminated: string | null;
  lastVoteEliminated: string | null;
}
