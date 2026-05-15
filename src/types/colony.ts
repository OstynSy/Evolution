export type BuildingType = 'nest' | 'farm' | 'barracks' | 'lab' | 'market';

export interface Building {
  id: string;
  type: BuildingType;
  level: number;
  gridPos: { col: number; row: number };
}

export interface Resources {
  food: number;
  stone: number;
  dna: number;
}

export interface Colony {
  buildings: Building[];
  population: number;
  maxPopulation: number;
  resources: Resources;
  lastTickTime: number;
}
