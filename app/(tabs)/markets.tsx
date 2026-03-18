import React, { useState, useCallback } from 'react';
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
import { colors } from '../../src/theme/colors';
import { markets } from '../../src/data/mockData';
import { MarketCard } from '../../src/components/MarketCard';

type SortKey = 'symbol' | 'price' | 'change' | 'volume';

export default function MarketsScreen() {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('volume');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const filtered = markets
    .filter((m) => m.symbol.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      switch (sortBy) {
        case 'symbol': return a.symbol.localeCompare(b.symbol);
        case 'price': return b.price - a.price;
        case 'change': return Math.abs(b.change24h) - Math.abs(a.change24h);
        case 'volume': return parseFloat(b.volume) - parseFloat(a.volume);
        default: return 0;
      }
    });

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Markets</Text>
        <Text style={styles.subtitle}>{markets.length} Perpetuals</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search markets..."
          placeholderTextColor={colors.textMuted}
          keyboardAppearance="dark"
        />
      </View>

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

      {/* Market List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.symbol}
        renderItem={({ item }) => <MarketCard market={item} />}
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
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14,
    paddingVertical: 12,
  },
  sortRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 8,
  },
  sortPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sortPillActive: {
    backgroundColor: colors.accentGlow,
    borderColor: colors.accent,
  },
  sortPillText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  sortPillTextActive: {
    color: colors.accent,
  },
  list: {
    paddingBottom: 20,
  },
});
