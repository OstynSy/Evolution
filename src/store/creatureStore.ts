import { create } from 'zustand';
import { Creature, BodyPart, Ability, Stats } from '../types/creature';
import { createBodyPartInstance } from '../data/parts';

function computeStats(parts: BodyPart[], level: number): Stats {
  let health = 30;
  let attack = 5;
  let defense = 2;
  let speed = 2;

  for (const part of parts) {
    health += part.statBonus.maxHealth ?? 0;
    attack += part.statBonus.attack ?? 0;
    defense += part.statBonus.defense ?? 0;
    speed += part.statBonus.speed ?? 0;
  }

  const lvlMult = 1 + (level - 1) * 0.1;
  return {
    maxHealth: Math.round(health * lvlMult),
    attack: Math.round(attack * lvlMult),
    defense: Math.max(0, Math.round(defense * lvlMult)),
    speed: Math.max(1, Math.round(speed * lvlMult)),
  };
}

function xpToNextLevel(level: number): number {
  return level * 100;
}

const defaultCreature: Creature = {
  id: 'player_creature',
  name: 'My Creature',
  parts: [],
  stats: computeStats([], 1),
  currentHealth: computeStats([], 1).maxHealth,
  abilities: [],
  level: 1,
  xp: 0,
  xpToNextLevel: xpToNextLevel(1),
};

interface CreatureStore {
  creature: Creature;
  setName: (name: string) => void;
  addPart: (partId: string, x: number, y: number) => void;
  removePart: (instanceId: string) => void;
  movePart: (instanceId: string, x: number, y: number) => void;
  setPartColor: (instanceId: string, color: string) => void;
  setPartScale: (instanceId: string, scale: number) => void;
  recalculateStats: () => void;
  applyDamage: (amount: number) => void;
  heal: (amount: number) => void;
  gainXP: (amount: number) => { leveledUp: boolean; newLevel: number };
  learnAbility: (ability: Ability) => void;
  resetCreature: () => void;
}

export const useCreatureStore = create<CreatureStore>((set, get) => ({
  creature: defaultCreature,

  setName: (name) =>
    set((s) => ({ creature: { ...s.creature, name } })),

  addPart: (partId, x, y) => {
    const part = createBodyPartInstance(partId, x, y);
    if (!part) return;
    set((s) => {
      const parts = [...s.creature.parts, part];
      const stats = computeStats(parts, s.creature.level);
      return { creature: { ...s.creature, parts, stats } };
    });
  },

  removePart: (instanceId) =>
    set((s) => {
      const parts = s.creature.parts.filter((p) => p.instanceId !== instanceId);
      const stats = computeStats(parts, s.creature.level);
      return { creature: { ...s.creature, parts, stats } };
    }),

  movePart: (instanceId, x, y) =>
    set((s) => ({
      creature: {
        ...s.creature,
        parts: s.creature.parts.map((p) =>
          p.instanceId === instanceId ? { ...p, position: { x, y } } : p
        ),
      },
    })),

  setPartColor: (instanceId, color) =>
    set((s) => ({
      creature: {
        ...s.creature,
        parts: s.creature.parts.map((p) =>
          p.instanceId === instanceId ? { ...p, color } : p
        ),
      },
    })),

  setPartScale: (instanceId, scale) =>
    set((s) => ({
      creature: {
        ...s.creature,
        parts: s.creature.parts.map((p) =>
          p.instanceId === instanceId ? { ...p, scale } : p
        ),
      },
    })),

  recalculateStats: () =>
    set((s) => {
      const stats = computeStats(s.creature.parts, s.creature.level);
      return { creature: { ...s.creature, stats } };
    }),

  applyDamage: (amount) =>
    set((s) => ({
      creature: {
        ...s.creature,
        currentHealth: Math.max(0, s.creature.currentHealth - amount),
      },
    })),

  heal: (amount) =>
    set((s) => ({
      creature: {
        ...s.creature,
        currentHealth: Math.min(
          s.creature.stats.maxHealth,
          s.creature.currentHealth + amount
        ),
      },
    })),

  gainXP: (amount) => {
    let leveled = false;
    let newLevel = 1;
    set((s) => {
      let xp = s.creature.xp + amount;
      let level = s.creature.level;
      let needed = xpToNextLevel(level);
      while (xp >= needed) {
        xp -= needed;
        level++;
        needed = xpToNextLevel(level);
        leveled = true;
      }
      newLevel = level;
      const stats = computeStats(s.creature.parts, level);
      return {
        creature: {
          ...s.creature,
          xp,
          level,
          xpToNextLevel: needed,
          stats,
          currentHealth: leveled ? stats.maxHealth : s.creature.currentHealth,
        },
      };
    });
    return { leveledUp: leveled, newLevel };
  },

  learnAbility: (ability) =>
    set((s) => {
      if (s.creature.abilities.find((a) => a.id === ability.id)) return s;
      return { creature: { ...s.creature, abilities: [...s.creature.abilities, ability] } };
    }),

  resetCreature: () => set({ creature: defaultCreature }),
}));
