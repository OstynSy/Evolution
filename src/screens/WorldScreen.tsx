import React, { useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Canvas, Rect, Circle, Path, Group } from '@shopify/react-native-skia';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCreatureStore } from '../store/creatureStore';
import { useWorldStore } from '../store/worldStore';
import { usePlayerStore } from '../store/playerStore';
import { useColonyStore } from '../store/colonyStore';
import { VirtualJoystick } from '../components/VirtualJoystick';
import { HUD } from '../components/HUD';
import { TileType, WorldEntity, JoystickVector } from '../types/world';
import { movePlayer, checkEntityOverlap } from '../game/systems/MovementSystem';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { tickColony } from '../game/systems/ColonySystem';

type Nav = NativeStackNavigationProp<RootStackParamList, 'World'>;

const { width: SW, height: SH } = Dimensions.get('window');
const TILE_SIZE = 24;
const TILES_X = Math.ceil(SW / TILE_SIZE) + 2;
const TILES_Y = Math.ceil(SH / TILE_SIZE) + 2;

const TILE_COLORS: Record<TileType, string> = {
  [TileType.GRASS]: '#3A6B3A',
  [TileType.WATER]: '#1E4A8A',
  [TileType.ROCK]: '#5A5A5A',
  [TileType.FOREST]: '#1F4A1F',
  [TileType.CAVE]: '#2A1A2A',
  [TileType.COLONY]: '#5A4A1F',
  [TileType.SAND]: '#B8A060',
};

const TILE_DETAIL_COLORS: Record<TileType, string> = {
  [TileType.GRASS]: '#2D5A2D',
  [TileType.WATER]: '#163A7A',
  [TileType.ROCK]: '#4A4A4A',
  [TileType.FOREST]: '#163416',
  [TileType.CAVE]: '#1A0A1A',
  [TileType.COLONY]: '#4A3A0F',
  [TileType.SAND]: '#A89050',
};

function getEntityColor(entity: WorldEntity): string {
  switch (entity.type) {
    case 'monster': return '#CC4444';
    case 'food': return '#44CC44';
    case 'resource': return '#AADDFF';
    case 'portal': return '#DDAA44';
    default: return '#FFFFFF';
  }
}

