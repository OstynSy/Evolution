import { Ability } from '../types/creature';

export interface UpgradeAbility {
  id: string;
  name: string;
  description: string;
  dnaCost: number;
  labLevelRequired: number;
  prerequisiteAbilityId?: string;
  ability: Omit<Ability, 'currentCooldown'>;
}

export const ABILITY_UPGRADES: UpgradeAbility[] = [
  {
    id: 'ability_dash',
    name: 'Dash',
    description: 'Lunge at the enemy for 1.5x attack damage.',
    dnaCost: 25,
    labLevelRequired: 0,
    ability: {
      id: 'ability_dash',
      name: 'Dash',
      description: 'Lunge at the enemy for 1.5x attack damage.',
      dnaCost: 25,
      cooldown: 2,
      effect: { type: 'damage', value: 1.5 },
    },
  },
  {
    id: 'ability_camouflage',
    name: 'Camouflage',
    description: 'Boost defense by 5 for 2 turns.',
    dnaCost: 30,
    labLevelRequired: 1,
    ability: {
      id: 'ability_camouflage',
      name: 'Camouflage',
      description: 'Boost defense by 5 for 2 turns.',
      dnaCost: 30,
      cooldown: 3,
      effect: { type: 'buff_defense', value: 5, duration: 2 },
    },
  },
  {
    id: 'ability_regenerate',
    name: 'Regenerate',
    description: 'Heal 20% of max HP.',
    dnaCost: 40,
    labLevelRequired: 1,
    ability: {
      id: 'ability_regenerate',
      name: 'Regenerate',
      description: 'Heal 20% of max HP.',
      dnaCost: 40,
      cooldown: 3,
      effect: { type: 'heal', value: 0.2 },
    },
  },
  {
    id: 'ability_roar',
    name: 'Intimidating Roar',
    description: 'Reduce enemy attack by 4 for 2 turns.',
    dnaCost: 35,
    labLevelRequired: 1,
    prerequisiteAbilityId: 'ability_dash',
    ability: {
      id: 'ability_roar',
      name: 'Intimidating Roar',
      description: 'Reduce enemy attack by 4 for 2 turns.',
      dnaCost: 35,
      cooldown: 3,
      effect: { type: 'debuff_attack', value: 4, duration: 2 },
    },
  },
  {
    id: 'ability_fire_breath',
    name: 'Fire Breath',
    description: 'Deal 2x attack damage. Burns for 3 damage/turn for 3 turns.',
    dnaCost: 80,
    labLevelRequired: 2,
    prerequisiteAbilityId: 'ability_roar',
    ability: {
      id: 'ability_fire_breath',
      name: 'Fire Breath',
      description: 'Deal 2x attack damage. Burns for 3 damage/turn for 3 turns.',
      dnaCost: 80,
      cooldown: 4,
      effect: { type: 'dot', value: 3, duration: 3 },
    },
  },
  {
    id: 'ability_shield_spike',
    name: 'Shield Spike',
    description: 'Boost defense by 8 and reflect 3 damage when hit, for 3 turns.',
    dnaCost: 75,
    labLevelRequired: 2,
    prerequisiteAbilityId: 'ability_camouflage',
    ability: {
      id: 'ability_shield_spike',
      name: 'Shield Spike',
      description: 'Boost defense by 8 and reflect damage.',
      dnaCost: 75,
      cooldown: 4,
      effect: { type: 'buff_defense', value: 8, duration: 3 },
    },
  },
  {
    id: 'ability_ancient_roar',
    name: 'Ancient Roar',
    description: 'Massive intimidation. Enemy loses 50% speed for 3 turns.',
    dnaCost: 150,
    labLevelRequired: 3,
    prerequisiteAbilityId: 'ability_fire_breath',
    ability: {
      id: 'ability_ancient_roar',
      name: 'Ancient Roar',
      description: 'Enemy loses 50% speed for 3 turns.',
      dnaCost: 150,
      cooldown: 5,
      effect: { type: 'debuff_speed', value: 3, duration: 3 },
    },
  },
];

export function getAbilityById(id: string): UpgradeAbility | undefined {
  return ABILITY_UPGRADES.find((u) => u.id === id);
}
