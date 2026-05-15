import { BodyPart, PartType, Stats } from '../types/creature';

export interface PartDefinition {
  id: string;
  type: PartType;
  label: string;
  defaultColor: string;
  statBonus: Partial<Stats>;
  shape: 'circle' | 'rect' | 'oval' | 'triangle' | 'diamond';
  dnaCost: number; // 0 = starter
  labLevelRequired: number;
  description: string;
}

export const PARTS: PartDefinition[] = [
  // Bodies
  {
    id: 'body_blob', type: 'body', label: 'Blob Body', defaultColor: '#7EC8A0',
    statBonus: { maxHealth: 20 }, shape: 'circle', dnaCost: 0, labLevelRequired: 0,
    description: 'A soft, round body. Good HP.',
  },
  {
    id: 'body_tank', type: 'body', label: 'Tank Body', defaultColor: '#8B7355',
    statBonus: { maxHealth: 10, defense: 3 }, shape: 'rect', dnaCost: 30, labLevelRequired: 1,
    description: 'Heavy armored body. Great defense.',
  },
  {
    id: 'body_swift', type: 'body', label: 'Swift Body', defaultColor: '#6699CC',
    statBonus: { speed: 2, maxHealth: 5 }, shape: 'oval', dnaCost: 40, labLevelRequired: 1,
    description: 'Streamlined body. Extra speed.',
  },
  {
    id: 'body_spiky', type: 'body', label: 'Spiky Body', defaultColor: '#CC6666',
    statBonus: { attack: 2, defense: 1, maxHealth: 8 }, shape: 'diamond', dnaCost: 60, labLevelRequired: 2,
    description: 'Thorned body. Deals contact damage.',
  },

  // Heads
  {
    id: 'head_round', type: 'head', label: 'Round Head', defaultColor: '#7EC8A0',
    statBonus: { maxHealth: 5 }, shape: 'circle', dnaCost: 0, labLevelRequired: 0,
    description: 'Basic round head.',
  },
  {
    id: 'head_horn', type: 'head', label: 'Horned Head', defaultColor: '#B8860B',
    statBonus: { attack: 4 }, shape: 'triangle', dnaCost: 25, labLevelRequired: 1,
    description: 'A head with a piercing horn.',
  },
  {
    id: 'head_armored', type: 'head', label: 'Armored Head', defaultColor: '#696969',
    statBonus: { defense: 4 }, shape: 'rect', dnaCost: 35, labLevelRequired: 1,
    description: 'Plated skull. High defense.',
  },

  // Limbs
  {
    id: 'limb_small', type: 'limb', label: 'Small Leg', defaultColor: '#7EC8A0',
    statBonus: { speed: 1 }, shape: 'rect', dnaCost: 0, labLevelRequired: 0,
    description: 'Tiny leg. Slight speed bonus.',
  },
  {
    id: 'limb_strong', type: 'limb', label: 'Strong Leg', defaultColor: '#8B7355',
    statBonus: { attack: 2, speed: 1 }, shape: 'rect', dnaCost: 20, labLevelRequired: 0,
    description: 'Muscular leg. More speed and kick.',
  },
  {
    id: 'limb_claw', type: 'limb', label: 'Claw', defaultColor: '#CC6666',
    statBonus: { attack: 4 }, shape: 'triangle', dnaCost: 35, labLevelRequired: 1,
    description: 'Sharp claws. High attack bonus.',
  },

  // Tails
  {
    id: 'tail_simple', type: 'tail', label: 'Simple Tail', defaultColor: '#7EC8A0',
    statBonus: { speed: 1 }, shape: 'oval', dnaCost: 0, labLevelRequired: 0,
    description: 'Basic tail. Helps with balance.',
  },
  {
    id: 'tail_spike', type: 'tail', label: 'Spike Tail', defaultColor: '#CC4444',
    statBonus: { attack: 3, speed: 1 }, shape: 'triangle', dnaCost: 30, labLevelRequired: 1,
    description: 'Dangerous spiked tail.',
  },
  {
    id: 'tail_fin', type: 'tail', label: 'Fin Tail', defaultColor: '#6699CC',
    statBonus: { speed: 3 }, shape: 'triangle', dnaCost: 25, labLevelRequired: 1,
    description: 'Fin-like tail. Great speed in water.',
  },

  // Eyes
  {
    id: 'eye_simple', type: 'eye', label: 'Simple Eye', defaultColor: '#000000',
    statBonus: {}, shape: 'circle', dnaCost: 0, labLevelRequired: 0,
    description: 'Basic eye.',
  },
  {
    id: 'eye_compound', type: 'eye', label: 'Compound Eye', defaultColor: '#2244AA',
    statBonus: { speed: 1 }, shape: 'oval', dnaCost: 15, labLevelRequired: 0,
    description: 'Wide vision. React faster in battle.',
  },

  // Mouths
  {
    id: 'mouth_basic', type: 'mouth', label: 'Basic Mouth', defaultColor: '#CC6666',
    statBonus: { attack: 1 }, shape: 'rect', dnaCost: 0, labLevelRequired: 0,
    description: 'Simple biting mouth.',
  },
  {
    id: 'mouth_fang', type: 'mouth', label: 'Fangs', defaultColor: '#FFFFFF',
    statBonus: { attack: 5 }, shape: 'triangle', dnaCost: 40, labLevelRequired: 1,
    description: 'Venomous fangs. High attack power.',
  },
  {
    id: 'mouth_filter', type: 'mouth', label: 'Filter Mouth', defaultColor: '#88BBCC',
    statBonus: { maxHealth: 8 }, shape: 'oval', dnaCost: 20, labLevelRequired: 0,
    description: 'Filters nutrients. More HP.',
  },

  // Spikes
  {
    id: 'spike_small', type: 'spike', label: 'Small Spike', defaultColor: '#CC4444',
    statBonus: { attack: 2, defense: 1 }, shape: 'triangle', dnaCost: 15, labLevelRequired: 0,
    description: 'Sharp defensive spike.',
  },
  {
    id: 'spike_large', type: 'spike', label: 'Large Spike', defaultColor: '#882222',
    statBonus: { attack: 4, defense: 2 }, shape: 'triangle', dnaCost: 50, labLevelRequired: 2,
    description: 'Massive spike. High offense and defense.',
  },

  // Fins
  {
    id: 'fin_dorsal', type: 'fin', label: 'Dorsal Fin', defaultColor: '#6699CC',
    statBonus: { speed: 2 }, shape: 'triangle', dnaCost: 20, labLevelRequired: 0,
    description: 'Stabilizing fin. Boosts speed.',
  },

  // Wings
  {
    id: 'wing_small', type: 'wing', label: 'Small Wings', defaultColor: '#DDAA44',
    statBonus: { speed: 3, defense: -1 }, shape: 'triangle', dnaCost: 80, labLevelRequired: 3,
    description: 'Light wings. Major speed boost.',
  },
  {
    id: 'wing_large', type: 'wing', label: 'Large Wings', defaultColor: '#AA6622',
    statBonus: { speed: 5, attack: 2, defense: -2 }, shape: 'triangle', dnaCost: 120, labLevelRequired: 3,
    description: 'Powerful wings. Fastest creature possible.',
  },
];

export const STARTER_PARTS = PARTS.filter((p) => p.dnaCost === 0).map((p) => p.id);

export function getPartById(id: string): PartDefinition | undefined {
  return PARTS.find((p) => p.id === id);
}

export function createBodyPartInstance(partId: string, x = 0, y = 0): BodyPart | null {
  const def = getPartById(partId);
  if (!def) return null;
  return {
    instanceId: `${partId}_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    partId,
    type: def.type,
    label: def.label,
    position: { x, y },
    scale: 1,
    color: def.defaultColor,
    statBonus: def.statBonus,
  };
}
