import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { usePlayerStore } from '../store/playerStore';
import { useColonyStore } from '../store/colonyStore';
import { PARTS } from '../data/parts';
import { ABILITY_UPGRADES } from '../data/upgrades';
import { purchasePart, purchaseAbility, getAvailablePartsToUnlock, getAvailableAbilitiesToUnlock, getLabLevel } from '../game/systems/EvolutionSystem';

type Tab = 'parts' | 'abilities';

export function EvolutionShopScreen() {
  const navigation = useNavigation();
  const { player } = usePlayerStore();
  const [tab, setTab] = useState<Tab>('parts');
  const [confirmModal, setConfirmModal] = useState<{
    type: 'part' | 'ability';
    id: string;
    name: string;
    cost: number;
  } | null>(null);

  const labLevel = getLabLevel();
  const availableParts = PARTS.filter((p) => p.dnaCost > 0);
  const availableAbilities = ABILITY_UPGRADES;

  const handlePurchasePart = (partId: string, name: string, cost: number) => {
    setConfirmModal({ type: 'part', id: partId, name, cost });
  };

  const handlePurchaseAbility = (id: string, name: string, cost: number) => {
    setConfirmModal({ type: 'ability', id, name, cost });
  };

  const handleConfirmPurchase = () => {
    if (!confirmModal) return;
    const success =
      confirmModal.type === 'part'
        ? purchasePart(confirmModal.id)
        : purchaseAbility(confirmModal.id);

    if (success) {
      Alert.alert('Unlocked!', `${confirmModal.name} is now available!`);
    } else {
      Alert.alert('Cannot Unlock', 'Not enough DNA coins or missing prerequisites.');
    }
    setConfirmModal(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>EVOLUTION SHOP</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← BACK</Text>
        </TouchableOpacity>
      </View>

      {/* Balance */}
      <View style={styles.balanceRow}>
        <Text style={styles.balanceText}>🧬 {player.dnaCurrency} DNA Coins</Text>
        <Text style={styles.labText}>Lab Level: {labLevel}</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === 'parts' && styles.tabActive]}
          onPress={() => setTab('parts')}
        >
          <Text style={[styles.tabText, tab === 'parts' && styles.tabTextActive]}>BODY PARTS</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'abilities' && styles.tabActive]}
          onPress={() => setTab('abilities')}
        >
          <Text style={[styles.tabText, tab === 'abilities' && styles.tabTextActive]}>ABILITIES</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {tab === 'parts' && (
        <ScrollView style={styles.scroll}>
          <Text style={styles.sectionHint}>Parts unlock in the Creature Creator once purchased.</Text>
          {availableParts.map((part) => {
            const owned = player.unlockedParts.includes(part.id);
            const canBuild = labLevel >= part.labLevelRequired;
            const canAfford = player.dnaCurrency >= part.dnaCost;

            return (
              <View key={part.id} style={[styles.card, owned && styles.cardOwned]}>
                <View style={[styles.partIcon, { backgroundColor: part.defaultColor, borderRadius: part.shape === 'circle' ? 20 : 4 }]} />
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName}>{part.label}</Text>
                  <Text style={styles.cardDesc}>{part.description}</Text>
                  <Text style={styles.cardStats}>
                    {part.statBonus.maxHealth ? `❤️+${part.statBonus.maxHealth} ` : ''}
                    {part.statBonus.attack ? `⚔️+${part.statBonus.attack} ` : ''}
                    {part.statBonus.defense ? `🛡️+${part.statBonus.defense} ` : ''}
                    {part.statBonus.speed ? `💨+${part.statBonus.speed}` : ''}
                  </Text>
                  {!canBuild && (
                    <Text style={styles.reqText}>Requires Lab Lv.{part.labLevelRequired}</Text>
                  )}
                </View>
                {owned ? (
                  <View style={styles.ownedBadge}><Text style={styles.ownedText}>✓ Owned</Text></View>
                ) : (
                  <TouchableOpacity
                    style={[styles.buyBtn, (!canBuild || !canAfford) && styles.buyBtnDisabled]}
                    onPress={() => handlePurchasePart(part.id, part.label, part.dnaCost)}
                    disabled={!canBuild || !canAfford}
                  >
                    <Text style={styles.buyBtnText}>🧬 {part.dnaCost}</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </ScrollView>
      )}

      {tab === 'abilities' && (
        <ScrollView style={styles.scroll}>
          <Text style={styles.sectionHint}>Abilities are learned permanently and used in combat.</Text>
          {availableAbilities.map((upgrade) => {
            const owned = player.unlockedAbilities.includes(upgrade.id);
            const hasPrereq = !upgrade.prerequisiteAbilityId ||
              player.unlockedAbilities.includes(upgrade.prerequisiteAbilityId);
            const labOk = labLevel >= upgrade.labLevelRequired;
            const canAfford = player.dnaCurrency >= upgrade.dnaCost;

            return (
              <View key={upgrade.id} style={[styles.card, owned && styles.cardOwned]}>
                <Text style={styles.abilityIcon}>✨</Text>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName}>{upgrade.name}</Text>
                  <Text style={styles.cardDesc}>{upgrade.description}</Text>
                  {upgrade.prerequisiteAbilityId && !hasPrereq && (
                    <Text style={styles.reqText}>
                      Requires: {ABILITY_UPGRADES.find((a) => a.id === upgrade.prerequisiteAbilityId)?.name}
                    </Text>
                  )}
                  {!labOk && (
                    <Text style={styles.reqText}>Requires Lab Lv.{upgrade.labLevelRequired}</Text>
                  )}
                </View>
                {owned ? (
                  <View style={styles.ownedBadge}><Text style={styles.ownedText}>✓ Learned</Text></View>
                ) : (
                  <TouchableOpacity
                    style={[styles.buyBtn, (!hasPrereq || !labOk || !canAfford) && styles.buyBtnDisabled]}
                    onPress={() => handlePurchaseAbility(upgrade.id, upgrade.name, upgrade.dnaCost)}
                    disabled={!hasPrereq || !labOk || !canAfford}
                  >
                    <Text style={styles.buyBtnText}>🧬 {upgrade.dnaCost}</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Confirm Modal */}
      {confirmModal && (
        <Modal transparent animationType="fade">
          <View style={styles.modalBg}>
            <View style={styles.confirmModal}>
              <Text style={styles.confirmTitle}>Unlock {confirmModal.name}?</Text>
              <Text style={styles.confirmCost}>Cost: 🧬 {confirmModal.cost} DNA</Text>
              <Text style={styles.confirmBalance}>Your balance: 🧬 {player.dnaCurrency}</Text>
              <View style={styles.confirmBtns}>
                <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirmPurchase}>
                  <Text style={styles.confirmBtnText}>Unlock!</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setConfirmModal(null)}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D1A' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, borderBottomWidth: 1, borderBottomColor: '#2A2A3E',
  },
  title: { color: '#FFFFFF', fontSize: 20, fontWeight: '900', letterSpacing: 3 },
  backBtn: { backgroundColor: '#3A3A5A', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  backBtnText: { color: '#CCCCCC', fontWeight: 'bold' },
  balanceRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#1A1A2E',
  },
  balanceText: { color: '#AADDFF', fontWeight: 'bold', fontSize: 16 },
  labText: { color: '#AAAAAA', fontSize: 13 },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#2A2A3E' },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabActive: { borderBottomWidth: 3, borderBottomColor: '#4A90D9' },
  tabText: { color: '#666666', fontWeight: 'bold', fontSize: 13, letterSpacing: 1 },
  tabTextActive: { color: '#4A90D9' },
  scroll: { flex: 1, padding: 12 },
  sectionHint: { color: '#555566', fontSize: 12, marginBottom: 12, textAlign: 'center' },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#252535', borderRadius: 10, padding: 12, marginBottom: 8,
    borderWidth: 1, borderColor: '#3A3A5A',
  },
  cardOwned: { borderColor: '#44664466', opacity: 0.6 },
  partIcon: { width: 40, height: 40 },
  abilityIcon: { fontSize: 28, width: 40, textAlign: 'center' },
  cardInfo: { flex: 1 },
  cardName: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
  cardDesc: { color: '#AAAAAA', fontSize: 11, marginTop: 2 },
  cardStats: { color: '#88DDFF', fontSize: 11, marginTop: 4 },
  reqText: { color: '#CC6644', fontSize: 10, marginTop: 2 },
  ownedBadge: { backgroundColor: '#334433', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  ownedText: { color: '#66CC66', fontWeight: 'bold', fontSize: 12 },
  buyBtn: { backgroundColor: '#4A90D9', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8 },
  buyBtnDisabled: { opacity: 0.35 },
  buyBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', alignItems: 'center', justifyContent: 'center' },
  confirmModal: {
    backgroundColor: '#1A1A2E', borderRadius: 16, padding: 28, alignItems: 'center', gap: 12,
    borderWidth: 1, borderColor: '#4A90D9', minWidth: 280,
  },
  confirmTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '900', textAlign: 'center' },
  confirmCost: { color: '#AADDFF', fontSize: 16 },
  confirmBalance: { color: '#888899', fontSize: 13 },
  confirmBtns: { flexDirection: 'row', gap: 12, marginTop: 8 },
  confirmBtn: { backgroundColor: '#4A90D9', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  confirmBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 },
  cancelBtn: { backgroundColor: '#333355', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  cancelText: { color: '#CCCCCC', fontSize: 15 },
});
