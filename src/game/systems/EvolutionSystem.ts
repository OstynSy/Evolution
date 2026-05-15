import { usePlayerStore } from '../../store/playerStore';
import { useCreatureStore } from '../../store/creatureStore';
import { PARTS, getPartById } from '../../data/parts';
import { ABILITY_UPGRADES, getAbilityById } from '../../data/upgrades';

export function getLabLevel(): number {
  const { useColonyStore } = require('../../store/colonyStore');
  const { colony } = useColonyStore.getState();
  const lab = colony.buildings.find((b: any) => b.type === 'lab');
  return lab ? lab.level : 0;
}

export function getAvailablePartsToUnlock() {
  const { player } = usePlayerStore.getState();
  const labLevel = getLabLevel();
  return PARTS.filter(
    (p) =>
      !player.unlockedParts.includes(p.id) &&
      p.labLevelRequired <= labLevel &&
      p.dnaCost > 0
  );
}

export function getAvailableAbilitiesToUnlock() {
  const { player } = usePlayerStore.getState();
  const labLevel = getLabLevel();
  return ABILITY_UPGRADES.filter(
    (u) =>
      !player.unlockedAbilities.includes(u.id) &&
      u.labLevelRequired <= labLevel &&
      (!u.prerequisiteAbilityId || player.unlockedAbilities.includes(u.prerequisiteAbilityId))
  );
}

export function purchasePart(partId: string): boolean {
  const { player, spendDNA, unlockPart } = usePlayerStore.getState();
  const def = getPartById(partId);
  if (!def) return false;
  if (player.unlockedParts.includes(partId)) return false;
  if (!spendDNA(def.dnaCost)) return false;
  unlockPart(partId);
  return true;
}

export function purchaseAbility(abilityId: string): boolean {
  const { spendDNA, unlockAbility } = usePlayerStore.getState();
  const upgrade = getAbilityById(abilityId);
  if (!upgrade) return false;
  if (!spendDNA(upgrade.dnaCost)) return false;
  unlockAbility(abilityId);
  const { learnAbility } = useCreatureStore.getState();
  learnAbility({ ...upgrade.ability, currentCooldown: 0 });
  return true;
}
