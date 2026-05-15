import { create } from 'zustand';
import { Colony, Building, BuildingType } from '../types/colony';
import { getBuildingDef, getBuildingProductionMultiplier } from '../data/buildings';

const TICK_INTERVAL_MS = 30000; // 30 seconds

const defaultColony: Colony = {
  buildings: [
    {
      id: 'nest_0',
      type: 'nest',
      level: 1,
      gridPos: { col: 4, row: 4 },
    },
  ],
  population: 1,
  maxPopulation: 5,
  resources: { food: 50, stone: 20, dna: 0 },
  lastTickTime: Date.now(),
};

interface ColonyStore {
  colony: Colony;
  placeBuilding: (type: BuildingType, col: number, row: number) => boolean;
  upgradeBuilding: (id: string) => void;
  tickResources: () => void;
  addResources: (food?: number, stone?: number, dna?: number) => void;
  resetColony: () => void;
}

export const useColonyStore = create<ColonyStore>((set, get) => ({
  colony: defaultColony,

  placeBuilding: (type, col, row) => {
    const { colony } = get();
    const def = getBuildingDef(type);

    // Check resources
    if (
      colony.resources.food < def.costFood ||
      colony.resources.stone < def.costStone ||
      colony.resources.dna < def.costDna
    ) {
      return false;
    }

    // Check tile not occupied
    const occupied = colony.buildings.some(
      (b) => b.gridPos.col === col && b.gridPos.row === row
    );
    if (occupied) return false;

    const building: Building = {
      id: `${type}_${Date.now()}`,
      type,
      level: 1,
      gridPos: { col, row },
    };

    set((s) => ({
      colony: {
        ...s.colony,
        buildings: [...s.colony.buildings, building],
        resources: {
          food: s.colony.resources.food - def.costFood,
          stone: s.colony.resources.stone - def.costStone,
          dna: s.colony.resources.dna - def.costDna,
        },
        maxPopulation:
          s.colony.maxPopulation + def.populationBonus,
      },
    }));
    return true;
  },

  upgradeBuilding: (id) =>
    set((s) => ({
      colony: {
        ...s.colony,
        buildings: s.colony.buildings.map((b) =>
          b.id === id ? { ...b, level: Math.min(b.level + 1, 3) } : b
        ),
      },
    })),

  tickResources: () => {
    const now = Date.now();
    set((s) => {
      const elapsed = now - s.colony.lastTickTime;
      const ticks = Math.floor(elapsed / TICK_INTERVAL_MS);
      if (ticks === 0) return s;

      let food = s.colony.resources.food;
      let stone = s.colony.resources.stone;
      let dna = s.colony.resources.dna;

      for (const building of s.colony.buildings) {
        const def = getBuildingDef(building.type);
        const mult = getBuildingProductionMultiplier(building.level);
        food += def.productionFood * mult * ticks;
        stone += def.productionStone * mult * ticks;
        dna += def.productionDna * mult * ticks;
      }

      return {
        colony: {
          ...s.colony,
          resources: {
            food: Math.max(0, Math.round(food)),
            stone: Math.max(0, Math.round(stone)),
            dna: Math.max(0, Math.round(dna)),
          },
          lastTickTime: s.colony.lastTickTime + ticks * TICK_INTERVAL_MS,
        },
      };
    });
  },

  addResources: (food = 0, stone = 0, dna = 0) =>
    set((s) => ({
      colony: {
        ...s.colony,
        resources: {
          food: s.colony.resources.food + food,
          stone: s.colony.resources.stone + stone,
          dna: s.colony.resources.dna + dna,
        },
      },
    })),

  resetColony: () => set({ colony: defaultColony }),
}));
