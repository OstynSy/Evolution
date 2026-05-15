import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Alert } from 'react-native';
import { Canvas, Rect, Circle, Group } from '@shopify/react-native-skia';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { useColonyStore } from '../store/colonyStore';
import { usePlayerStore } from '../store/playerStore';
import { BuildingCard } from '../components/BuildingCard';
import { BuildingType } from '../types/colony';
import { BUILDINGS } from '../data/buildings';
import { tickColony } from '../game/systems/ColonySystem';

const GRID_COLS = 8;
const GRID_ROWS = 8;
const CELL_SIZE = 56;

const BUILDING_COLORS: Record<BuildingType, string> = {
  nest: '#8B7355',
  farm: '#88AA44',
  barracks: '#CC6644',
  lab: '#4488CC',
  market: '#DDAA44',
};

const BUILDING_EMOJI: Record<BuildingType, string> = {
  nest: '🏠',
  farm: '🌾',
  barracks: '⚔️',
  lab: '🔬',
  market: '💱',
};

export function ColonyScreen() {
  const navigation = useNavigation();
  const { colony, placeBuilding, upgradeBuilding } = useColonyStore();
  const { player, earnDNA, setPhase } = usePlayerStore();
  const [selectedCell, setSelectedCell] = useState<{ col: number; row: number } | null>(null);
  const [buildMenuVisible, setBuildMenuVisible] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<import('../types/colony').Building | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      tickColony();
      if (player.phase === 'creature') {
        setPhase('colony');
      }
    }, [])
  );

  const getBuildingAt = (col: number, row: number) =>
    colony.buildings.find((b) => b.gridPos.col === col && b.gridPos.row === row);

  const handleCellPress = (col: number, row: number) => {
    const existing = getBuildingAt(col, row);
    if (existing) {
      setSelectedBuilding(existing);
      setSelectedCell({ col, row });
    } else {
      setSelectedCell({ col, row });
      setBuildMenuVisible(true);
    }
  };

  const handleBuild = (type: BuildingType) => {
    if (!selectedCell) return;
    const success = placeBuilding(type, selectedCell.col, selectedCell.row);
    if (!success) {
      Alert.alert('Cannot Build', 'Not enough resources or tile is occupied.');
    }
    setBuildMenuVisible(false);
    setSelectedCell(null);
  };

  const canAfford = (type: BuildingType): boolean => {
    const def = BUILDINGS[type];
    return (
      colony.resources.food >= def.costFood &&
      colony.resources.stone >= def.costStone &&
      colony.resources.dna >= def.costDna
    );
  };

  const transferDNA = () => {
    const amount = Math.floor(colony.resources.dna);
    if (amount <= 0) return;
    earnDNA(amount);
    useColonyStore.getState().addResources(0, 0, -amount);
    Alert.alert('DNA Transferred', `+${amount} DNA coins to your wallet!`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>COLONY</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← WORLD</Text>
        </TouchableOpacity>
      </View>

      {/* Resources */}
      <View style={styles.resources}>
        <View style={styles.resBadge}><Text style={styles.resText}>🍖 {Math.floor(colony.resources.food)}</Text></View>
        <View style={styles.resBadge}><Text style={styles.resText}>🪨 {Math.floor(colony.resources.stone)}</Text></View>
        <View style={styles.resBadge}><Text style={styles.resText}>🧬 {Math.floor(colony.resources.dna)}</Text></View>
        <View style={styles.resBadge}><Text style={styles.resText}>👥 {colony.population}/{colony.maxPopulation}</Text></View>
        <TouchableOpacity style={styles.transferBtn} onPress={transferDNA}>
          <Text style={styles.transferText}>↑ Transfer DNA</Text>
        </TouchableOpacity>
      </View>

      {/* Grid */}
      <ScrollView contentContainerStyle={styles.gridContainer}>
        <View style={{ width: GRID_COLS * CELL_SIZE, height: GRID_ROWS * CELL_SIZE }}>
          {Array.from({ length: GRID_ROWS }, (_, row) =>
            Array.from({ length: GRID_COLS }, (_, col) => {
              const building = getBuildingAt(col, row);
              const isSelected = selectedCell?.col === col && selectedCell?.row === row;

              return (
                <TouchableOpacity
                  key={`${col},${row}`}
                  style={[
                    styles.cell,
                    {
                      left: col * CELL_SIZE,
                      top: row * CELL_SIZE,
                      width: CELL_SIZE,
                      height: CELL_SIZE,
                      backgroundColor: building
                        ? BUILDING_COLORS[building.type]
                        : '#252535',
                      borderColor: isSelected ? '#FFDD44' : '#3A3A5A',
                    },
                  ]}
                  onPress={() => handleCellPress(col, row)}
                >
                  {building && (
                    <>
                      <Text style={styles.cellEmoji}>{BUILDING_EMOJI[building.type]}</Text>
                      <Text style={styles.cellLevel}>Lv{building.level}</Text>
                    </>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Building info */}
      {selectedBuilding && (
        <View style={styles.buildingInfo}>
          <Text style={styles.buildingInfoName}>
            {BUILDING_EMOJI[selectedBuilding.type]} {BUILDINGS[selectedBuilding.type].name} — Level {selectedBuilding.level}
          </Text>
          <Text style={styles.buildingInfoDesc}>{BUILDINGS[selectedBuilding.type].description}</Text>
          <View style={styles.buildingInfoBtns}>
            {selectedBuilding.level < 3 && (
              <TouchableOpacity
                style={styles.upgradeBtn}
                onPress={() => {
                  upgradeBuilding(selectedBuilding.id);
                  setSelectedBuilding(null);
                }}
              >
                <Text style={styles.upgradeBtnText}>Upgrade (25🪨)</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.closeInfoBtn} onPress={() => setSelectedBuilding(null)}>
              <Text style={styles.closeInfoText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Build Menu Modal */}
      <Modal visible={buildMenuVisible} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.buildMenu}>
            <Text style={styles.buildMenuTitle}>BUILD STRUCTURE</Text>
            <ScrollView horizontal>
              {(Object.keys(BUILDINGS) as BuildingType[]).filter((t) => t !== 'nest').map((type) => (
                <BuildingCard
                  key={type}
                  type={type}
                  onPress={handleBuild}
                  canAfford={canAfford(type)}
                />
              ))}
            </ScrollView>
            <TouchableOpacity onPress={() => setBuildMenuVisible(false)} style={styles.cancelBtn}>
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
  backBtn: { backgroundColor: '#3A3A5A', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  backBtnText: { color: '#CCCCCC', fontWeight: 'bold' },
  resources: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A3E',
    alignItems: 'center',
  },
  resBadge: { backgroundColor: '#252535', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  resText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
  transferBtn: { backgroundColor: '#4A90D9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  transferText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 },
  gridContainer: { padding: 16 },
  cell: {
    position: 'absolute',
    borderWidth: 1,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellEmoji: { fontSize: 20 },
  cellLevel: { color: '#FFFFFF', fontSize: 9, fontWeight: 'bold' },
  buildingInfo: {
    backgroundColor: '#1A1A2E',
    borderTopWidth: 1,
    borderTopColor: '#3A3A5A',
    padding: 16,
    gap: 8,
  },
  buildingInfoName: { color: '#FFDD44', fontWeight: 'bold', fontSize: 14 },
  buildingInfoDesc: { color: '#AAAAAA', fontSize: 12 },
  buildingInfoBtns: { flexDirection: 'row', gap: 10 },
  upgradeBtn: { backgroundColor: '#4A90D9', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  upgradeBtnText: { color: '#FFFFFF', fontWeight: 'bold' },
  closeInfoBtn: { backgroundColor: '#333355', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  closeInfoText: { color: '#CCCCCC' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  buildMenu: {
    backgroundColor: '#1A1A2E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#3A3A5A',
    gap: 12,
  },
  buildMenuTitle: { color: '#FFFFFF', fontWeight: '900', fontSize: 16, textAlign: 'center' },
  cancelBtn: { alignSelf: 'center', padding: 12 },
  cancelText: { color: '#8899AA', fontSize: 15 },
});
