import { create } from 'zustand';
import { Player, GamePhase } from '../types/player';
import { STARTER_PARTS } from '../data/parts';

interface PlayerStore {
  player: Player;
  setPhase: (phase: GamePhase) => void;
  earnDNA: (amount: number) => void;
  spendDNA: (amount: number) => boolean;
  unlockPart: (partId: string) => void;
  unlockAbility: (abilityId: string) => void;
  recordBattle: () => void;
  addExploredTile: (key: string) => void;
  resetPlayer: () => void;
}

const initialPlayer: Player = {
  phase: 'creature',
  dnaCurrency: 0,
  unlockedParts: [...STARTER_PARTS],
  unlockedAbilities: [],
  completedBattles: 0,
  exploredTiles: [],
  totalXpEarned: 0,
};

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  player: initialPlayer,

  setPhase: (phase) =>
    set((s) => ({ player: { ...s.player, phase } })),

  earnDNA: (amount) =>
    set((s) => ({ player: { ...s.player, dnaCurrency: s.player.dnaCurrency + amount } })),

  spendDNA: (amount) => {
    const { player } = get();
    if (player.dnaCurrency < amount) return false;
    set((s) => ({ player: { ...s.player, dnaCurrency: s.player.dnaCurrency - amount } }));
    return true;
  },

  unlockPart: (partId) =>
    set((s) => ({
      player: {
        ...s.player,
        unlockedParts: s.player.unlockedParts.includes(partId)
          ? s.player.unlockedParts
          : [...s.player.unlockedParts, partId],
      },
    })),

  unlockAbility: (abilityId) =>
    set((s) => ({
      player: {
        ...s.player,
        unlockedAbilities: s.player.unlockedAbilities.includes(abilityId)
          ? s.player.unlockedAbilities
          : [...s.player.unlockedAbilities, abilityId],
      },
    })),

  recordBattle: () =>
    set((s) => ({
      player: { ...s.player, completedBattles: s.player.completedBattles + 1 },
    })),

  addExploredTile: (key) =>
    set((s) => ({
      player: {
        ...s.player,
        exploredTiles: s.player.exploredTiles.includes(key)
          ? s.player.exploredTiles
          : [...s.player.exploredTiles, key],
      },
    })),

  resetPlayer: () => set({ player: initialPlayer }),
}));
