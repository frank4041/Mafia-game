import { Player, Role } from './types';

export const PLAYER_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
  '#BB8FCE', '#85C1E9'
];

export const PLAYER_NAMES = [
  'Chidi', 'Timi', 'Femi', 'Amara', 'Kofi',
  'Zara', 'Obi', 'Nia', 'Tunde', 'Ama'
];

export const HOUSE_POSITIONS = [
  { x: 10, y: 20 }, { x: 25, y: 15 }, { x: 45, y: 12 },
  { x: 65, y: 15 }, { x: 80, y: 20 }, { x: 90, y: 35 },
  { x: 88, y: 55 }, { x: 78, y: 70 }, { x: 15, y: 65 },
  { x: 8, y: 45 }
];

export const SQUARE_POSITIONS = [
  { x: 35, y: 45 }, { x: 45, y: 38 }, { x: 55, y: 42 },
  { x: 40, y: 55 }, { x: 50, y: 50 }, { x: 60, y: 55 },
  { x: 45, y: 62 }, { x: 55, y: 65 }, { x: 38, y: 50 },
  { x: 52, y: 58 }
];

export function assignRoles(playerCount: number): Role[] {
  const roles: Role[] = [];
  roles.push('police');
  roles.push('doctor');
  const thiefCount = Math.max(1, Math.floor(playerCount * 0.25));
  for (let i = 0; i < thiefCount; i++) {
    roles.push('thief');
  }
  while (roles.length < playerCount) {
    roles.push('civilian');
  }
  for (let i = roles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [roles[i], roles[j]] = [roles[j], roles[i]];
  }
  return roles;
}

export function createPlayers(count: number): Player[] {
  const roles = assignRoles(count);
  const shuffledNames = [...PLAYER_NAMES].sort(() => Math.random() - 0.5);
  const shuffledColors = [...PLAYER_COLORS].sort(() => Math.random() - 0.5);
  return Array.from({ length: count }, (_, i) => ({
    id: `player-${i}`,
    name: shuffledNames[i],
    role: roles[i],
    isAlive: true,
    color: shuffledColors[i],
    isAccused: false,
    accusedBy: null,
    isProtected: false,
    position: SQUARE_POSITIONS[i],
    housePosition: HOUSE_POSITIONS[i],
    isEliminated: false,
  }));
}

export function getRoleInfo(role: Role) {
  switch (role) {
    case 'police':
      return {
        title: 'POLICE',
        emoji: '🔍',
        color: '#3B82F6',
        job: 'Find the Thieves and help the village eliminate them.',
        action: 'EVERY NIGHT',
        actionDesc: 'Investigate one player. You will learn whether they are a Thief.',
        hint: 'Saying "I\'m the Police" can make you a target. You don\'t have to reveal yourself immediately. Use what you know carefully.',
        bgGradient: 'from-blue-500 to-blue-700',
      };
    case 'doctor':
      return {
        title: 'DOCTOR',
        emoji: '💊',
        color: '#10B981',
        job: 'Keep the village alive.',
        action: 'EVERY NIGHT',
        actionDesc: 'Protect one player. You can protect yourself.',
        hint: 'A correct save can earn you trust. Think carefully about who the Thieves might target.',
        bgGradient: 'from-emerald-500 to-emerald-700',
      };
    case 'thief':
      return {
        title: 'THIEF',
        emoji: '🦊',
        color: '#EF4444',
        job: 'Eliminate the village without getting caught.',
        action: 'EVERY NIGHT',
        actionDesc: 'Work with the other Thieves to choose one target.',
        hint: 'You don\'t have to stay quiet. Accusing other players and creating believable stories can help hide your identity.',
        bgGradient: 'from-red-500 to-red-700',
      };
    case 'civilian':
      return {
        title: 'CIVILIAN',
        emoji: '👤',
        color: '#8B5CF6',
        job: 'Find the Thieves.',
        action: 'EVERY DAY',
        actionDesc: 'Listen carefully, question people, make accusations and vote.',
        hint: 'Pay attention to what people say and what they do across multiple rounds. The truth is in the patterns.',
        bgGradient: 'from-purple-500 to-purple-700',
      };
  }
}

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
