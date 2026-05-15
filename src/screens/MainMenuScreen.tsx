import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { usePlayerStore } from '../store/playerStore';
import { useCreatureStore } from '../store/creatureStore';
import { useWorldStore } from '../store/worldStore';
import { useColonyStore } from '../store/colonyStore';

type Nav = NativeStackNavigationProp<RootStackParamList, 'MainMenu'>;

export function MainMenuScreen() {
  const navigation = useNavigation<Nav>();
  const { resetPlayer } = usePlayerStore();
  const { resetCreature } = useCreatureStore();
  const { generateNewWorld } = useWorldStore();
  const { resetColony } = useColonyStore();

  const handleNewGame = () => {
    resetPlayer();
    resetCreature();
    generateNewWorld();
    resetColony();
    navigation.navigate('Creator');
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleArea}>
        <Text style={styles.title}>EVOLUTION</Text>
        <Text style={styles.subtitle}>Build. Explore. Evolve.</Text>
      </View>

      <View style={styles.decorBg}>
        {['#7EC8A0', '#CC6666', '#6699CC', '#DDAA44', '#CC44AA'].map((c, i) => (
          <View
            key={i}
            style={[
              styles.decorBlob,
              {
                backgroundColor: c,
                left: `${10 + i * 18}%` as any,
                top: `${20 + (i % 2) * 30}%` as any,
                width: 40 + i * 10,
                height: 40 + i * 10,
                borderRadius: 30 + i * 5,
                opacity: 0.15,
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.btnPrimary} onPress={handleNewGame}>
          <Text style={styles.btnPrimaryText}>NEW GAME</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnSecondary} onPress={() => navigation.navigate('Creator')}>
          <Text style={styles.btnSecondaryText}>CONTINUE</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>Create your creature. Conquer the world.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D1A',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  decorBg: { ...StyleSheet.absoluteFillObject, pointerEvents: 'none' },
  decorBlob: { position: 'absolute' },
  titleArea: { alignItems: 'center', marginBottom: 60 },
  title: {
    fontSize: 52,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 8,
    textShadowColor: '#4A90D9',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  subtitle: { color: '#8899AA', fontSize: 16, letterSpacing: 4, marginTop: 4 },
  buttons: { gap: 16, width: 260 },
  btnPrimary: {
    backgroundColor: '#4A90D9',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#4A90D9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
  },
  btnPrimaryText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', letterSpacing: 2 },
  btnSecondary: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4A90D9',
  },
  btnSecondaryText: { color: '#4A90D9', fontSize: 16, fontWeight: '700', letterSpacing: 2 },
  footer: { color: '#445566', fontSize: 12, position: 'absolute', bottom: 30 },
});
