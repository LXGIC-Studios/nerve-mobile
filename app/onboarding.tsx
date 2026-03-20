import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
  FlatList,
  Animated,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import Svg, { Path, Circle, Rect, Line, Text as SvgText } from 'react-native-svg';
import { colors } from '../src/theme/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const ONBOARDING_KEY = 'nerve_onboarding_complete';

interface OnboardingSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
}

// Custom icons for onboarding (larger, more detailed)
function CoachIcon() {
  return (
    <Svg width={80} height={80} viewBox="0 0 80 80" fill="none">
      <Circle cx="40" cy="25" r="12" stroke={colors.accent} strokeWidth={2} />
      <Path d="M20 65C20 50 28 42 40 42C52 42 60 50 60 65" stroke={colors.accent} strokeWidth={2} strokeLinecap="square" />
      <Circle cx="56" cy="20" r="8" stroke={colors.profit} strokeWidth={1.5} />
      <Path d="M53 20L55 22L59 18" stroke={colors.profit} strokeWidth={1.5} strokeLinecap="square" />
      <Line x1="30" y1="30" x2="20" y2="40" stroke={colors.accent} strokeWidth={1} opacity={0.4} />
      <Line x1="50" y1="30" x2="60" y2="40" stroke={colors.accent} strokeWidth={1} opacity={0.4} />
      <Circle cx="18" cy="42" r="3" stroke={colors.accent} strokeWidth={1} opacity={0.3} />
      <Circle cx="62" cy="42" r="3" stroke={colors.accent} strokeWidth={1} opacity={0.3} />
    </Svg>
  );
}

function PaperTradeIcon() {
  return (
    <Svg width={80} height={80} viewBox="0 0 80 80" fill="none">
      <Rect x="10" y="15" width="60" height="50" rx={2} stroke={colors.accent} strokeWidth={2} strokeLinejoin="miter" />
      <Line x1="10" y1="28" x2="70" y2="28" stroke={colors.border} strokeWidth={1.5} />
      <SvgText x="40" y="24" fill={colors.accent} fontSize="10" fontWeight="700" textAnchor="middle">$100,000</SvgText>
      <Path d="M20 55L30 45L38 50L50 35L60 40" stroke={colors.profit} strokeWidth={2} strokeLinecap="square" strokeLinejoin="miter" />
      <Circle cx="60" cy="40" r="3" fill={colors.profit} />
      <Rect x="15" y="32" width="12" height="3" rx={1} fill={colors.accent} opacity={0.3} />
      <Rect x="15" y="38" width="8" height="3" rx={1} fill={colors.accent} opacity={0.2} />
    </Svg>
  );
}

function BrainIcon() {
  return (
    <Svg width={80} height={80} viewBox="0 0 80 80" fill="none">
      <Circle cx="40" cy="40" r="25" stroke={colors.accent} strokeWidth={2} />
      <Circle cx="32" cy="32" r="6" stroke={colors.accent} strokeWidth={1.5} />
      <Circle cx="48" cy="32" r="6" stroke={colors.accent} strokeWidth={1.5} />
      <Circle cx="40" cy="50" r="6" stroke={colors.accent} strokeWidth={1.5} />
      <Line x1="36" y1="35" x2="44" y2="35" stroke={colors.accent} strokeWidth={1.5} strokeLinecap="square" />
      <Line x1="35" y1="37" x2="38" y2="46" stroke={colors.accent} strokeWidth={1.5} strokeLinecap="square" />
      <Line x1="45" y1="37" x2="42" y2="46" stroke={colors.accent} strokeWidth={1.5} strokeLinecap="square" />
      <Circle cx="32" cy="32" r="2" fill={colors.accent} opacity={0.6} />
      <Circle cx="48" cy="32" r="2" fill={colors.accent} opacity={0.6} />
      <Circle cx="40" cy="50" r="2" fill={colors.accent} opacity={0.6} />
      <Path d="M15 40C15 40 20 25 25 22" stroke={colors.profit} strokeWidth={1} opacity={0.3} strokeLinecap="square" />
      <Path d="M65 40C65 40 60 25 55 22" stroke={colors.profit} strokeWidth={1} opacity={0.3} strokeLinecap="square" />
    </Svg>
  );
}

