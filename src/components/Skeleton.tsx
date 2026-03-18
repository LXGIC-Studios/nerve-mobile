import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = '100%', height = 16, borderRadius = 8, style }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width as number,
          height,
          borderRadius,
          backgroundColor: colors.bgElevated,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function SkeletonCard({ height = 80 }: { height?: number }) {
  return (
    <View style={[styles.card, { height }]}>
      <View style={styles.cardRow}>
        <Skeleton width={36} height={36} borderRadius={18} />
        <View style={styles.cardLines}>
          <Skeleton width={100} height={14} />
          <Skeleton width={60} height={10} style={{ marginTop: 6 }} />
        </View>
      </View>
      <View style={styles.cardRight}>
        <Skeleton width={70} height={14} />
        <Skeleton width={50} height={10} style={{ marginTop: 6 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardLines: {
    gap: 0,
  },
  cardRight: {
    alignItems: 'flex-end',
  },
});
