import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { BuildingType } from '../types/colony';
import { BUILDINGS } from '../data/buildings';

interface Props {
  type: BuildingType;
  onPress: (type: BuildingType) => void;
  canAfford: boolean;
}

export function BuildingCard({ type, onPress, canAfford }: Props) {
  const def = BUILDINGS[type];
  return (
    <TouchableOpacity
      style={[styles.card, !canAfford && styles.cardDisabled]}
      onPress={() => onPress(type)}
      disabled={!canAfford}
    >
      <Text style={styles.emoji}>{def.emoji}</Text>
      <Text style={styles.name}>{def.name}</Text>
      <Text style={styles.desc} numberOfLines={2}>{def.description}</Text>
      <View style={styles.costs}>
        {def.costFood > 0 && <Text style={styles.cost}>🍖{def.costFood}</Text>}
        {def.costStone > 0 && <Text style={styles.cost}>🪨{def.costStone}</Text>}
        {def.costDna > 0 && <Text style={styles.cost}>🧬{def.costDna}</Text>}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#252535',
    borderRadius: 10,
    padding: 12,
    margin: 6,
    width: 130,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3A3A5A',
  },
  cardDisabled: { opacity: 0.4 },
  emoji: { fontSize: 28, marginBottom: 4 },
  name: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13, textAlign: 'center' },
  desc: { color: '#AAAAAA', fontSize: 10, textAlign: 'center', marginTop: 4 },
  costs: { flexDirection: 'row', gap: 6, marginTop: 6 },
  cost: { color: '#FFDD88', fontSize: 11 },
});
