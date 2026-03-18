import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  TextInput,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { markets, categoryLabels, type MarketCategory } from '../../src/data/mockData';
import { MarketCard } from '../../src/components/MarketCard';
import { SearchIcon } from '../../src/components/icons';

type SortKey = 'symbol' | 'price' | 'change' | 'volume';

const categories: Array<{ key: MarketCategory | 'all'; label: string }> = [
  { key: 'all', label: 'All' },
  ...Object.entries(categoryLabels).map(([key, label]) => ({
    key: key as MarketCategory,
    label,
  })),
];

export default function MarketsScreen() {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('volume');
  const [category, setCategory] = useState<MarketCategory | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const filtered = useMemo(() =>
    markets
      .filter((m) => {
        if (category !== 'all' && m.category !== category) return false;
        if (search && !m.symbol.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'symbol': return a.symbol.localeCompare(b.symbol);
          case 'price': return b.price - a.price;
          case 'change': return Math.abs(b.change24h) - Math.abs(a.change24h);
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
    [search, sortBy, category]
  );

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Markets</Text>
        <Text style={styles.subtitle}>{markets.length} Perpetuals</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <SearchIcon size={16} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search markets..."
          placeholderTextColor={colors.textMuted}
          keyboardAppearance="dark"
        />
      </View>

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
      </View>

      {/* Market List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.symbol}
        renderItem={({ item }) => (
          <MarketCard
            market={item}
            onPress={() => router.push(`/market/${item.symbol}`)}
          />
        )}
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
  safe: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },
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
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14,
    paddingVertical: 12,
  },
  categoryRow: {
    paddingHorizontal: 16,
    gap: 6,
    marginBottom: 8,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryPillActive: {
    backgroundColor: colors.accentGlow,
    borderColor: colors.accent,
  },
  categoryPillText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  categoryPillTextActive: {
    color: colors.accent,
  },
  sortRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 4,
  },
  sortPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: colors.bgSecondary,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  sortPillActive: {
    borderColor: colors.border,
  },
  sortPillText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  sortPillTextActive: {
    color: colors.textSecondary,
  },
  resultsBar: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  resultsText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  list: {
    paddingBottom: 20,
  },
});
