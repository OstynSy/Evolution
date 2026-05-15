export enum TileType {
  GRASS = 'GRASS',
  WATER = 'WATER',
  ROCK = 'ROCK',
  FOREST = 'FOREST',
  CAVE = 'CAVE',
  COLONY = 'COLONY',
  SAND = 'SAND',
}

export interface Tile {
  type: TileType;
  x: number;
  y: number;
  passable: boolean;
}

export type EntityType = 'monster' | 'food' | 'resource' | 'portal';

export interface WorldEntity {
  id: string;
  type: EntityType;
  position: { x: number; y: number };
  hp?: number;
  maxHp?: number;
  templateId?: string;
  label?: string;
  value?: number; // for food/resource
}

export interface WorldMap {
  width: number;
  height: number;
  tiles: Tile[][];
  entities: WorldEntity[];
  playerPos: { x: number; y: number };
}

export interface JoystickVector {
  dx: number;
  dy: number;
  active: boolean;
}
