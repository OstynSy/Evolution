import { WorldEntity } from '../../types/world';

export type AIBehavior = 'idle' | 'wander' | 'chase' | 'flee';

export interface AIState {
  behavior: AIBehavior;
  moveTimer: number;
  moveDir: { dx: number; dy: number };
}

const AI_MAP = new Map<string, AIState>();

function getAI(id: string): AIState {
  if (!AI_MAP.has(id)) {
    AI_MAP.set(id, {
      behavior: 'idle',
      moveTimer: Math.random() * 2,
      moveDir: { dx: 0, dy: 0 },
    });
  }
  return AI_MAP.get(id)!;
}

export function updateAI(
  entity: WorldEntity,
  playerX: number,
  playerY: number,
  playerLevel: number,
  dt: number,
  aggression: 'passive' | 'neutral' | 'aggressive'
): { dx: number; dy: number } {
  const ai = getAI(entity.id);
  const ex = entity.position.x;
  const ey = entity.position.y;
  const distToPlayer = Math.sqrt((ex - playerX) ** 2 + (ey - playerY) ** 2);

  ai.moveTimer -= dt;

  if (aggression === 'aggressive' && distToPlayer < 8) {
    ai.behavior = 'chase';
  } else if (aggression === 'passive' && distToPlayer < 5) {
    ai.behavior = 'flee';
  } else if (ai.moveTimer <= 0) {
    ai.behavior = Math.random() < 0.4 ? 'wander' : 'idle';
    ai.moveTimer = 1 + Math.random() * 3;
    if (ai.behavior === 'wander') {
      const angle = Math.random() * Math.PI * 2;
      ai.moveDir = { dx: Math.cos(angle), dy: Math.sin(angle) };
    } else {
      ai.moveDir = { dx: 0, dy: 0 };
    }
  }

  if (ai.behavior === 'chase') {
    const len = distToPlayer || 1;
    return { dx: (playerX - ex) / len, dy: (playerY - ey) / len };
  }

  if (ai.behavior === 'flee') {
    const len = distToPlayer || 1;
    return { dx: -(playerX - ex) / len, dy: -(playerY - ey) / len };
  }

  if (ai.behavior === 'wander') {
    return ai.moveDir;
  }

  return { dx: 0, dy: 0 };
}

export function clearAI() {
  AI_MAP.clear();
}
