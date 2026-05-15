export type GamePhase = 'creature' | 'colony' | 'evolved';

export interface Player {
  phase: GamePhase;
  dnaCurrency: number;
  unlockedParts: string[];
  unlockedAbilities: string[];
  completedBattles: number;
  exploredTiles: string[];
  totalXpEarned: number;
}
