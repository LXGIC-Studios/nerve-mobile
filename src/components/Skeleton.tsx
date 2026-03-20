import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle, Platform } from 'react-native';
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
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: Platform.OS !== 'web' }),
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

export function SkeletonPositionCard() {
  return (
    <View style={styles.positionCard}>
      <View style={styles.positionHeader}>
        <View style={styles.positionLeft}>
          <Skeleton width={80} height={14} />
          <Skeleton width={40} height={12} borderRadius={6} style={{ marginLeft: 8 }} />
          <Skeleton width={25} height={12} style={{ marginLeft: 8 }} />
        </View>
        <Skeleton width={50} height={28} borderRadius={8} />
      </View>
      <View style={styles.positionStats}>
        <View style={styles.positionStat}>
          <Skeleton width={30} height={8} />
          <Skeleton width={50} height={12} style={{ marginTop: 4 }} />
        </View>
        <View style={styles.positionStat}>
          <Skeleton width={25} height={8} />
          <Skeleton width={45} height={12} style={{ marginTop: 4 }} />
        </View>
        <View style={styles.positionStat}>
          <Skeleton width={20} height={8} />
          <Skeleton width={40} height={12} style={{ marginTop: 4 }} />
        </View>
        <View style={styles.positionStat}>
          <Skeleton width={25} height={8} />
          <Skeleton width={35} height={12} style={{ marginTop: 4 }} />
        </View>
      </View>
      <Skeleton width="100%" height={3} borderRadius={1.5} style={{ marginVertical: 8 }} />
      <Skeleton width={60} height={10} style={{ alignSelf: 'flex-end' }} />
    </View>
  );
}

export function SkeletonPositions({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <SkeletonPositionCard key={i} />
      ))}
    </>
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
  positionCard: {
    backgroundColor: colors.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 10,
  },
  positionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  positionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  positionStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  positionStat: {
    alignItems: 'center',
  },
});
