import { BuildingType } from '../types/colony';

export interface BuildingDefinition {
  type: BuildingType;
  name: string;
  description: string;
  emoji: string;
  costFood: number;
  costStone: number;
  costDna: number;
  productionFood: number;
  productionStone: number;
  productionDna: number;
  populationBonus: number;
  color: string;
  maxLevel: number;
}

export const BUILDINGS: Record<BuildingType, BuildingDefinition> = {
  nest: {
    type: 'nest', name: 'Nest', description: 'Your colony headquarters. Increases population cap.',
    emoji: '🏠', costFood: 0, costStone: 0, costDna: 0,
    productionFood: 0, productionStone: 0, productionDna: 0,
    populationBonus: 5, color: '#8B7355', maxLevel: 5,
  },
  farm: {
    type: 'farm', name: 'Farm', description: 'Grows food to feed your colony and recruits.',
    emoji: '🌾', costFood: 10, costStone: 5, costDna: 0,
    productionFood: 5, productionStone: 0, productionDna: 0,
    populationBonus: 0, color: '#88AA44', maxLevel: 3,
  },
  barracks: {
    type: 'barracks', name: 'Barracks', description: 'Train and house recruited creatures.',
    emoji: '⚔️', costFood: 20, costStone: 30, costDna: 5,
    productionFood: 0, productionStone: 0, productionDna: 0,
    populationBonus: 3, color: '#CC6644', maxLevel: 3,
  },
  lab: {
    type: 'lab', name: 'Research Lab', description: 'Unlocks new body parts in the Evolution Shop.',
    emoji: '🔬', costFood: 30, costStone: 50, costDna: 20,
    productionFood: 0, productionStone: 0, productionDna: 2,
    populationBonus: 0, color: '#4488CC', maxLevel: 3,
  },
  market: {
    type: 'market', name: 'Market', description: 'Converts food into DNA coins automatically.',
    emoji: '💱', costFood: 40, costStone: 20, costDna: 10,
    productionFood: -3, productionStone: 0, productionDna: 4,
    populationBonus: 0, color: '#DDAA44', maxLevel: 3,
  },
};

export function getBuildingDef(type: BuildingType): BuildingDefinition {
  return BUILDINGS[type];
}

export function getBuildingProductionMultiplier(level: number): number {
  return 1 + (level - 1) * 0.5;
}