export function WorldScreen() {
  const navigation = useNavigation<Nav>();
  const { creature, applyDamage, heal, gainXP } = useCreatureStore();
  const { world, joystick, setPlayerPos, removeEntity, setJoystick } = useWorldStore();
  const { earnDNA, addExploredTile } = usePlayerStore();
  const { addResources } = useColonyStore();

  const lastTime = useRef(Date.now());
  const frameRef = useRef<number>(0);
  const inCombat = useRef(false);

  useFocusEffect(
    useCallback(() => {
      inCombat.current = false;
      tickColony();
    }, [])
  );

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const dt = Math.min((now - lastTime.current) / 1000, 0.1);
      lastTime.current = now;

      if (inCombat.current) {
        frameRef.current = requestAnimationFrame(tick);
        return;
      }

      const { world: w, joystick: j } = useWorldStore.getState();
      const { creature: c } = useCreatureStore.getState();

      const newPos = movePlayer(w, j, c.stats, dt);
      if (newPos) {
        setPlayerPos(newPos.x, newPos.y);
        addExploredTile(`${Math.floor(newPos.x)},${Math.floor(newPos.y)}`);

        // Check entity interactions
        const { removeEntity: re, world: freshWorld } = useWorldStore.getState();
        for (const entity of freshWorld.entities) {
          if (!checkEntityOverlap(newPos.x, newPos.y, entity.position.x, entity.position.y)) {
            continue;
          }

          if (entity.type === 'food') {
            re(entity.id);
            heal(entity.value ?? 10);
            gainXP(5);
          } else if (entity.type === 'resource') {
            re(entity.id);
            earnDNA(entity.value ?? 3);
            addResources(0, 0, entity.value ?? 3);
          } else if (entity.type === 'monster' && !inCombat.current) {
            inCombat.current = true;
            navigation.navigate('Combat', { enemyEntityId: entity.id, enemyTemplateId: entity.templateId! });
          } else if (entity.type === 'portal') {
            navigation.navigate('Colony');
          }
        }
      }

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  // Camera: center player on screen
  const camX = world.playerPos.x - SW / (2 * TILE_SIZE);
  const camY = world.playerPos.y - SH / (2 * TILE_SIZE);

  const startTileX = Math.max(0, Math.floor(camX));
  const startTileY = Math.max(0, Math.floor(camY));

  const visibleTiles: { tile: { type: TileType }; sx: number; sy: number; ix: number; iy: number }[] = [];
  for (let ty = startTileY; ty < Math.min(world.height, startTileY + TILES_Y + 1); ty++) {
    for (let tx = startTileX; tx < Math.min(world.width, startTileX + TILES_X + 1); tx++) {
      if (!world.tiles[ty] || !world.tiles[ty][tx]) continue;
      const sx = (tx - camX) * TILE_SIZE;
      const sy = (ty - camY) * TILE_SIZE;
      visibleTiles.push({ tile: world.tiles[ty][tx], sx, sy, ix: tx, iy: ty });
    }
  }

  return (
    <View style={styles.container}>
      <Canvas style={styles.canvas}>
        {/* Tiles */}
        {visibleTiles.map(({ tile, sx, sy, ix, iy }) => (
          <React.Fragment key={`${ix},${iy}`}>
            <Rect x={sx} y={sy} width={TILE_SIZE} height={TILE_SIZE} color={TILE_COLORS[tile.type]} />
            {/* Tile detail */}
            {(ix + iy) % 3 === 0 && (
              <Rect x={sx + 4} y={sy + 4} width={4} height={4} color={TILE_DETAIL_COLORS[tile.type]} />
            )}
          </React.Fragment>
        ))}

        {/* Entities */}
        {world.entities.map((entity) => {
          const ex = (entity.position.x - camX) * TILE_SIZE;
          const ey = (entity.position.y - camY) * TILE_SIZE;
          if (ex < -TILE_SIZE || ex > SW + TILE_SIZE || ey < -TILE_SIZE || ey > SH + TILE_SIZE)
            return null;

          const color = getEntityColor(entity);
          const size = entity.type === 'portal' ? 20 : entity.type === 'monster' ? 14 : 8;

          return (
            <React.Fragment key={entity.id}>
              <Circle cx={ex} cy={ey} r={size} color={color} opacity={0.9} />
              {entity.type === 'monster' && (
                <Circle cx={ex} cy={ey} r={size} color="transparent" strokeWidth={2} style="stroke" />
              )}
              {entity.type === 'portal' && (
                <Circle cx={ex} cy={ey} r={size + 6} color="rgba(221,170,68,0.2)" />
              )}
            </React.Fragment>
          );
        })}

        {/* Player creature (centered) */}
        <Circle cx={SW / 2} cy={SH / 2} r={18} color="#4A90D9" />
        <Circle cx={SW / 2} cy={SH / 2} r={12} color="#6AAAF0" />
        <Circle cx={SW / 2 - 5} cy={SH / 2 - 4} r={3} color="#FFFFFF" />
        <Circle cx={SW / 2 + 5} cy={SH / 2 - 4} r={3} color="#FFFFFF" />
        {creature.parts.slice(0, 4).map((p, i) => {
          const angle = (i / 4) * Math.PI * 2;
          const px = SW / 2 + Math.cos(angle) * 14;
          const py = SH / 2 + Math.sin(angle) * 14;
          return <Circle key={p.instanceId} cx={px} cy={py} r={5} color={p.color} />;
        })}
      </Canvas>

      <HUD
        hp={creature.currentHealth}
        maxHp={creature.stats.maxHealth}
        dna={usePlayerStore.getState().player.dnaCurrency}
        level={creature.level}
        xp={creature.xp}
        xpNeeded={creature.xpToNextLevel}
      />

      <View style={styles.joystickArea}>
        <VirtualJoystick onMove={setJoystick} />
      </View>

      <View style={styles.navButtons}>
        <TouchableOpacity style={styles.navBtn} onPress={() => navigation.navigate('Colony')}>
          <Text style={styles.navBtnText}>🏠 Colony</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn} onPress={() => navigation.navigate('EvolutionShop')}>
          <Text style={styles.navBtnText}>🧬 Evolve</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn} onPress={() => navigation.navigate('Creator')}>
          <Text style={styles.navBtnText}>✏️ Edit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  canvas: { ...StyleSheet.absoluteFillObject },
  joystickArea: {
    position: 'absolute',
    bottom: 40,
    left: 40,
  },
  navButtons: {
    position: 'absolute',
    top: 80,
    right: 12,
    gap: 8,
  },
  navBtn: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  navBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 },
});
