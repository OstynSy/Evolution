export type PartType =
  | 'body'
  | 'head'
  | 'limb'
  | 'tail'
  | 'eye'
  | 'mouth'
  | 'spike'
  | 'fin'
  | 'wing';

export interface Stats {
  maxHealth: number;
  attack: number;
  defense: number;
  speed: number;
}

export type AbilityEffectType =
  | 'damage'
  | 'heal'
  | 'buff_attack'
  | 'buff_defense'
  | 'buff_speed'
  | 'debuff_attack'
  | 'debuff_speed'
  | 'dot'; // damage over time

export interface AbilityEffect {
  type: AbilityEffectType;
  value: number;
  duration?: number; // turns
}

export interface Ability {
  id: string;
  name: string;
  description: string;
  dnaCost: number;
  cooldown: number; // turns
  currentCooldown: number;
  effect: AbilityEffect;
}

export interface BodyPart {
  instanceId: string;
  partId: string;
  type: PartType;
  label: string;
  position: { x: number; y: number };
  scale: number;
  color: string;
  statBonus: Partial<Stats>;
}

export interface Creature {
  id: string;
  name: string;
  parts: BodyPart[];
  stats: Stats;
  currentHealth: number;
  abilities: Ability[];
  level: number;
  xp: number;
  xpToNextLevel: number;
}

export interface StatusEffect {
  type: AbilityEffectType;
  value: number;
  turnsRemaining?: number;
  duration?: number;
}
