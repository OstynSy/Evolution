import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

interface Props {
  current: number;
  max: number;
  label?: string;
  height?: number;
  showText?: boolean;
}

export function HealthBar({ current, max, label, height = 12, showText = false }: Props) {
  const pct = Math.max(0, Math.min(1, current / max));
  const color = pct > 0.5 ? '#44CC44' : pct > 0.25 ? '#CCAA22' : '#CC4444';

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.track, { height }]}>
        <View style={[styles.fill, { width: `${pct * 100}%`, backgroundColor: color }]} />
      </View>
      {showText && (
        <Text style={styles.text}>
          {current}/{max}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 2 },
  label: { color: '#CCCCCC', fontSize: 11, fontWeight: 'bold' },
  track: {
    backgroundColor: '#333333',
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#555555',
  },
  fill: { height: '100%', borderRadius: 6 },
  text: { color: '#FFFFFF', fontSize: 10, textAlign: 'center' },
});