function RocketIcon() {
  return (
    <Svg width={80} height={80} viewBox="0 0 80 80" fill="none">
      <Path d="M40 10L30 40L40 35L50 40L40 10Z" stroke={colors.accent} strokeWidth={2} strokeLinecap="square" strokeLinejoin="miter" />
      <Path d="M30 40L25 55L40 48L55 55L50 40" stroke={colors.accent} strokeWidth={2} strokeLinecap="square" strokeLinejoin="miter" />
      <Path d="M37 48L40 65L43 48" stroke={colors.profit} strokeWidth={2} strokeLinecap="square" strokeLinejoin="miter" />
      <Circle cx="40" cy="28" r="3" stroke={colors.accent} strokeWidth={1.5} />
      <Line x1="20" y1="65" x2="30" y2="58" stroke={colors.accent} strokeWidth={1} opacity={0.3} />
      <Line x1="60" y1="65" x2="50" y2="58" stroke={colors.accent} strokeWidth={1} opacity={0.3} />
    </Svg>
  );
}

const slides: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Your AI Trading Coach',
    subtitle: 'Welcome to NERVE',
    description: 'An intelligent trading companion that watches your moves, spots patterns, and helps you level up. Think of it as a coach who never sleeps.',
    icon: <CoachIcon />,
  },
  {
    id: '2',
    title: 'Paper Trade Safely',
    subtitle: '$100K Demo Account',
    description: 'Practice with $100,000 in virtual funds across 40+ perpetual markets. Real price data, zero risk. Build confidence before committing capital.',
    icon: <PaperTradeIcon />,
  },
  {
    id: '3',
    title: 'Get Smarter Every Trade',
    subtitle: 'AI-Powered Insights',
    description: 'NERVE tracks your win rate, discipline score, and behavioral patterns. It learns your strengths and weaknesses to give you an edge.',
    icon: <BrainIcon />,
  },
  {
    id: '4',
    title: "Let's Go",
    subtitle: 'Start Trading',
    description: 'Your journey to becoming a better trader starts now. Markets are live, your coach is ready.',
    icon: <RocketIcon />,
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = useCallback(async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      await completeOnboarding();
    }
  }, [currentIndex]);

  const handleSkip = useCallback(async () => {
    await completeOnboarding();
  }, []);

  const completeOnboarding = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    router.replace('/');
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index ?? 0);
    }
  }).current;

  const isLastSlide = currentIndex === slides.length - 1;

  return (
    <View style={styles.container}>
      {/* Skip button */}
      {!isLastSlide && (
        <Pressable style={styles.skipBtn} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      )}

      {/* Slides */}
      <Animated.FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        renderItem={({ item, index }) => {
          const inputRange = [
            (index - 1) * SCREEN_WIDTH,
            index * SCREEN_WIDTH,
            (index + 1) * SCREEN_WIDTH,
          ];
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });
          const translateY = scrollX.interpolate({
            inputRange,
            outputRange: [30, 0, 30],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View style={[styles.slide, { width: SCREEN_WIDTH, opacity, transform: [{ translateY }] }]}>
              {/* Icon */}
              <View style={styles.iconContainer}>
                <View style={styles.iconGlow} />
                {item.icon}
              </View>

              {/* Text */}
              <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
              <Text style={styles.slideTitle}>{item.title}</Text>
              <Text style={styles.slideDescription}>{item.description}</Text>
            </Animated.View>
          );
        }}
      />

      {/* Bottom section */}
      <View style={styles.bottomSection}>
        {/* Pagination dots */}
        <View style={styles.pagination}>
          {slides.map((_, index) => {
            const inputRange = [
              (index - 1) * SCREEN_WIDTH,
              index * SCREEN_WIDTH,
              (index + 1) * SCREEN_WIDTH,
            ];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [6, 24, 6],
              extrapolate: 'clamp',
            });
            const dotOpacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  {
                    width: dotWidth,
                    opacity: dotOpacity,
                    backgroundColor: colors.accent,
                  },
                ]}
              />
            );
          })}
        </View>

        {/* CTA Button */}
        <Pressable
          style={({ pressed }) => [
            styles.ctaBtn,
            isLastSlide && styles.ctaBtnFinal,
            pressed && styles.ctaBtnPressed,
          ]}
          onPress={handleNext}
        >
          <Text style={[styles.ctaText, isLastSlide && styles.ctaTextFinal]}>
            {isLastSlide ? 'Start Trading' : 'Next'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  skipBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  skipText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 120,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    position: 'relative',
  },
  iconGlow: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.accentGlow,
    opacity: 0.4,
  },
  slideSubtitle: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  slideTitle: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 34,
  },
  slideDescription: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 300,
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 50 : 30,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginBottom: 24,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  ctaBtn: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  ctaBtnFinal: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  ctaBtnPressed: {
    opacity: 0.85,
  },
  ctaText: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: '700',
  },
  ctaTextFinal: {
    color: '#000',
  },
});
