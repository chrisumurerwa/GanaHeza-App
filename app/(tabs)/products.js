import React, { useState, useMemo } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { useProducts } from '@/context/ProductContext';
import { useLanguage } from '@/context/LanguageContext';

const FILTERS = ['All', 'Available', 'Out of Stock'];
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_ITEM_WIDTH = (SCREEN_WIDTH - 48) / 2;

// ─── List Card ────────────────────────────────────────────────────────────────
function ListCard({ item, onPress, onOrder, t }) {
  const priceText = item.price
    ? `${item.price.toLocaleString()} ${item.currency} / ${item.priceUnit}`
    : null;
  const qtyText = item.quantity
    ? `${item.quantity} ${item.unit} / ${item.period}`
    : 'Not specified';

  return (
    <TouchableOpacity style={styles.listCard} onPress={onPress} activeOpacity={0.88}>
      {/* Fixed-size image on the left */}
      <View style={styles.listImgBox}>
        {item.image ? (
          <Image source={item.image} style={styles.listImg} resizeMode="cover" />
        ) : (
          <View style={styles.listImgFallback}>
            <Ionicons name="leaf-outline" size={28} color={Colors.primaryLight} />
          </View>
        )}
      </View>

      {/* Right side content */}
      <View style={styles.listContent}>
        {/* Name + category */}
        <View style={styles.listRow}>
          <Text style={styles.listName} numberOfLines={1}>{item.name}</Text>
          <View style={styles.catBadge}>
            <Text style={styles.catText}>{item.category}</Text>
          </View>
        </View>

        {/* Code */}
        <Text style={styles.listCode}>{item.code}</Text>

        {/* Price */}
        <Text style={[styles.priceText, !priceText && styles.noPrice]}>
          {priceText ?? t('common_price_na')}
        </Text>

        {/* Footer: available + order button */}
        <View style={styles.listFooter}>
          <View style={styles.availBadge}>
            <View style={styles.dot} />
            <Text style={styles.availText}>{t('common_available')}</Text>
          </View>
          <TouchableOpacity
            style={styles.orderBtn}
            onPress={onOrder}
            activeOpacity={0.85}
          >
            <Ionicons name="cart-outline" size={12} color={Colors.white} />
            <Text style={styles.orderBtnText}>{t('common_order')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Grid Card ────────────────────────────────────────────────────────────────
function GridCard({ item, onPress, onOrder, t }) {
  const priceText = item.price
    ? `${item.price.toLocaleString()} ${item.currency}/${item.priceUnit}`
    : null;

  return (
    <TouchableOpacity
      style={[styles.gridCard, { width: GRID_ITEM_WIDTH }]}
      onPress={onPress}
      activeOpacity={0.88}
    >
      {/* Fixed-height image */}
      <View style={styles.gridImgBox}>
        {item.image ? (
          <Image source={item.image} style={styles.gridImg} resizeMode="cover" />
        ) : (
          <View style={styles.gridImgFallback}>
            <Ionicons name="leaf-outline" size={32} color={Colors.primaryLight} />
          </View>
        )}
        {/* Category over image */}
        <View style={styles.gridCatBadge}>
          <Text style={styles.gridCatText}>{item.category}</Text>
        </View>
      </View>

      {/* Info below image */}
      <View style={styles.gridBody}>
        <Text style={styles.gridName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.gridCode}>{item.code}</Text>
        <Text style={[styles.gridPrice, !priceText && styles.noPrice]}>
          {priceText ?? 'Price TBD'}
        </Text>
        <View style={styles.gridFooter}>
          <View style={styles.availBadge}>
            <View style={styles.dot} />
            <Text style={styles.availText}>Available</Text>
          </View>
          {/* Order button on grid card */}
          <TouchableOpacity
            style={styles.orderBtn}
            onPress={onOrder}
            activeOpacity={0.85}
          >
            <Ionicons name="cart-outline" size={12} color={Colors.white} />
            <Text style={styles.orderBtnText}>Order</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function ProductsScreen() {
  const router = useRouter();
  const { products, loading, error, fetchProducts } = useProducts();
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [isGrid, setIsGrid] = useState(false);

  const filtered = useMemo(() => {
    let result = products;
    if (activeFilter === 'Available')    result = result.filter((p) => p.status === 'available');
    if (activeFilter === 'Out of Stock') result = result.filter((p) => p.status !== 'available');
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q)
      );
    }
    return result;
  }, [products, query, activeFilter]);

  function goTo(id) {
    router.push({ pathname: '/product-details', params: { id } });
  }

  function goToOrder(id) {
    router.push({ pathname: '/order', params: { id } });
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>

      {/* ── Search ─────────────────────────────────── */}
      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={16} color={Colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Search by name or code..."
          placeholderTextColor={Colors.textSecondary}
          autoCapitalize="none"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={16} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* ── Filters + Toggle ───────────────────────── */}
      <View style={styles.toolbar}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.chip, activeFilter === f && styles.chipActive]}
            onPress={() => setActiveFilter(f)}
            activeOpacity={0.8}
          >
            <Text style={[styles.chipText, activeFilter === f && styles.chipTextActive]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Toggle buttons */}
        <View style={styles.toggleGroup}>
          <TouchableOpacity
            style={[styles.toggleBtn, !isGrid && styles.toggleActive]}
            onPress={() => setIsGrid(false)}
          >
            <Ionicons name="list-outline" size={17} color={!isGrid ? Colors.white : Colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, isGrid && styles.toggleActive]}
            onPress={() => setIsGrid(true)}
          >
            <Ionicons name="grid-outline" size={17} color={isGrid ? Colors.white : Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Count ──────────────────────────────────── */}
      <Text style={styles.count}>{filtered.length} product(s) found</Text>

      {/* ── List / Grid ────────────────────────────── */}
      <FlatList
        key={isGrid ? 'grid' : 'list'}
        data={filtered}
        keyExtractor={(item) => item.id}
        numColumns={isGrid ? 2 : 1}
        columnWrapperStyle={isGrid ? styles.gridRow : undefined}
        renderItem={({ item }) =>
          isGrid
            ? <GridCard item={item} onPress={() => goTo(item.id)} onOrder={() => goToOrder(item.id)} t={t} />
            : <ListCard item={item} onPress={() => goTo(item.id)} onOrder={() => goToOrder(item.id)} t={t} />
        }
        contentContainerStyle={isGrid ? styles.gridContent : styles.listPad}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading ? (
            <View style={styles.empty}>
              <Ionicons name="sync-outline" size={40} color={Colors.primaryLight} />
              <Text style={styles.emptyText}>Loading products…</Text>
            </View>
          ) : error ? (
            <View style={styles.empty}>
              <Ionicons name="cloud-offline-outline" size={44} color={Colors.unavailable} />
              <Text style={styles.emptyText}>Couldn't load products</Text>
              <Text style={styles.emptyText}>{error}</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={fetchProducts} activeOpacity={0.8}>
                <Text style={styles.retryBtnText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={48} color={Colors.cardBorder} />
              <Text style={styles.emptyText}>No products found</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  // Search
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.textMain,
    paddingVertical: 0,
  },

  // Toolbar
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 6,
  },
  chip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
    backgroundColor: Colors.white,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },
  toggleGroup: {
    flexDirection: 'row',
    gap: 4,
  },
  toggleBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  toggleActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },

  // Count
  count: {
    fontSize: 12,
    color: Colors.textSecondary,
    paddingHorizontal: 18,
    paddingBottom: 8,
    fontWeight: '500',
  },

  // ── LIST CARD ──────────────────────────────────────
  listPad: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  listCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
    height: 120,            // ← fixed card height keeps images uniform
  },
  listImgBox: {
    width: 110,
    height: 120,
    overflow: 'hidden',
  },
  listImg: {
    width: 110,
    height: 120,
  },
  listImgFallback: {
    width: 110,
    height: 120,
    backgroundColor: Colors.heroBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: 'space-between',
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  listName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textMain,
    flex: 1,
  },
  catBadge: {
    backgroundColor: Colors.tagBg,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  catText: {
    fontSize: 9,
    color: Colors.primary,
    fontWeight: '700',
  },
  listCode: { fontSize: 10, color: Colors.textSecondary, marginTop: 1 },
  priceText: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  noPrice: { fontStyle: 'italic', color: Colors.textSecondary, fontWeight: '400' },
  listFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  orderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  orderBtnText: { fontSize: 11, fontWeight: '700', color: Colors.white },
  gridFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },

  // ── GRID CARD ──────────────────────────────────────
  gridContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  gridCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
  },
  gridImgBox: {
    width: '100%',
    height: 120,
    position: 'relative',
  },
  gridImg: {
    width: '100%',
    height: 120,
  },
  gridImgFallback: {
    width: '100%',
    height: 120,
    backgroundColor: Colors.heroBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridCatBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(46,125,50,0.88)',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  gridCatText: {
    fontSize: 9,
    color: Colors.white,
    fontWeight: '700',
  },
  gridBody: {
    padding: 10,
    gap: 3,
  },
  gridName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textMain,
  },
  gridCode: { fontSize: 10, color: Colors.textSecondary },
  gridPrice: { fontSize: 12, fontWeight: '700', color: Colors.primary },

  availBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.available },
  availText: { fontSize: 10, color: Colors.available, fontWeight: '600' },

  // Empty
  empty: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.primary,
    borderRadius: 10,
  },
  retryBtnText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
});
