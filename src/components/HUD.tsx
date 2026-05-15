import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { HealthBar } from './HealthBar';

interface Props {
  hp: number;
  maxHp: number;
  dna: number;
  level: number;
  xp: number;
  xpNeeded: number;
}

export function HUD({ hp, maxHp, dna, level, xp, xpNeeded }: Props) {
  return (
    <View style={styles.hud} pointerEvents="none">
      <View style={styles.topLeft}>
        <Text style={styles.levelText}>Lv.{level}</Text>
        <HealthBar current={hp} max={maxHp} label="HP" height={10} showText />
        <HealthBar current={xp} max={xpNeeded} label="XP" height={6} />
      </View>
      <View style={styles.topRight}>
        <Text style={styles.dnaText}>🧬 {dna}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hud: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    pointerEvents: 'none',
  },
  topLeft: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 10,
    padding: 10,
    gap: 4,
    minWidth: 140,
  },
  topRight: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 10,
    padding: 10,
  },
  levelText: { color: '#FFDD44', fontWeight: 'bold', fontSize: 13 },
  dnaText: { color: '#AADDFF', fontWeight: 'bold', fontSize: 16 },
});
