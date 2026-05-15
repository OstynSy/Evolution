import { create } from 'zustand';
import { WorldMap, WorldEntity, JoystickVector } from '../types/world';
import { generateWorld } from '../game/world/WorldGenerator';

interface WorldStore {
  world: WorldMap;
  joystick: JoystickVector;
  generateNewWorld: (seed?: number) => void;
  setPlayerPos: (x: number, y: number) => void;
  updateEntity: (id: string, update: Partial<WorldEntity>) => void;
  removeEntity: (id: string) => void;
  spawnEntity: (entity: WorldEntity) => void;
  setJoystick: (vec: JoystickVector) => void;
}

export const useWorldStore = create<WorldStore>((set, get) => ({
  world: generateWorld(42),
  joystick: { dx: 0, dy: 0, active: false },

  generateNewWorld: (seed = Math.floor(Math.random() * 99999)) =>
    set({ world: generateWorld(seed) }),

  setPlayerPos: (x, y) =>
    set((s) => ({ world: { ...s.world, playerPos: { x, y } } })),

  updateEntity: (id, update) =>
    set((s) => ({
      world: {
        ...s.world,
        entities: s.world.entities.map((e) =>
          e.id === id ? { ...e, ...update } : e
        ),
      },
    })),

  removeEntity: (id) =>
    set((s) => ({
      world: {
        ...s.world,
        entities: s.world.entities.filter((e) => e.id !== id),
      },
    })),

  spawnEntity: (entity) =>
    set((s) => ({
      world: { ...s.world, entities: [...s.world.entities, entity] },
    })),

  setJoystick: (vec) => set({ joystick: vec }),
}));
