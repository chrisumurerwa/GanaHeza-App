import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { useProducts } from '@/context/ProductContext';
import { getBlogPosts } from '@/services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.44;
const FEATURED_WIDTH = SCREEN_WIDTH * 0.7;

// ─── Category Button ──────────────────────────────────────────────────────────
const CATEGORIES = [
  { label: 'All',        icon: 'grid-outline',        color: Colors.primary },
  { label: 'Fruits',     icon: 'nutrition-outline',   color: '#F59E0B' },
  { label: 'Vegetables', icon: 'leaf-outline',         color: '#10B981' },
  { label: 'Cash Crops', icon: 'cafe-outline',         color: '#8B5CF6' },
  { label: 'Cereals',    icon: 'layers-outline',       color: '#EF4444' },
  { label: 'Nuts',       icon: 'ellipse-outline',      color: '#F97316' },
  { label: 'Chillies',   icon: 'flame-outline',        color: '#DC2626' },
];

function CategoryChip({ item, isActive, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.catChip, isActive && { backgroundColor: item.color, borderColor: item.color }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Ionicons name={item.icon} size={14} color={isActive ? Colors.white : item.color} />
      <Text style={[styles.catChipText, isActive && { color: Colors.white }]}>{item.label}</Text>
    </TouchableOpacity>
  );
}

