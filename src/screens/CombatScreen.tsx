import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal,
} from 'react-native';
import { Canvas, Circle, Rect as SkiaRect, Oval } from '@shopify/react-native-skia';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCreatureStore } from '../store/creatureStore';
import { usePlayerStore } from '../store/playerStore';
import { useWorldStore } from '../store/worldStore';
import { useColonyStore } from '../store/colonyStore';
import { RootStackParamList } from '../navigation/AppNavigator';
import { HealthBar } from '../components/HealthBar';
import { MONSTER_TEMPLATES, getRandomMonster, MonsterTemplate } from '../data/monsters';
import {
  BattleState,
  CombatAction,
  resolvePlayerTurn,
  resolveEnemyTurn,
  calcCombatResult,
  chooseEnemyAction,
} from '../game/systems/CombatSystem';
import { ABILITY_UPGRADES } from '../data/upgrades';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Combat'>;
type Route = RouteProp<RootStackParamList, 'Combat'>;

const ARENA_W = 260;
const ARENA_H = 180;

function CreatureAvatar({ color, size = 50, parts }: { color: string; size?: number; parts?: { color: string }[] }) {
  return (
    <Canvas style={{ width: ARENA_W / 2, height: ARENA_H }}>
      <Circle cx={ARENA_W / 4} cy={ARENA_H / 2} r={size / 2} color={color} />
      {parts?.slice(0, 3).map((p, i) => {
        const angle = (i / 3) * Math.PI * 2;
        return (
          <Circle
            key={i}
            cx={ARENA_W / 4 + Math.cos(angle) * (size / 2 + 5)}
            cy={ARENA_H / 2 + Math.sin(angle) * (size / 2 + 5)}
            r={8}
            color={p.color}
          />
        );
      })}
      <Circle cx={ARENA_W / 4 - 8} cy={ARENA_H / 2 - 8} r={4} color="#FFFFFF" />
      <Circle cx={ARENA_W / 4 + 8} cy={ARENA_H / 2 - 8} r={4} color="#FFFFFF" />
    </Canvas>
  );
}

function MonsterAvatar({ template }: { template: MonsterTemplate }) {
  const size = 50;
  return (
    <Canvas style={{ width: ARENA_W / 2, height: ARENA_H }}>
      {template.bodyShape === 'circle' && (
        <Circle cx={ARENA_W / 4} cy={ARENA_H / 2} r={size / 2} color={template.color} />
      )}
      {template.bodyShape === 'oval' && (
        <Oval
          x={ARENA_W / 4 - size * 0.6}
          y={ARENA_H / 2 - size * 0.4}
          width={size * 1.2}
          height={size * 0.8}
          color={template.color}
        />
      )}
      {template.bodyShape === 'rect' && (
        <SkiaRect
          x={ARENA_W / 4 - size / 2}
          y={ARENA_H / 2 - size / 3}
          width={size}
          height={size * 0.65}
          color={template.color}
        />
      )}
      {template.bodyShape === 'diamond' && (
        <SkiaRect
          x={ARENA_W / 4 - size / 2.5}
          y={ARENA_H / 2 - size / 2.5}
          width={size * 0.8}
          height={size * 0.8}
          color={template.color}
          transform={[{ rotate: 0.785 }]}
        />
      )}
      <Circle cx={ARENA_W / 4 - 8} cy={ARENA_H / 2 - 8} r={4} color="#CC0000" />
      <Circle cx={ARENA_W / 4 + 8} cy={ARENA_H / 2 - 8} r={4} color="#CC0000" />
    </Canvas>
  );
}

