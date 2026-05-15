import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { PARTS, PartDefinition } from '../data/parts';
import { usePlayerStore } from '../store/playerStore';
import { PartType } from '../types/creature';

interface Props {
  onSelectPart: (partId: string) => void;
}

const CATEGORIES: PartType[] = ['body', 'head', 'limb', 'tail', 'mouth', 'eye', 'spike', 'fin', 'wing'];

const SHAPE_COLORS: Record<string, string> = {
  circle: '#7EC8A0',
  rect: '#8B7355',
  oval: '#6699CC',
  triangle: '#CC6666',
  diamond: '#DDAA44',
};

function PartIcon({ part }: { part: PartDefinition }) {
  const bgColor = part.defaultColor;
  return (
    <View
      style={[
        styles.partIcon,
        {
          backgroundColor: bgColor,
          borderRadius: part.shape === 'circle' || part.shape === 'oval' ? 20 : 4,
        },
      ]}
    />
  );
}

export function PartPicker({ onSelectPart }: Props) {
  const [activeCategory, setActiveCategory] = useState<PartType>('body');
  const { player } = usePlayerStore();

  const filtered = PARTS.filter(
    (p) => p.type === activeCategory && player.unlockedParts.includes(p.id)
  );

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.catBtn, activeCategory === cat && styles.catBtnActive]}
            onPress={() => setActiveCategory(cat)}
          >
            <Text style={[styles.catText, activeCategory === cat && styles.catTextActive]}>
              {cat.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.partsScroll} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 && (
          <Text style={styles.emptyText}>No parts unlocked. Visit the Evolution Shop!</Text>
        )}
        {filtered.map((part) => (
          <TouchableOpacity
            key={part.id}
            style={styles.partRow}
            onPress={() => onSelectPart(part.id)}
          >
            <PartIcon part={part} />
            <View style={styles.partInfo}>
              <Text style={styles.partName}>{part.label}</Text>
              <Text style={styles.partDesc} numberOfLines={1}>{part.description}</Text>
              <Text style={styles.partStats}>
                {part.statBonus.maxHealth ? `❤️+${part.statBonus.maxHealth} ` : ''}
                {part.statBonus.attack ? `⚔️+${part.statBonus.attack} ` : ''}
                {part.statBonus.defense ? `🛡️+${part.statBonus.defense} ` : ''}
                {part.statBonus.speed ? `💨+${part.statBonus.speed}` : ''}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1A2E' },
  catScroll: { maxHeight: 44, paddingHorizontal: 8 },
  catBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginRight: 4,
    borderRadius: 6,
    backgroundColor: '#2A2A3E',
  },
  catBtnActive: { backgroundColor: '#4A90D9' },
  catText: { color: '#888888', fontSize: 11, fontWeight: 'bold' },
  catTextActive: { color: '#FFFFFF' },
  partsScroll: { flex: 1, padding: 8 },
  partRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#252535',
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
    gap: 10,
  },
  partIcon: { width: 36, height: 36 },
  partInfo: { flex: 1 },
  partName: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
  partDesc: { color: '#AAAAAA', fontSize: 11 },
  partStats: { color: '#88DDFF', fontSize: 11, marginTop: 2 },
  emptyText: { color: '#666666', textAlign: 'center', marginTop: 20, fontSize: 13 },
});