// ─── Featured Product Card (horizontal scroll) ────────────────────────────────
function FeaturedCard({ product, onPress, onOrder }) {
  return (
    <TouchableOpacity
      style={[styles.featuredCard, { width: FEATURED_WIDTH }]}
      onPress={onPress}
      activeOpacity={0.88}
    >
      <View style={styles.featuredImgWrap}>
        {product.image ? (
          <Image source={product.image} style={styles.featuredImg} resizeMode="cover" />
        ) : (
          <View style={styles.featuredImgFallback}>
            <Ionicons name="leaf-outline" size={40} color={Colors.primaryLight} />
          </View>
        )}
        <View style={styles.featuredCatBadge}>
          <Text style={styles.featuredCatText}>{product.category}</Text>
        </View>
        {product.price && (
          <View style={styles.priceBadge}>
            <Text style={styles.priceBadgeText}>
              {product.price.toLocaleString()} {product.currency}/{product.priceUnit}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.featuredBody}>
        <Text style={styles.featuredName}>{product.name}</Text>
        <Text style={styles.featuredQty}>
          {product.quantity ? `${product.quantity} ${product.unit}/wk` : 'Ask for qty'}
        </Text>
        <View style={styles.featuredFooter}>
          <View style={styles.availBadge}>
            <View style={styles.dot} />
            <Text style={styles.availText}>Available</Text>
          </View>
          <TouchableOpacity style={styles.orderChip} onPress={onOrder} activeOpacity={0.85}>
            <Ionicons name="cart-outline" size={12} color={Colors.white} />
            <Text style={styles.orderChipText}>Order</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Grid Product Card ────────────────────────────────────────────────────────
function GridCard({ product, onPress, onOrder }) {
  return (
    <TouchableOpacity
      style={[styles.gridCard, { width: CARD_WIDTH }]}
      onPress={onPress}
      activeOpacity={0.88}
    >
      <View style={styles.gridImgWrap}>
        {product.image ? (
          <Image source={product.image} style={styles.gridImg} resizeMode="cover" />
        ) : (
          <View style={styles.gridImgFallback}>
            <Ionicons name="leaf-outline" size={28} color={Colors.primaryLight} />
          </View>
        )}
        <View style={styles.gridCatBadge}>
          <Text style={styles.gridCatText}>{product.category}</Text>
        </View>
      </View>
      <View style={styles.gridBody}>
        <Text style={styles.gridName} numberOfLines={1}>{product.name}</Text>
        <Text style={[styles.gridPrice, !product.price && styles.noPrice]}>
          {product.price
            ? `${product.price.toLocaleString()} ${product.currency}/${product.priceUnit}`
            : 'Price TBD'}
        </Text>
        <TouchableOpacity style={styles.gridOrderBtn} onPress={onOrder} activeOpacity={0.85}>
          <Ionicons name="cart-outline" size={13} color={Colors.white} />
          <Text style={styles.gridOrderText}>Order Now</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

// ─── Home List Product Card (Full Width) ──────────────────────────────────────
function HomeListCard({ product, onPress, onOrder }) {
  const priceText = product.price
    ? `${product.price.toLocaleString()} ${product.currency}/${product.priceUnit}`
    : 'Price on request';

  return (
    <TouchableOpacity style={styles.homeListCard} onPress={onPress} activeOpacity={0.88}>
      <View style={styles.homeListImgWrap}>
        {product.image ? (
          <Image source={product.image} style={styles.homeListImg} resizeMode="cover" />
        ) : (
          <View style={styles.homeListImgFallback}>
            <Ionicons name="leaf-outline" size={24} color={Colors.primaryLight} />
          </View>
        )}
      </View>
      <View style={styles.homeListBody}>
        <View style={styles.homeListTop}>
          <Text style={styles.homeListName} numberOfLines={1}>{product.name}</Text>
          <View style={styles.homeListCatBadge}>
            <Text style={styles.homeListCatText}>{product.category}</Text>
          </View>
        </View>
        <Text style={styles.homeListCode}>{product.code} · {product.location || 'Rwanda'}</Text>
        <View style={styles.homeListFooter}>
          <Text style={[styles.homeListPrice, !product.price && styles.noPrice]}>{priceText}</Text>
          <TouchableOpacity style={styles.homeListOrderBtn} onPress={onOrder} activeOpacity={0.85}>
            <Ionicons name="cart-outline" size={12} color={Colors.white} />
            <Text style={styles.homeListOrderText}>Order</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHead({ title, onViewAll, showToggle, isGrid, onToggleGrid }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleRow}>
        <View style={styles.sectionAccent} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.sectionHeaderRight}>
        {showToggle && (
          <View style={styles.homeToggleWrap}>
            <TouchableOpacity
              style={[styles.homeToggleBtn, isGrid && styles.homeToggleBtnActive]}
              onPress={() => onToggleGrid(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="grid-outline" size={14} color={isGrid ? Colors.white : Colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.homeToggleBtn, !isGrid && styles.homeToggleBtnActive]}
              onPress={() => onToggleGrid(false)}
              activeOpacity={0.8}
            >
              <Ionicons name="list-outline" size={14} color={!isGrid ? Colors.white : Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        )}
        {onViewAll && (
          <TouchableOpacity onPress={onViewAll}>
            <Text style={styles.viewAll}>View All →</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const router = useRouter();
  const { products } = useProducts();
  const [posts, setPosts]                 = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [isMarketGrid, setIsMarketGrid]   = useState(true);

  useEffect(() => {
    getBlogPosts().then((d) => setPosts(d.slice(0, 2)));
  }, []);

  // Filter by category
  const filtered = activeCategory === 'All'
    ? products
    : products.filter((p) => p.category === activeCategory);

  // Featured = products with images, filtered by active category
  const featured = filtered.filter((p) => p.image).slice(0, 6);

  // Grid = all filtered products (up to 6 for All, all for specific category)
  const topPicks = activeCategory === 'All' ? filtered.slice(0, 6) : filtered;

  function goToDetail(id) {
    router.push({ pathname: '/product-details', params: { id } });
  }
  function goToOrder(id) {
    router.push({ pathname: '/order', params: { id } });
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        nestedScrollEnabled={true}
        overScrollMode="never"
      >

        {/* ── Hero ─────────────────────────────────── */}
        <View style={styles.hero}>
          <View style={styles.heroContent}>
            <View style={styles.heroBadge}>
              <Ionicons name="leaf" size={11} color={Colors.white} />
              <Text style={styles.heroBadgeText}>Rwanda Agriculture</Text>
            </View>
            <Text style={styles.heroTitle}>Connecting Farmers{'\n'}to Better Markets</Text>
            <Text style={styles.heroSub}>
              Find products, current prices and available quantities in one place.
            </Text>
            <View style={styles.heroButtons}>
              <TouchableOpacity
                style={styles.heroBtn}
                onPress={() => router.push('/(tabs)/products')}
                activeOpacity={0.85}
              >
                <Text style={styles.heroBtnText}>Explore Products →</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.heroSecondaryBtn}
                onPress={() => router.push('/contact')}
                activeOpacity={0.85}
              >
                <Ionicons name="call-outline" size={15} color={Colors.white} />
                <Text style={styles.heroSecondaryText}>Contact Us</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Decorative stats row inside hero */}
          <View style={styles.heroStats}>
            {[
              { value: '15+', label: 'Products' },
              { value: '6',   label: 'Categories' },
              { value: '100%', label: 'Rwandan' },
            ].map((s, i) => (
              <View key={s.label} style={[styles.heroStat, i < 2 && styles.heroStatBorder]}>
                <Text style={styles.heroStatNum}>{s.value}</Text>
                <Text style={styles.heroStatLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Category Filter ───────────────────────── */}
        <View style={styles.catSection}>
          <SectionHead title="Browse by Category" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.catRow}
            nestedScrollEnabled={true}
            overScrollMode="never"
          >
            {CATEGORIES.map((cat) => (
              <CategoryChip
                key={cat.label}
                item={cat}
                isActive={activeCategory === cat.label}
                onPress={() => setActiveCategory(cat.label)}
              />
            ))}
          </ScrollView>
        </View>

        {/* ── Featured Products (horizontal scroll) ── */}
        {featured.length > 0 && (
        <View style={styles.section}>
          <SectionHead
            title={activeCategory === 'All' ? 'Featured Products' : `${activeCategory} — Featured`}
            onViewAll={() => router.push('/(tabs)/products')}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredRow}
            nestedScrollEnabled={true}
            overScrollMode="never"
          >
            {featured.map((p) => (
              <FeaturedCard
                key={p.id}
                product={p}
                onPress={() => goToDetail(p.id)}
                onOrder={() => goToOrder(p.id)}
              />
            ))}
          </ScrollView>
        </View>
        )}

        {/* ── Top Picks Grid / List ─────────────────── */}
        <View style={styles.section}>
          <SectionHead
            title={
              activeCategory === 'All'
                ? "Today's Market"
                : `All ${activeCategory} (${topPicks.length})`
            }
            onViewAll={() => router.push('/(tabs)/products')}
            showToggle={true}
            isGrid={isMarketGrid}
            onToggleGrid={setIsMarketGrid}
          />
          {topPicks.length === 0 ? (
            <View style={styles.emptyCategory}>
              <Ionicons name="search-outline" size={36} color={Colors.cardBorder} />
              <Text style={styles.emptyCategoryText}>No products in this category</Text>
              <TouchableOpacity
                style={styles.emptyCategoryBtn}
                onPress={() => setActiveCategory('All')}
                activeOpacity={0.8}
              >
                <Text style={styles.emptyCategoryBtnText}>Show All Products</Text>
              </TouchableOpacity>
            </View>
          ) : isMarketGrid ? (
            <View style={styles.gridWrap}>
              {topPicks.map((p) => (
                <GridCard
                  key={p.id}
                  product={p}
                  onPress={() => goToDetail(p.id)}
                  onOrder={() => goToOrder(p.id)}
                />
              ))}
            </View>
          ) : (
            <View style={styles.homeListWrap}>
              {topPicks.map((p) => (
                <HomeListCard
                  key={p.id}
                  product={p}
                  onPress={() => goToDetail(p.id)}
                  onOrder={() => goToOrder(p.id)}
                />
              ))}
            </View>
          )}
          {/* When showing all category results show a browse-more hint */}
          {activeCategory !== 'All' && topPicks.length > 0 && (
            <TouchableOpacity
              style={styles.showAllBtn}
              onPress={() => router.push('/(tabs)/products')}
              activeOpacity={0.8}
            >
              <Ionicons name="leaf-outline" size={14} color={Colors.primary} />
              <Text style={styles.showAllText}>See all products in Products tab</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Why GanaHeza — only show on All ──────── */}
        {activeCategory === 'All' && (
        <View style={styles.section}>
          <SectionHead title="Why GanaHeza?" />
          <View style={styles.whyRow}>
            {[
              { icon: 'shield-checkmark-outline', color: Colors.primary,    title: 'Verified Products',  desc: 'All products sourced from verified Rwandan farmers.' },
              { icon: 'pricetag-outline',          color: '#F59E0B',         title: 'Fair Prices',         desc: 'Transparent market prices updated regularly.' },
              { icon: 'flash-outline',             color: '#8B5CF6',         title: 'Fast Orders',         desc: 'Place orders directly and get quick responses.' },
              { icon: 'globe-outline',             color: '#10B981',         title: 'Export Ready',        desc: 'Products meet international quality standards.' },
            ].map((w) => (
              <View key={w.title} style={styles.whyCard}>
                <View style={[styles.whyIconWrap, { backgroundColor: w.color + '18' }]}>
                  <Ionicons name={w.icon} size={22} color={w.color} />
                </View>
                <Text style={styles.whyTitle}>{w.title}</Text>
                <Text style={styles.whyDesc}>{w.desc}</Text>
              </View>
            ))}
          </View>
        </View>
        )}

        {/* ── Latest Articles ──────────────────────── */}
        <View style={styles.section}>
          <SectionHead
            title="Latest Articles"
            onViewAll={() => router.push('/(tabs)/blog')}
          />
          {posts.map((post) => (
            <TouchableOpacity
              key={post.id}
              style={styles.blogCard}
              onPress={() => router.push({ pathname: '/blog-details', params: { id: post.id } })}
              activeOpacity={0.85}
            >
              <View style={styles.blogLeft}>
                <View style={styles.blogIconBox}>
                  <Ionicons name="newspaper-outline" size={22} color={Colors.primary} />
                </View>
              </View>
              <View style={styles.blogRight}>
                <View style={styles.blogMeta}>
                  <View style={styles.categoryTag}>
                    <Text style={styles.categoryText}>{post.category}</Text>
                  </View>
                  <Text style={styles.blogDate}>{post.date}</Text>
                </View>
                <Text style={styles.blogTitle} numberOfLines={2}>{post.title}</Text>
                <Text style={styles.readMore}>Read More →</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Contact CTA ──────────────────────────── */}
        <TouchableOpacity
          style={styles.ctaBanner}
          onPress={() => router.push('/contact')}
          activeOpacity={0.85}
        >
          <View style={styles.ctaLeft}>
            <View style={styles.ctaIconWrap}>
              <Ionicons name="chatbubbles-outline" size={24} color={Colors.white} />
            </View>
            <View>
              <Text style={styles.ctaTitle}>Need help?</Text>
              <Text style={styles.ctaSub}>Our team is ready to assist you</Text>
            </View>
          </View>
          <View style={styles.ctaArrowWrap}>
            <Ionicons name="arrow-forward" size={18} color={Colors.primary} />
          </View>
        </TouchableOpacity>
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingBottom: 100 },

  // ── Hero ──────────────────────────────────────────
  hero: {
    backgroundColor: Colors.primary,
    paddingTop: 28,
    paddingBottom: 0,
    overflow: 'hidden',
  },
  heroContent: {
    paddingHorizontal: 22,
    paddingBottom: 24,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 14,
  },
  heroBadgeText: { fontSize: 11, color: Colors.white, fontWeight: '700' },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.white,
    lineHeight: 34,
    marginBottom: 10,
  },
  heroSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
    marginBottom: 20,
  },
  heroButtons: { flexDirection: 'row', gap: 10 },
  heroBtn: {
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    flex: 1,
    alignItems: 'center',
  },
  heroBtnText: { color: Colors.primary, fontWeight: '800', fontSize: 13 },
  heroSecondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  heroSecondaryText: { color: Colors.white, fontWeight: '700', fontSize: 13 },

  // Hero stats strip
  heroStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  heroStat: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  heroStatBorder: {
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.2)',
  },
  heroStatNum: { fontSize: 18, fontWeight: '800', color: Colors.white },
  heroStatLabel: { fontSize: 10, color: 'rgba(255,255,255,0.8)', marginTop: 2 },

  // ── Sections ──────────────────────────────────────
  catSection: { paddingHorizontal: 16, marginTop: 22 },
  section: { paddingHorizontal: 16, marginTop: 24 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionAccent: { width: 4, height: 20, borderRadius: 2, backgroundColor: Colors.primary },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: Colors.textMain },
  sectionHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  viewAll: { fontSize: 13, fontWeight: '600', color: Colors.primary },

  // Home view toggle
  homeToggleWrap: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 2,
    gap: 2,
  },
  homeToggleBtn: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeToggleBtnActive: {
    backgroundColor: Colors.primary,
  },

  // Home List View
  homeListWrap: {
    gap: 10,
  },
  homeListCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  homeListImgWrap: { width: 95, height: 95, backgroundColor: Colors.heroBg },
  homeListImg: { width: '100%', height: '100%' },
  homeListImgFallback: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  homeListBody: { flex: 1, padding: 10, justifyContent: 'space-between' },
  homeListTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  homeListName: { fontSize: 14, fontWeight: '700', color: Colors.textMain, flex: 1, marginRight: 6 },
  homeListCatBadge: { backgroundColor: Colors.tagBg, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  homeListCatText: { fontSize: 9, color: Colors.primary, fontWeight: '700' },
  homeListCode: { fontSize: 10, color: Colors.textSecondary },
  homeListFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  homeListPrice: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  homeListOrderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  homeListOrderText: { fontSize: 11, fontWeight: '700', color: Colors.white },

  // ── Category chips ────────────────────────────────
  catRow: { gap: 8, paddingBottom: 4 },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
    backgroundColor: Colors.white,
  },
  catChipText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },

  // ── Featured horizontal cards ──────────────────────
  featuredRow: { gap: 12, paddingBottom: 4 },
  featuredCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09,
    shadowRadius: 6,
  },
  featuredImgWrap: { height: 150, position: 'relative' },
  featuredImg: { width: '100%', height: 150 },
  featuredImgFallback: {
    width: '100%', height: 150,
    backgroundColor: Colors.heroBg,
    alignItems: 'center', justifyContent: 'center',
  },
  featuredCatBadge: {
    position: 'absolute', top: 10, left: 10,
    backgroundColor: 'rgba(46,125,50,0.88)',
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4,
  },
  featuredCatText: { fontSize: 10, color: Colors.white, fontWeight: '700' },
  priceBadge: {
    position: 'absolute', bottom: 10, right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4,
  },
  priceBadgeText: { fontSize: 11, color: Colors.white, fontWeight: '700' },
  featuredBody: { padding: 12, gap: 4 },
  featuredName: { fontSize: 15, fontWeight: '700', color: Colors.textMain },
  featuredQty: { fontSize: 12, color: Colors.textSecondary },
  featuredFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  availBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.available },
  availText: { fontSize: 10, color: Colors.available, fontWeight: '600' },
  orderChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
  },
  orderChipText: { fontSize: 11, color: Colors.white, fontWeight: '700' },

  // ── Grid cards ────────────────────────────────────
  gridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
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
  gridImgWrap: { height: 110, position: 'relative' },
  gridImg: { width: '100%', height: 110 },
  gridImgFallback: {
    width: '100%', height: 110,
    backgroundColor: Colors.heroBg,
    alignItems: 'center', justifyContent: 'center',
  },
  gridCatBadge: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: 'rgba(46,125,50,0.85)',
    borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3,
  },
  gridCatText: { fontSize: 9, color: Colors.white, fontWeight: '700' },
  gridBody: { padding: 10, gap: 4 },
  gridName: { fontSize: 13, fontWeight: '700', color: Colors.textMain },
  gridPrice: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  noPrice: { color: Colors.textSecondary, fontStyle: 'italic', fontWeight: '400' },
  gridOrderBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 5, backgroundColor: Colors.primary, borderRadius: 8,
    paddingVertical: 7, marginTop: 4,
  },
  gridOrderText: { fontSize: 11, fontWeight: '700', color: Colors.white },

  emptyCategory: { alignItems: 'center', paddingVertical: 30, gap: 10 },
  emptyCategoryText: { fontSize: 13, color: Colors.textSecondary },
  emptyCategoryBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  emptyCategoryBtnText: { fontSize: 13, fontWeight: '700', color: Colors.white },
  showAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.white,
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  showAllText: { fontSize: 13, fontWeight: '600', color: Colors.primary },

  // ── Why GanaHeza ──────────────────────────────────
  whyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  whyCard: {
    width: (SCREEN_WIDTH - 56) / 2,
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    gap: 8,
  },
  whyIconWrap: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  whyTitle: { fontSize: 13, fontWeight: '700', color: Colors.textMain },
  whyDesc: { fontSize: 11, color: Colors.textSecondary, lineHeight: 16 },

  // ── Blog cards ────────────────────────────────────
  blogCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    gap: 12,
    alignItems: 'flex-start',
  },
  blogLeft: {},
  blogIconBox: {
    width: 48, height: 48, borderRadius: 12,
    backgroundColor: Colors.heroBg,
    alignItems: 'center', justifyContent: 'center',
  },
  blogRight: { flex: 1, gap: 5 },
  blogMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  categoryTag: { backgroundColor: Colors.tagBg, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  categoryText: { fontSize: 10, color: Colors.primary, fontWeight: '700' },
  blogDate: { fontSize: 10, color: Colors.textSecondary },
  blogTitle: { fontSize: 13, fontWeight: '700', color: Colors.textMain, lineHeight: 19 },
  readMore: { fontSize: 11, fontWeight: '600', color: Colors.primary },

  // ── CTA Banner ────────────────────────────────────
  ctaBanner: {
    backgroundColor: Colors.primary,
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ctaLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  ctaIconWrap: {
    width: 46, height: 46, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  ctaTitle: { fontSize: 15, fontWeight: '700', color: Colors.white },
  ctaSub: { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  ctaArrowWrap: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.white,
    alignItems: 'center', justifyContent: 'center',
  },
});