export function CombatScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { creature, applyDamage, heal, gainXP, learnAbility } = useCreatureStore();
  const { earnDNA } = usePlayerStore();
  const { removeEntity } = useWorldStore();
  const { addResources } = useColonyStore();

  const enemyTemplateId = route.params?.enemyTemplateId;
  const enemyEntityId = route.params?.enemyEntityId;
  const [enemy] = useState<MonsterTemplate>(() => {
    const tmpl = MONSTER_TEMPLATES.find((m) => m.id === enemyTemplateId);
    return tmpl ?? getRandomMonster(creature.level, creature.level + 2);
  });

  const [battleState, setBattleState] = useState<BattleState>({
    playerHp: creature.currentHealth,
    enemyHp: enemy.stats.maxHealth,
    playerStatusEffects: [],
    enemyStatusEffects: [],
    turn: 1,
  });
  const [log, setLog] = useState<string[]>([`You encounter a ${enemy.name}! Battle begins!`]);
  const [phase, setPhase] = useState<'player' | 'enemy' | 'ended'>('player');
  const [resultModal, setResultModal] = useState<{ outcome: string; title: string; subtitle: string } | null>(null);
  const [wasEaten, setWasEaten] = useState(false);

  const addLog = (line: string) => setLog((l) => [...l, line]);

  const handleAction = (action: CombatAction, abilityId?: string) => {
    if (phase !== 'player') return;

    // Flee check
    if (action === 'flee') {
      const fleeChance = 0.4 + (creature.stats.speed - enemy.stats.speed) * 0.05;
      if (Math.random() < fleeChance) {
        addLog('You escaped!');
        setPhase('ended');
        setResultModal({ outcome: 'fled', title: 'Escaped!', subtitle: 'You fled from battle.' });
        return;
      } else {
        addLog('Failed to flee!');
        setPhase('enemy');
        doEnemyTurn(battleState);
        return;
      }
    }

    const { newState, log: pLog } = resolvePlayerTurn(
      action, abilityId, creature.stats, enemy.stats, battleState, creature.abilities
    );
    addLog(pLog);

    const ate = action === 'eat' && newState.enemyHp <= 0;
    if (ate) setWasEaten(true);

    setBattleState(newState);

    if (newState.enemyHp <= 0) {
      setPhase('ended');
      handleVictory(newState, ate || wasEaten);
      return;
    }

    setPhase('enemy');
    setTimeout(() => doEnemyTurn(newState), 600);
  };

  const doEnemyTurn = (state: BattleState) => {
    const enemyAction = chooseEnemyAction(
      state.playerHp, creature.stats.maxHealth,
      state.enemyHp, enemy.stats.maxHealth,
      []
    );
    const { newState, log: eLog } = resolveEnemyTurn(enemy, creature.stats, state);
    addLog(eLog);
    setBattleState(newState);

    if (newState.playerHp <= 0) {
      setPhase('ended');
      setResultModal({ outcome: 'defeat', title: 'Defeated!', subtitle: 'You were knocked out...' });
      return;
    }

    setPhase('player');
  };

  const handleVictory = (state: BattleState, eaten: boolean) => {
    const { dnaEarned, foodEarned, xpEarned } = calcCombatResult('victory', enemy, eaten);
    earnDNA(dnaEarned);
    addResources(foodEarned);
    const { leveledUp } = gainXP(xpEarned);
    removeEntity(enemyEntityId);

    let subtitle = `+${dnaEarned} DNA  +${xpEarned} XP  +${foodEarned} Food`;
    if (leveledUp) subtitle += '\n⭐ LEVEL UP!';
    setResultModal({ outcome: 'victory', title: `${enemy.name} defeated!`, subtitle });
  };

  const handleClose = (outcome: string) => {
    if (outcome === 'defeat') {
      applyDamage(creature.currentHealth * 0.5);
    } else if (outcome === 'victory') {
      applyDamage(creature.currentHealth - battleState.playerHp);
    }
    navigation.goBack();
  };

  const canEat = battleState.enemyHp < enemy.stats.maxHealth * 0.3;
  const hpPct = battleState.playerHp / creature.stats.maxHealth;
  const enemyHpPct = battleState.enemyHp / enemy.stats.maxHealth;

  return (
    <View style={styles.container}>
      <Text style={styles.turnText}>TURN {battleState.turn} — {phase === 'player' ? 'YOUR MOVE' : 'ENEMY ATTACKING...'}</Text>

      {/* Arena */}
      <View style={styles.arena}>
        <View style={styles.combatant}>
          <Text style={styles.combatantName}>{creature.name}</Text>
          <CreatureAvatar color="#4A90D9" parts={creature.parts} />
          <HealthBar current={battleState.playerHp} max={creature.stats.maxHealth} label="HP" height={12} showText />
        </View>

        <Text style={styles.vs}>VS</Text>

        <View style={styles.combatant}>
          <Text style={[styles.combatantName, { color: '#CC4444' }]}>{enemy.name}</Text>
          <MonsterAvatar template={enemy} />
          <HealthBar current={battleState.enemyHp} max={enemy.stats.maxHealth} label="HP" height={12} showText />
        </View>
      </View>

      {/* Combat Log */}
      <ScrollView style={styles.logScroll} contentContainerStyle={styles.logContent}>
        {log.map((line, i) => (
          <Text key={i} style={[styles.logLine, i === log.length - 1 && styles.logLineLatest]}>
            {line}
          </Text>
        ))}
      </ScrollView>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.attackBtn, phase !== 'player' && styles.btnDisabled]}
          onPress={() => handleAction('attack')}
          disabled={phase !== 'player'}
        >
          <Text style={styles.actionBtnText}>⚔️ Attack</Text>
        </TouchableOpacity>

        {creature.abilities.length > 0 && (
          <TouchableOpacity
            style={[styles.actionBtn, styles.abilityBtn, phase !== 'player' && styles.btnDisabled]}
            onPress={() => handleAction('ability', creature.abilities[0].id)}
            disabled={phase !== 'player'}
          >
            <Text style={styles.actionBtnText}>✨ {creature.abilities[0].name}</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.actionBtn, styles.eatBtn, (!canEat || phase !== 'player') && styles.btnDisabled]}
          onPress={() => handleAction('eat')}
          disabled={!canEat || phase !== 'player'}
        >
          <Text style={styles.actionBtnText}>🍖 Eat{!canEat ? ' (HP>30%)' : ''}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.fleeBtn, phase !== 'player' && styles.btnDisabled]}
          onPress={() => handleAction('flee')}
          disabled={phase !== 'player'}
        >
          <Text style={styles.actionBtnText}>🏃 Flee</Text>
        </TouchableOpacity>
      </View>

      {/* Result Modal */}
      {resultModal && (
        <Modal transparent animationType="fade">
          <View style={styles.modalBg}>
            <View style={[styles.resultModal, resultModal.outcome === 'victory' && styles.victoryModal]}>
              <Text style={styles.resultTitle}>{resultModal.title}</Text>
              <Text style={styles.resultSubtitle}>{resultModal.subtitle}</Text>
              <TouchableOpacity
                style={styles.continueBtn}
                onPress={() => {
                  setResultModal(null);
                  handleClose(resultModal.outcome);
                }}
              >
                <Text style={styles.continueBtnText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D1A', padding: 16 },
  turnText: { color: '#FFDD44', textAlign: 'center', fontWeight: 'bold', fontSize: 14, marginBottom: 12 },
  arena: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#3A3A5A',
  },
  combatant: { flex: 1, alignItems: 'center', gap: 6 },
  combatantName: { color: '#4A90D9', fontWeight: 'bold', fontSize: 13 },
  vs: { color: '#666666', fontWeight: '900', fontSize: 20, marginHorizontal: 8 },
  logScroll: { flex: 1, backgroundColor: '#111120', borderRadius: 8, marginBottom: 12 },
  logContent: { padding: 10, gap: 4 },
  logLine: { color: '#8899AA', fontSize: 12 },
  logLineLatest: { color: '#FFFFFF', fontWeight: 'bold' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  actionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 10,
    minWidth: 120,
    alignItems: 'center',
  },
  attackBtn: { backgroundColor: '#CC4444' },
  abilityBtn: { backgroundColor: '#4A44CC' },
  eatBtn: { backgroundColor: '#44AA44' },
  fleeBtn: { backgroundColor: '#AA6622' },
  btnDisabled: { opacity: 0.4 },
  actionBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', alignItems: 'center', justifyContent: 'center' },
  resultModal: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: '#CC4444',
    minWidth: 280,
  },
  victoryModal: { borderColor: '#44CC44' },
  resultTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '900' },
  resultSubtitle: { color: '#AAAAAA', fontSize: 14, textAlign: 'center' },
  continueBtn: { backgroundColor: '#4A90D9', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 10 },
  continueBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
});
