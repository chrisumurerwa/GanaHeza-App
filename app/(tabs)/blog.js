import React, { useEffect, useState, useMemo } from 'react';
import {
  Dimensions,
  FlatList,
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
import { getBlogPosts } from '@/services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_ITEM_WIDTH = (SCREEN_WIDTH - 44) / 2;

// ─── List Card View (Full Width) ──────────────────────────────────────────────
function ListCard({ item, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.cardStrip} />
      <View style={styles.cardBody}>
        <View style={styles.metaRow}>
          <View style={styles.categoryTag}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
          <View style={styles.readTimeWrap}>
            <Ionicons name="time-outline" size={12} color={Colors.textSecondary} />
            <Text style={styles.readTime}>{item.readTime}</Text>
          </View>
        </View>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.summary} numberOfLines={2}>{item.summary}</Text>
        <View style={styles.footer}>
          <View style={styles.dateWrap}>
            <Ionicons name="calendar-outline" size={12} color={Colors.textSecondary} />
            <Text style={styles.date}>{item.date}</Text>
          </View>
          <Text style={styles.readMore}>Read More →</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Grid Card View (2-Column) ────────────────────────────────────────────────
function GridCard({ item, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.gridCard, { width: GRID_ITEM_WIDTH }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Top decorative header */}
      <View style={styles.gridBanner}>
        <Ionicons name="newspaper-outline" size={28} color={Colors.primary} />
        <View style={styles.gridCategoryBadge}>
          <Text style={styles.gridCategoryText} numberOfLines={1}>{item.category}</Text>
        </View>
      </View>

      <View style={styles.gridBody}>
        <Text style={styles.gridTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.gridSummary} numberOfLines={3}>{item.summary}</Text>

        <View style={styles.gridFooter}>
          <Text style={styles.gridDate}>{item.date}</Text>
          <View style={styles.gridArrowWrap}>
            <Ionicons name="arrow-forward" size={12} color={Colors.primary} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function BlogScreen() {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [isGrid, setIsGrid] = useState(false);

  useEffect(() => {
    getBlogPosts().then(setPosts);
  }, []);

  const categories = useMemo(() => {
    const cats = ['All'];
    posts.forEach((p) => {
      if (p.category && !cats.includes(p.category)) {
        cats.push(p.category);
      }
    });
    return cats;
  }, [posts]);

  const filteredPosts = useMemo(() => {
    if (activeCategory === 'All') return posts;
    return posts.filter((p) => p.category === activeCategory);
  }, [posts, activeCategory]);

  function handlePress(id) {
    router.push({ pathname: '/blog-details', params: { id } });
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <FlatList
        key={isGrid ? 'grid-view' : 'list-view'}
        data={filteredPosts}
        keyExtractor={(item) => item.id}
        numColumns={isGrid ? 2 : 1}
        columnWrapperStyle={isGrid ? styles.gridRow : null}
        renderItem={({ item }) =>
          isGrid ? (
            <GridCard item={item} onPress={() => handlePress(item.id)} />
          ) : (
            <ListCard item={item} onPress={() => handlePress(item.id)} />
          )
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.headerSection}>
            {/* Main Title + View Toggle */}
            <View style={styles.titleRow}>
              <View>
                <Text style={styles.listHeaderTitle}>Farming Blog</Text>
                <Text style={styles.listHeaderSub}>
                  {filteredPosts.length} article{filteredPosts.length === 1 ? '' : 's'} · Agricultural tips & market news
                </Text>
              </View>

              {/* List / Grid Toggle Buttons */}
              <View style={styles.viewToggleWrap}>
                <TouchableOpacity
                  style={[styles.toggleBtn, !isGrid && styles.toggleBtnActive]}
                  onPress={() => setIsGrid(false)}
                  activeOpacity={0.8}
                  accessibilityLabel="List View"
                >
                  <Ionicons
                    name="list-outline"
                    size={18}
                    color={!isGrid ? Colors.white : Colors.textSecondary}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.toggleBtn, isGrid && styles.toggleBtnActive]}
                  onPress={() => setIsGrid(true)}
                  activeOpacity={0.8}
                  accessibilityLabel="Grid View"
                >
                  <Ionicons
                    name="grid-outline"
                    size={18}
                    color={isGrid ? Colors.white : Colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Category Filter Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesRow}
            >
              {categories.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.chip, isActive && styles.chipActive]}
                    onPress={() => setActiveCategory(cat)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="newspaper-outline" size={48} color={Colors.cardBorder} />
            <Text style={styles.emptyText}>No articles found in this category.</Text>
            <TouchableOpacity
              style={styles.resetCategoryBtn}
              onPress={() => setActiveCategory('All')}
            >
              <Text style={styles.resetCategoryText}>Show All Articles</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  headerSection: {
    paddingTop: 16,
    paddingBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  listHeaderTitle: { fontSize: 22, fontWeight: '800', color: Colors.textMain },
  listHeaderSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },

  // View toggle pill
  viewToggleWrap: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 3,
    gap: 3,
    elevation: 1,
  },
  toggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBtnActive: {
    backgroundColor: Colors.primary,
  },

  // Category filters
  categoriesRow: {
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 6,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },

  // List layout
  listContent: { paddingHorizontal: 16, paddingBottom: 100 },
  gridRow: { justifyContent: 'space-between', marginBottom: 12 },

  // List Card
  card: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardStrip: { height: 4, backgroundColor: Colors.primary },
  cardBody: { padding: 14, gap: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  categoryTag: {
    backgroundColor: Colors.tagBg,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  categoryText: { fontSize: 11, color: Colors.primary, fontWeight: '700' },
  readTimeWrap: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  readTime: { fontSize: 11, color: Colors.textSecondary },
  title: { fontSize: 15, fontWeight: '700', color: Colors.textMain, lineHeight: 22 },
  summary: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  dateWrap: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  date: { fontSize: 11, color: Colors.textSecondary },
  readMore: { fontSize: 12, fontWeight: '700', color: Colors.primary },

  // Grid Card
  gridCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  gridBanner: {
    backgroundColor: '#F0FDF4',
    height: 75,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: '#DCFCE7',
  },
  gridCategoryBadge: {
    position: 'absolute',
    bottom: 6,
    left: 8,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  gridCategoryText: { fontSize: 9, color: Colors.primary, fontWeight: '700' },
  gridBody: { padding: 10, flex: 1, justifyContent: 'space-between' },
  gridTitle: { fontSize: 13, fontWeight: '700', color: Colors.textMain, lineHeight: 18, marginBottom: 4 },
  gridSummary: { fontSize: 11, color: Colors.textSecondary, lineHeight: 15, marginBottom: 10 },
  gridFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
    paddingTop: 8,
    marginTop: 4,
  },
  gridDate: { fontSize: 10, color: Colors.textSecondary },
  gridArrowWrap: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Empty
  empty: { alignItems: 'center', paddingTop: 50, gap: 10 },
  emptyText: { fontSize: 14, color: Colors.textSecondary },
  resetCategoryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    marginTop: 6,
  },
  resetCategoryText: { color: Colors.white, fontSize: 12, fontWeight: '700' },
});
