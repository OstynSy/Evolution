import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, Alert, ScrollView, Modal,
} from 'react-native';
import { Canvas, Circle, Rect, Oval, Path } from '@shopify/react-native-skia';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useCreatureStore } from '../store/creatureStore';
import { PartPicker } from '../components/PartPicker';
import { HealthBar } from '../components/HealthBar';
import { PARTS, getPartById } from '../data/parts';
import { BodyPart } from '../types/creature';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Creator'>;

const CANVAS_W = 260;
const CANVAS_H = 260;
const CENTER = { x: CANVAS_W / 2, y: CANVAS_H / 2 };

const PART_COLORS = [
  '#7EC8A0', '#CC6666', '#6699CC', '#DDAA44', '#CC44AA',
  '#44CCCC', '#884422', '#FFFFFF', '#333333', '#88CC44',
];

function drawPart(part: BodyPart) {
  const { x, y } = part.position;
  const def = getPartById(part.partId);
  const size = 28 * part.scale;
  const color = part.color;

  if (!def) return null;

  switch (def.shape) {
    case 'circle':
      return <Circle key={part.instanceId} cx={x} cy={y} r={size / 2} color={color} />;
    case 'rect':
      return (
        <Rect key={part.instanceId} x={x - size / 2} y={y - size / 2} width={size} height={size * 0.75} color={color} />
      );
    case 'oval':
      return <Oval key={part.instanceId} x={x - size / 2} y={y - size * 0.35} width={size} height={size * 0.7} color={color} />;
    case 'triangle':
    case 'diamond':
      const hw = size / 2;
      const pathStr = def.shape === 'diamond'
        ? `M ${x} ${y - hw} L ${x + hw} ${y} L ${x} ${y + hw} L ${x - hw} ${y} Z`
        : `M ${x} ${y - hw} L ${x + hw} ${y + hw} L ${x - hw} ${y + hw} Z`;
      return <Path key={part.instanceId} path={pathStr} color={color} />;
    default:
      return <Circle key={part.instanceId} cx={x} cy={y} r={size / 2} color={color} />;
  }
}

