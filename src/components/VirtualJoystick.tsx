import React, { useRef, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { PanResponder } from 'react-native';
import { JoystickVector } from '../types/world';

interface Props {
  onMove: (vec: JoystickVector) => void;
  size?: number;
}

const JOYSTICK_RADIUS = 50;

export function VirtualJoystick({ onMove, size = 120 }: Props) {
  const thumbRef = useRef({ x: 0, y: 0 });
  const baseRef = useRef<{ x: number; y: number } | null>(null);
  const thumbViewRef = useRef<View>(null);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      baseRef.current = {
        x: evt.nativeEvent.locationX,
        y: evt.nativeEvent.locationY,
      };
    },
    onPanResponderMove: (evt, gestureState) => {
      const dx = gestureState.dx;
      const dy = gestureState.dy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const clampedDist = Math.min(dist, JOYSTICK_RADIUS);
      const angle = Math.atan2(dy, dx);
      const nx = clampedDist === 0 ? 0 : (Math.cos(angle) * clampedDist) / JOYSTICK_RADIUS;
      const ny = clampedDist === 0 ? 0 : (Math.sin(angle) * clampedDist) / JOYSTICK_RADIUS;
      thumbRef.current = { x: nx * JOYSTICK_RADIUS, y: ny * JOYSTICK_RADIUS };
      if (thumbViewRef.current) {
        (thumbViewRef.current as any).setNativeProps({
          style: {
            transform: [
              { translateX: thumbRef.current.x },
              { translateY: thumbRef.current.y },
            ],
          },
        });
      }
      onMove({ dx: nx, dy: ny, active: true });
    },
    onPanResponderRelease: () => {
      thumbRef.current = { x: 0, y: 0 };
      if (thumbViewRef.current) {
        (thumbViewRef.current as any).setNativeProps({
          style: { transform: [{ translateX: 0 }, { translateY: 0 }] },
        });
      }
      onMove({ dx: 0, dy: 0, active: false });
    },
  });

  return (
    <View style={[styles.base, { width: size, height: size, borderRadius: size / 2 }]} {...panResponder.panHandlers}>
      <View ref={thumbViewRef} style={styles.thumb} />
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.8)',
  },
});
