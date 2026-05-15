import { WorldMap, JoystickVector } from '../../types/world';
import { Stats } from '../../types/creature';

const SPEED_SCALE = 0.08;

export function movePlayer(
  world: WorldMap,
  joystick: JoystickVector,
  stats: Stats,
  dt: number
): { x: number; y: number } | null {
  if (!joystick.active || (joystick.dx === 0 && joystick.dy === 0)) return null;

  const speed = stats.speed * SPEED_SCALE;
  const newX = world.playerPos.x + joystick.dx * speed * dt;
  const newY = world.playerPos.y + joystick.dy * speed * dt;

  // Clamp to world bounds
  const cx = Math.max(1, Math.min(world.width - 2, newX));
  const cy = Math.max(1, Math.min(world.height - 2, newY));

  // Check tile passability
  const tileX = Math.floor(cx);
  const tileY = Math.floor(cy);

  if (!world.tiles[tileY] || !world.tiles[tileY][tileX]) return null;
  if (!world.tiles[tileY][tileX].passable) {
    // Try sliding: allow movement along one axis
    const tileXonly = Math.floor(Math.max(1, Math.min(world.width - 2, newX)));
    const tileYcur = Math.floor(world.playerPos.y);
    if (world.tiles[tileYcur]?.[tileXonly]?.passable) {
      return { x: cx, y: world.playerPos.y };
    }
    const tileCurX = Math.floor(world.playerPos.x);
    const tileYonly = Math.floor(Math.max(1, Math.min(world.height - 2, newY)));
    if (world.tiles[tileYonly]?.[tileCurX]?.passable) {
      return { x: world.playerPos.x, y: cy };
    }
    return null;
  }

  return { x: cx, y: cy };
}

export function checkEntityOverlap(
  playerX: number,
  playerY: number,
  entityX: number,
  entityY: number,
  radius = 0.6
): boolean {
  const dx = playerX - entityX;
  const dy = playerY - entityY;
  return Math.sqrt(dx * dx + dy * dy) < radius;
}
