import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  TextInput,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  Keyboard,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { markets, categoryLabels, type MarketCategory } from '../../src/data/mockData';
import { MarketCard } from '../../src/components/MarketCard';
import { SearchIcon, StarIcon, CloseIcon } from '../../src/components/icons';
import { usePrices } from '../../src/lib/hooks/usePrices';
import { getFearGreed, type FearGreedData } from '../../src/lib/api/prism';
import { Skeleton } from '../../src/components/Skeleton';

type SortKey = 'symbol' | 'price' | 'change' | 'volume';

const categories: Array<{ key: MarketCategory | 'all' | 'favorites'; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'favorites', label: '★ Favorites' },
  ...Object.entries(categoryLabels).map(([key, label]) => ({
    key: key as MarketCategory,
    label,
  })),
];

const FAVORITES_KEY = 'nerve_favorites';
const RECENT_SEARCHES_KEY = 'nerve_recent_searches';
const MAX_RECENT_SEARCHES = 8;

export default function MarketsScreen() {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('volume');
  const [category, setCategory] = useState<MarketCategory | 'all' | 'favorites'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [fearGreed, setFearGreed] = useState<FearGreedData | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showRecent, setShowRecent] = useState(false);
  const { prices, loading, refresh } = usePrices();

  // Load favorites and recent searches
  useEffect(() => {
    AsyncStorage.getItem(FAVORITES_KEY).then((data) => {
      if (data) setFavorites(new Set(JSON.parse(data)));
    });
    AsyncStorage.getItem(RECENT_SEARCHES_KEY).then((data) => {
      if (data) setRecentSearches(JSON.parse(data));
    });
    getFearGreed().then(setFearGreed);
  }, []);

  const addRecentSearch = useCallback(async (term: string) => {
    if (!term.trim()) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s.toLowerCase() !== term.toLowerCase());
      const next = [term, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearRecentSearches = useCallback(async () => {
    setRecentSearches([]);
    await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
  }, []);

  const toggleFavorite = useCallback(async (symbol: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(symbol)) next.delete(symbol);
      else next.add(symbol);
      AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify([...next]));
      return next;
    });
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    const fg = await getFearGreed();
    if (fg) setFearGreed(fg);
    setRefreshing(false);
  }, [refresh]);

  const filtered = useMemo(() =>
    markets
      .filter((m) => {
        if (category === 'favorites' && !favorites.has(m.symbol)) return false;
        if (category !== 'all' && category !== 'favorites' && m.category !== category) return false;
        if (search && !m.symbol.toLowerCase().includes(search.toLowerCase()) && !m.base.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'symbol': return a.symbol.localeCompare(b.symbol);
          case 'price': return (prices[b.base]?.price ?? b.price) - (prices[a.base]?.price ?? a.price);
          case 'change': return Math.abs(prices[b.base]?.change24h ?? b.change24h) - Math.abs(prices[a.base]?.change24h ?? a.change24h);
          case 'volume': {
            const parseVol = (v: string) => {
              const num = parseFloat(v);
              if (v.endsWith('B')) return num * 1e9;
              if (v.endsWith('M')) return num * 1e6;
              return num;
            };
            return parseVol(b.volume) - parseVol(a.volume);
          }
          default: return 0;
        }
      }),
    [search, sortBy, category, prices, favorites]
  );

  const fearGreedColor = fearGreed
    ? fearGreed.value >= 75 ? colors.profit
    : fearGreed.value >= 50 ? colors.accent
    : fearGreed.value >= 25 ? colors.caution
    : colors.loss
    : colors.textSecondary;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Markets</Text>
          <Text style={styles.subtitle}>{markets.length} Perpetuals</Text>
        </View>
        {fearGreed && (
          <View style={styles.fearGreedBadge}>
            <Text style={styles.fearGreedLabel}>Fear & Greed</Text>
            <Text style={[styles.fearGreedValue, { color: fearGreedColor }]}>
              {fearGreed.value}
            </Text>
            <Text style={[styles.fearGreedClass, { color: fearGreedColor }]}>
              {fearGreed.classification}
            </Text>
          </View>
        )}
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <SearchIcon size={16} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={(text) => {
            setSearch(text);
            setShowRecent(text.length === 0);
          }}
          onFocus={() => setShowRecent(search.length === 0)}
          onBlur={() => {
            setTimeout(() => setShowRecent(false), 200);
          }}
          onSubmitEditing={() => {
            if (search.trim()) addRecentSearch(search.trim());
          }}
          placeholder="Search markets..."
          placeholderTextColor={colors.textMuted}
          keyboardAppearance="dark"
          returnKeyType="search"
        />
        {search.length > 0 && (
          <Pressable onPress={() => { setSearch(''); setShowRecent(false); }} hitSlop={8}>
            <CloseIcon size={16} color={colors.textMuted} />
          </Pressable>
        )}
      </View>

      {/* Recent Searches */}
      {showRecent && recentSearches.length > 0 && (
        <View style={styles.recentContainer}>
          <View style={styles.recentHeader}>
            <Text style={styles.recentTitle}>Recent</Text>
            <Pressable onPress={clearRecentSearches}>
              <Text style={styles.recentClear}>Clear</Text>
            </Pressable>
          </View>
          <View style={styles.recentChips}>
            {recentSearches.map((term, i) => (
              <Pressable
                key={`${term}-${i}`}
                style={styles.recentChip}
                onPress={() => {
                  setSearch(term);
                  setShowRecent(false);
                }}
              >
                <Text style={styles.recentChipText}>{term}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* Category Filter */}
      <FlatList
        horizontal
        data={categories}
        keyExtractor={(item) => item.key}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryRow}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => setCategory(item.key)}
            style={[styles.categoryPill, category === item.key && styles.categoryPillActive]}
          >
            <Text style={[styles.categoryPillText, category === item.key && styles.categoryPillTextActive]}>
              {item.label}
            </Text>
          </Pressable>
        )}
      />

      {/* Sort Pills */}
      <View style={styles.sortRow}>
        {[
          { key: 'volume' as SortKey, label: 'Volume' },
          { key: 'change' as SortKey, label: 'Change' },
          { key: 'price' as SortKey, label: 'Price' },
          { key: 'symbol' as SortKey, label: 'A-Z' },
        ].map((item) => (
          <Pressable
            key={item.key}
            onPress={() => setSortBy(item.key)}
            style={[styles.sortPill, sortBy === item.key && styles.sortPillActive]}
          >
            <Text style={[styles.sortPillText, sortBy === item.key && styles.sortPillTextActive]}>
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Results count */}
      <View style={styles.resultsBar}>
        <Text style={styles.resultsText}>{filtered.length} results</Text>
        {loading && <Text style={styles.liveIndicator}>Fetching live data...</Text>}
      </View>

      {/* Market List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.symbol}
        renderItem={({ item }) => {
          const livePrice = prices[item.base]?.price ?? item.price;
          const liveChange = prices[item.base]?.change24h ?? item.change24h;
          return (
            <MarketCard
              market={{ ...item, price: livePrice, change24h: liveChange }}
              onPress={() => {
                Keyboard.dismiss();
                if (search.trim()) addRecentSearch(search.trim());
                router.push(`/market/${item.symbol}`);
              }}
              isFavorite={favorites.has(item.symbol)}
              onToggleFavorite={() => toggleFavorite(item.symbol)}
            />
          );
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
          />
        }
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: { color: colors.textPrimary, fontSize: 28, fontWeight: '800' },
  subtitle: { color: colors.textSecondary, fontSize: 13, marginTop: 4 },
  fearGreedBadge: {
    backgroundColor: colors.bgCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    alignItems: 'center',
  },
  fearGreedLabel: { color: colors.textSecondary, fontSize: 8, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' },
  fearGreedValue: { fontSize: 22, fontWeight: '800', fontVariant: ['tabular-nums'], marginVertical: 2 },
  fearGreedClass: { fontSize: 9, fontWeight: '600' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: { flex: 1, color: colors.textPrimary, fontSize: 14, paddingVertical: 12 },
  categoryRow: { paddingHorizontal: 16, gap: 6, marginBottom: 8 },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryPillActive: { backgroundColor: colors.accentGlow, borderColor: colors.accent },
  categoryPillText: { color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
  categoryPillTextActive: { color: colors.accent },
  sortRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 4 },
  sortPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: colors.bgSecondary,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  sortPillActive: { borderColor: colors.border },
  sortPillText: { color: colors.textMuted, fontSize: 11, fontWeight: '600' },
  sortPillTextActive: { color: colors.textSecondary },
  resultsBar: { paddingHorizontal: 16, paddingVertical: 6, flexDirection: 'row', justifyContent: 'space-between' },
  resultsText: { color: colors.textMuted, fontSize: 10, fontWeight: '600', letterSpacing: 0.3 },
  liveIndicator: { color: colors.accent, fontSize: 10, fontWeight: '600' },
  list: { paddingBottom: 20 },
  // Recent Searches
  recentContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recentTitle: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  recentClear: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '600',
  },
  recentChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  recentChip: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  recentChipText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
});