export function CreatureCreatorScreen() {
  const navigation = useNavigation<Nav>();
  const { creature, addPart, removePart, movePart, setPartColor, setName, recalculateStats } =
    useCreatureStore();
  const [selectedPartInstanceId, setSelectedPartInstanceId] = useState<string | null>(null);
  const [colorPickerVisible, setColorPickerVisible] = useState(false);
  const [nameInput, setNameInput] = useState(creature.name);

  const handleCanvasTap = (x: number, y: number) => {
    // Check if tapping an existing part
    for (let i = creature.parts.length - 1; i >= 0; i--) {
      const p = creature.parts[i];
      const dx = p.position.x - x;
      const dy = p.position.y - y;
      if (Math.sqrt(dx * dx + dy * dy) < 20) {
        setSelectedPartInstanceId(p.instanceId);
        return;
      }
    }
    setSelectedPartInstanceId(null);
  };

  const handleAddPart = (partId: string) => {
    // Place at random position near center
    const angle = Math.random() * Math.PI * 2;
    const dist = 30 + Math.random() * 50;
    const x = CENTER.x + Math.cos(angle) * dist;
    const y = CENTER.y + Math.sin(angle) * dist;
    addPart(partId, x, y);
  };

  const handleStartAdventure = () => {
    if (creature.parts.length === 0) {
      Alert.alert('Add some parts!', 'Your creature needs at least one body part.');
      return;
    }
    setName(nameInput || 'My Creature');
    recalculateStats();
    navigation.navigate('World');
  };

  const selectedPart = creature.parts.find((p) => p.instanceId === selectedPartInstanceId);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>CREATURE CREATOR</Text>
        <TouchableOpacity style={styles.startBtn} onPress={handleStartAdventure}>
          <Text style={styles.startBtnText}>START ADVENTURE →</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        {/* Left: Part Picker */}
        <View style={styles.leftPanel}>
          <PartPicker onSelectPart={handleAddPart} />
        </View>

        {/* Center: Canvas */}
        <View style={styles.centerPanel}>
          <View style={styles.nameRow}>
            <TextInput
              style={styles.nameInput}
              value={nameInput}
              onChangeText={setNameInput}
              placeholder="Name your creature"
              placeholderTextColor="#666666"
              maxLength={20}
            />
          </View>

          <View style={styles.canvasWrapper}>
            <Canvas style={{ width: CANVAS_W, height: CANVAS_H }}>
              {/* Background grid */}
              <Rect x={0} y={0} width={CANVAS_W} height={CANVAS_H} color="#1A1A2E" />
              {/* Center marker */}
              <Circle cx={CENTER.x} cy={CENTER.y} r={40} color="rgba(74,144,217,0.08)" />
              <Circle cx={CENTER.x} cy={CENTER.y} r={2} color="rgba(74,144,217,0.3)" />

              {/* Parts */}
              {creature.parts.map((p) => drawPart(p))}

              {/* Selection highlight */}
              {selectedPart && (
                <Circle
                  cx={selectedPart.position.x}
                  cy={selectedPart.position.y}
                  r={22}
                  color="rgba(255,220,0,0.3)"
                />
              )}
            </Canvas>
            {/* Transparent overlay to capture taps */}
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={(e) => handleCanvasTap(e.nativeEvent.locationX, e.nativeEvent.locationY)}
            />
          </View>

          {/* Selected part controls */}
          {selectedPart && (
            <View style={styles.partControls}>
              <Text style={styles.selectedName}>{selectedPart.label}</Text>
              <View style={styles.partBtns}>
                <TouchableOpacity
                  style={styles.controlBtn}
                  onPress={() => setColorPickerVisible(true)}
                >
                  <Text style={styles.controlBtnText}>🎨 Color</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.controlBtn, styles.deleteBtn]}
                  onPress={() => {
                    removePart(selectedPart.instanceId);
                    setSelectedPartInstanceId(null);
                  }}
                >
                  <Text style={styles.controlBtnText}>🗑 Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Right: Stats */}
        <View style={styles.rightPanel}>
          <Text style={styles.statsTitle}>STATS</Text>
          <View style={styles.statRows}>
            <HealthBar current={creature.stats.maxHealth} max={200} label={`❤️ HP: ${creature.stats.maxHealth}`} height={10} />
            <HealthBar current={creature.stats.attack} max={50} label={`⚔️ ATK: ${creature.stats.attack}`} height={10} />
            <HealthBar current={creature.stats.defense} max={30} label={`🛡️ DEF: ${creature.stats.defense}`} height={10} />
            <HealthBar current={creature.stats.speed} max={20} label={`💨 SPD: ${creature.stats.speed}`} height={10} />
          </View>
          <Text style={styles.partsCount}>
            Parts: {creature.parts.length}
          </Text>
          <Text style={styles.levelText}>Level {creature.level}</Text>
        </View>
      </View>

      {/* Color Picker Modal */}
      <Modal visible={colorPickerVisible} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.colorPicker}>
            <Text style={styles.colorTitle}>Choose Color</Text>
            <View style={styles.colorGrid}>
              {PART_COLORS.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.colorSwatch, { backgroundColor: c }]}
                  onPress={() => {
                    if (selectedPartInstanceId) setPartColor(selectedPartInstanceId, c);
                    setColorPickerVisible(false);
                  }}
                />
              ))}
            </View>
            <TouchableOpacity onPress={() => setColorPickerVisible(false)} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D1A' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A3E',
  },
  title: { color: '#FFFFFF', fontSize: 20, fontWeight: '900', letterSpacing: 3 },
  startBtn: {
    backgroundColor: '#4A90D9',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  startBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
  body: { flex: 1, flexDirection: 'row' },
  leftPanel: { width: 200, borderRightWidth: 1, borderRightColor: '#2A2A3E' },
  centerPanel: { flex: 1, alignItems: 'center', padding: 12 },
  rightPanel: {
    width: 180,
    borderLeftWidth: 1,
    borderLeftColor: '#2A2A3E',
    padding: 16,
    gap: 12,
  },
  nameRow: { marginBottom: 12, width: CANVAS_W },
  nameInput: {
    backgroundColor: '#252535',
    color: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#3A3A5A',
  },
  canvasWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#3A3A5A',
  },
  partControls: {
    marginTop: 12,
    backgroundColor: '#252535',
    borderRadius: 10,
    padding: 10,
    width: CANVAS_W,
    alignItems: 'center',
    gap: 8,
  },
  selectedName: { color: '#FFDD44', fontWeight: 'bold' },
  partBtns: { flexDirection: 'row', gap: 10 },
  controlBtn: {
    backgroundColor: '#3A3A5A',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  deleteBtn: { backgroundColor: '#552222' },
  controlBtnText: { color: '#FFFFFF', fontSize: 12 },
  statsTitle: { color: '#FFFFFF', fontWeight: '900', fontSize: 14, letterSpacing: 2 },
  statRows: { gap: 12 },
  partsCount: { color: '#8899AA', fontSize: 12 },
  levelText: { color: '#FFDD44', fontWeight: 'bold' },
  modalBg: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.8)',
    alignItems: 'center', justifyContent: 'center',
  },
  colorPicker: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: '#3A3A5A',
  },
  colorTitle: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, width: 220, justifyContent: 'center' },
  colorSwatch: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: '#FFFFFF' },
  cancelBtn: { padding: 10 },
  cancelText: { color: '#8899AA' },
});
