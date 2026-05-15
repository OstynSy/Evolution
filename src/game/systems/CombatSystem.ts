import { Creature, Stats, Ability, StatusEffect } from '../../types/creature';
import { MonsterTemplate } from '../../data/monsters';

export type CombatAction = 'attack' | 'ability' | 'eat' | 'flee';

export interface CombatResult {
  outcome: 'victory' | 'defeat' | 'fled' | 'ongoing';
  playerHpAfter: number;
  enemyHpAfter: number;
  dnaEarned: number;
  foodEarned: number;
  xpEarned: number;
  logLines: string[];
  abilityLearnedId?: string;
}

export interface BattleState {
  playerHp: number;
  enemyHp: number;
  playerStatusEffects: StatusEffect[];
  enemyStatusEffects: StatusEffect[];
  turn: number;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function calcDamage(attack: number, defense: number): number {
  const raw = attack + randomInt(-2, 3);
  return Math.max(1, raw - Math.floor(defense * 0.5));
}

function applyStatusEffects(
  stats: Stats,
  effects: StatusEffect[]
): { atkMod: number; defMod: number; speedMod: number; dotDmg: number } {
  let atkMod = 0, defMod = 0, speedMod = 0, dotDmg = 0;
  for (const e of effects) {
    if (e.type === 'buff_attack') atkMod += e.value;
    if (e.type === 'buff_defense') defMod += e.value;
    if (e.type === 'debuff_attack') atkMod -= e.value;
    if (e.type === 'debuff_speed') speedMod -= e.value;
    if (e.type === 'dot') dotDmg += e.value;
  }
  return { atkMod, defMod, speedMod, dotDmg };
}

function tickEffects(effects: StatusEffect[]): StatusEffect[] {
  return effects
    .map((e) => ({ ...e, duration: (e.duration ?? 1) - 1 }))
    .filter((e) => (e.duration ?? 0) > 0);
}

export function chooseEnemyAction(
  playerHp: number,
  playerMaxHp: number,
  enemyHp: number,
  enemyMaxHp: number,
  enemyAbilities: Ability[]
): CombatAction {
  if (enemyAbilities.length > 0 && Math.random() < 0.3) return 'ability';
  return 'attack';
}

export function resolvePlayerTurn(
  action: CombatAction,
  abilityId: string | undefined,
  playerStats: Stats,
  enemyStats: Stats,
  state: BattleState,
  playerAbilities: Ability[]
): { newState: BattleState; log: string } {
  const playerMods = applyStatusEffects(playerStats, state.playerStatusEffects);
  const enemyMods = applyStatusEffects(enemyStats, state.enemyStatusEffects);

  let { playerHp, enemyHp } = state;
  let log = '';

  if (action === 'attack') {
    const dmg = calcDamage(
      playerStats.attack + playerMods.atkMod,
      enemyStats.defense + enemyMods.defMod
    );
    enemyHp -= dmg;
    log = `You attack for ${dmg} damage!`;
  } else if (action === 'ability' && abilityId) {
    const ab = playerAbilities.find((a) => a.id === abilityId);
    if (ab) {
      const { type, value } = ab.effect;
      if (type === 'damage') {
        const dmg = calcDamage(
          Math.round(playerStats.attack * value + playerMods.atkMod),
          enemyStats.defense + enemyMods.defMod
        );
        enemyHp -= dmg;
        log = `${ab.name}: ${dmg} damage!`;
      } else if (type === 'heal') {
        const healAmt = Math.round(playerStats.maxHealth * value);
        playerHp = Math.min(playerStats.maxHealth, playerHp + healAmt);
        log = `${ab.name}: Healed ${healAmt} HP!`;
      } else if (type === 'buff_defense' || type === 'buff_attack') {
        const newEffect: StatusEffect = {
          type,
          value: ab.effect.value,
          duration: ab.effect.duration ?? 2,
        };
        state = { ...state, playerStatusEffects: [...state.playerStatusEffects, newEffect] };
        log = `${ab.name}: Boost active for ${ab.effect.duration} turns!`;
      } else if (type === 'debuff_attack' || type === 'debuff_speed') {
        const newEffect: StatusEffect = {
          type,
          value: ab.effect.value,
          duration: ab.effect.duration ?? 2,
        };
        state = { ...state, enemyStatusEffects: [...state.enemyStatusEffects, newEffect] };
        log = `${ab.name}: Enemy weakened!`;
      } else if (type === 'dot') {
        const dotEffect: StatusEffect = {
          type: 'dot',
          value: ab.effect.value,
          duration: ab.effect.duration ?? 3,
        };
        state = { ...state, enemyStatusEffects: [...state.enemyStatusEffects, dotEffect] };
        log = `${ab.name}: Enemy is burning!`;
      }
    }
  } else if (action === 'eat') {
    const canEat = state.enemyHp < enemyStats.maxHealth * 0.3;
    if (canEat && Math.random() < 0.6) {
      enemyHp = 0;
      log = 'You devour the creature! Learned from it!';
    } else if (canEat) {
      const dmg = calcDamage(enemyStats.attack * 1.5, playerStats.defense);
      playerHp -= dmg;
      log = `Failed to eat! Counterattack: ${dmg} damage!`;
    } else {
      log = 'Enemy is too strong to eat yet!';
    }
  } else if (action === 'flee') {
    log = 'You attempt to flee...';
  }

  return {
    newState: { ...state, playerHp, enemyHp },
    log,
  };
}

export function resolveEnemyTurn(
  enemyTemplate: MonsterTemplate,
  playerStats: Stats,
  state: BattleState
): { newState: BattleState; log: string } {
  const enemyMods = applyStatusEffects(enemyTemplate.stats, state.enemyStatusEffects);
  const playerMods = applyStatusEffects(playerStats, state.playerStatusEffects);

  let { playerHp } = state;
  const atkMod = enemyMods.atkMod;
  const defMod = playerMods.defMod;

  const dmg = calcDamage(
    enemyTemplate.stats.attack + atkMod,
    playerStats.defense + defMod
  );
  playerHp -= dmg;

  // Apply DoT to enemy
  const dotDmg = enemyMods.dotDmg;
  let { enemyHp } = state;
  if (dotDmg > 0) enemyHp -= dotDmg;

  // Tick effects
  const playerFx = tickEffects(state.playerStatusEffects);
  const enemyFx = tickEffects(state.enemyStatusEffects);

  const log = `${enemyTemplate.name} attacks for ${dmg} damage!${dotDmg > 0 ? ` (Burns for ${dotDmg})` : ''}`;

  return {
    newState: {
      ...state,
      playerHp,
      enemyHp,
      playerStatusEffects: playerFx,
      enemyStatusEffects: enemyFx,
      turn: state.turn + 1,
    },
    log,
  };
}

export function calcCombatResult(
  outcome: 'victory' | 'defeat' | 'fled',
  enemy: MonsterTemplate,
  wasEaten: boolean
): Pick<CombatResult, 'dnaEarned' | 'foodEarned' | 'xpEarned'> {
  if (outcome !== 'victory') return { dnaEarned: 0, foodEarned: 0, xpEarned: 0 };
  const dnaMult = wasEaten ? 1.5 : 1;
  return {
    dnaEarned: Math.round(enemy.dnaReward * dnaMult),
    foodEarned: wasEaten ? enemy.foodValue * 2 : enemy.foodValue,
    xpEarned: enemy.xpReward,
  };
}
