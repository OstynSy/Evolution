import { WorldMap, Tile, TileType, WorldEntity } from '../../types/world';
import { getRandomMonster } from '../../data/monsters';

const MAP_WIDTH = 64;
const MAP_HEIGHT = 64;

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function tileTypeAt(x: number, y: number, rand: () => number, w: number, h: number): TileType {
  // Water border
  if (x < 3 || y < 3 || x >= w - 3 || y >= h - 3) return TileType.WATER;

  const nx = x / w - 0.5;
  const ny = y / h - 0.5;

  // Simple noise via sin
  const noise =
    Math.sin(nx * 13.7 + ny * 7.3) * 0.5 +
    Math.sin(nx * 5.1 + ny * 11.9) * 0.3 +
    Math.sin(nx * 23.4 - ny * 3.7) * 0.2;

  if (noise > 0.55) return TileType.ROCK;
  if (noise > 0.35) return TileType.FOREST;
  if (noise < -0.4) return TileType.WATER;
  if (noise < -0.25) return TileType.SAND;

  // Colony zone at center
  const cx = Math.floor(w / 2);
  const cy = Math.floor(h / 2);
  if (Math.abs(x - cx) <= 3 && Math.abs(y - cy) <= 3) return TileType.COLONY;

  return TileType.GRASS;
}

function isPassable(type: TileType): boolean {
  return type !== TileType.WATER && type !== TileType.ROCK;
}

export function generateWorld(seed: number): WorldMap {
  const rand = seededRandom(seed);
  const tiles: Tile[][] = [];

  for (let y = 0; y < MAP_HEIGHT; y++) {
    tiles[y] = [];
    for (let x = 0; x < MAP_WIDTH; x++) {
      const type = tileTypeAt(x, y, rand, MAP_WIDTH, MAP_HEIGHT);
      tiles[y][x] = { type, x, y, passable: isPassable(type) };
    }
  }

  const entities: WorldEntity[] = [];
  let entityId = 0;

  // Scatter monsters (avoid center colony zone)
  for (let i = 0; i < 35; i++) {
    let ex: number, ey: number;
    let tries = 0;
    do {
      ex = 4 + Math.floor(rand() * (MAP_WIDTH - 8));
      ey = 4 + Math.floor(rand() * (MAP_HEIGHT - 8));
      tries++;
    } while (
      (!tiles[ey][ex].passable ||
        (Math.abs(ex - MAP_WIDTH / 2) < 8 && Math.abs(ey - MAP_HEIGHT / 2) < 8)) &&
      tries < 20
    );

    const level = Math.floor(rand() * 8) + 1;
    const template = getRandomMonster(level, level + 2);
    entities.push({
      id: `monster_${entityId++}`,
      type: 'monster',
      position: { x: ex, y: ey },
      hp: template.stats.maxHealth,
      maxHp: template.stats.maxHealth,
      templateId: template.id,
      label: template.name,
    });
  }

  // Scatter food
  for (let i = 0; i < 20; i++) {
    let fx: number, fy: number;
    let tries = 0;
    do {
      fx = 4 + Math.floor(rand() * (MAP_WIDTH - 8));
      fy = 4 + Math.floor(rand() * (MAP_HEIGHT - 8));
      tries++;
    } while (!tiles[fy][fx].passable && tries < 20);

    entities.push({
      id: `food_${entityId++}`,
      type: 'food',
      position: { x: fx, y: fy },
      value: 10 + Math.floor(rand() * 15),
      label: 'Food',
    });
  }

  // Scatter DNA fragments
  for (let i = 0; i < 10; i++) {
    let rx: number, ry: number;
    let tries = 0;
    do {
      rx = 4 + Math.floor(rand() * (MAP_WIDTH - 8));
      ry = 4 + Math.floor(rand() * (MAP_HEIGHT - 8));
      tries++;
    } while (!tiles[ry][rx].passable && tries < 20);

    entities.push({
      id: `resource_${entityId++}`,
      type: 'resource',
      position: { x: rx, y: ry },
      value: 2 + Math.floor(rand() * 5),
      label: 'DNA',
    });
  }

  // Colony portal marker
  entities.push({
    id: 'portal_colony',
    type: 'portal',
    position: { x: MAP_WIDTH / 2, y: MAP_HEIGHT / 2 },
    label: 'Colony',
  });

  return {
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
    tiles,
    entities,
    playerPos: { x: MAP_WIDTH / 2 + 5, y: MAP_HEIGHT / 2 + 5 },
  };
}
