import { Creature, Stats } from '../types/creature';

export interface MonsterTemplate {
  id: string;
  name: string;
  level: number;
  stats: Stats;
  color: string;
  bodyShape: 'circle' | 'oval' | 'rect' | 'diamond';
  dnaReward: number;
  xpReward: number;
  foodValue: number;
  aggression: 'passive' | 'neutral' | 'aggressive';
  description: string;
}

export const MONSTER_TEMPLATES: MonsterTemplate[] = [
  {
    id: 'slimeling', name: 'Slimeling', level: 1,
    stats: { maxHealth: 20, attack: 4, defense: 1, speed: 1 },
    color: '#88CC44', bodyShape: 'circle',
    dnaReward: 3, xpReward: 15, foodValue: 5,
    aggression: 'neutral', description: 'A harmless blob creature.',
  },
  {
    id: 'snapbug', name: 'Snap Bug', level: 2,
    stats: { maxHealth: 15, attack: 7, defense: 2, speed: 3 },
    color: '#CCAA22', bodyShape: 'oval',
    dnaReward: 5, xpReward: 20, foodValue: 3,
    aggression: 'aggressive', description: 'Fast and bites hard.',
  },
  {
    id: 'rockcritter', name: 'Rock Critter', level: 3,
    stats: { maxHealth: 35, attack: 5, defense: 6, speed: 1 },
    color: '#888888', bodyShape: 'rect',
    dnaReward: 8, xpReward: 30, foodValue: 8,
    aggression: 'neutral', description: 'Heavily armored but slow.',
  },
  {
    id: 'spike_runner', name: 'Spike Runner', level: 4,
    stats: { maxHealth: 25, attack: 9, defense: 3, speed: 4 },
    color: '#CC4444', bodyShape: 'diamond',
    dnaReward: 10, xpReward: 40, foodValue: 6,
    aggression: 'aggressive', description: 'Charges at enemies with spikes.',
  },
  {
    id: 'forest_lurker', name: 'Forest Lurker', level: 5,
    stats: { maxHealth: 40, attack: 8, defense: 5, speed: 2 },
    color: '#336633', bodyShape: 'oval',
    dnaReward: 12, xpReward: 50, foodValue: 10,
    aggression: 'aggressive', description: 'Hides in the trees. Dangerous.',
  },
  {
    id: 'cave_crawler', name: 'Cave Crawler', level: 6,
    stats: { maxHealth: 50, attack: 12, defense: 4, speed: 2 },
    color: '#443355', bodyShape: 'rect',
    dnaReward: 15, xpReward: 65, foodValue: 12,
    aggression: 'aggressive', description: 'Blind but has echolocation.',
  },
  {
    id: 'thorn_beast', name: 'Thorn Beast', level: 8,
    stats: { maxHealth: 60, attack: 15, defense: 8, speed: 2 },
    color: '#884422', bodyShape: 'diamond',
    dnaReward: 20, xpReward: 80, foodValue: 15,
    aggression: 'aggressive', description: 'Covered in barbs. Tough fight.',
  },
  {
    id: 'storm_finch', name: 'Storm Finch', level: 7,
    stats: { maxHealth: 35, attack: 14, defense: 2, speed: 7 },
    color: '#4488CC', bodyShape: 'oval',
    dnaReward: 18, xpReward: 70, foodValue: 8,
    aggression: 'aggressive', description: 'Swoops fast. Hard to hit.',
  },
  {
    id: 'bog_giant', name: 'Bog Giant', level: 10,
    stats: { maxHealth: 90, attack: 18, defense: 10, speed: 1 },
    color: '#557744', bodyShape: 'rect',
    dnaReward: 30, xpReward: 120, foodValue: 25,
    aggression: 'neutral', description: 'Massive swamp creature. Very tough.',
  },
  {
    id: 'crystal_worm', name: 'Crystal Worm', level: 9,
    stats: { maxHealth: 70, attack: 16, defense: 12, speed: 2 },
    color: '#AACCEE', bodyShape: 'oval',
    dnaReward: 25, xpReward: 100, foodValue: 20,
    aggression: 'passive', description: 'Feeds on minerals. Attacks if cornered.',
  },
  {
    id: 'alpha_predator', name: 'Alpha Predator', level: 12,
    stats: { maxHealth: 120, attack: 22, defense: 14, speed: 4 },
    color: '#882222', bodyShape: 'diamond',
    dnaReward: 50, xpReward: 200, foodValue: 35,
    aggression: 'aggressive', description: 'Top of the food chain. Boss creature.',
  },
  {
    id: 'ancient_titan', name: 'Ancient Titan', level: 15,
    stats: { maxHealth: 200, attack: 28, defense: 20, speed: 2 },
    color: '#664422', bodyShape: 'rect',
    dnaReward: 100, xpReward: 400, foodValue: 50,
    aggression: 'aggressive', description: 'Ancient creature. Ultimate challenge.',
  },
];

export function getMonsterByLevel(targetLevel: number): MonsterTemplate {
  const sorted = [...MONSTER_TEMPLATES].sort(
    (a, b) => Math.abs(a.level - targetLevel) - Math.abs(b.level - targetLevel)
  );
  return sorted[0];
}

export function getRandomMonster(minLevel = 1, maxLevel = 5): MonsterTemplate {
  const eligible = MONSTER_TEMPLATES.filter(
    (m) => m.level >= minLevel && m.level <= maxLevel
  );
  if (!eligible.length) return MONSTER_TEMPLATES[0];
  return eligible[Math.floor(Math.random() * eligible.length)];
}
