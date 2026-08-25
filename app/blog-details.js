import React, { useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { getBlogPostById } from '@/services/api';

const WHATSAPP_NUMBER = '250783486662';

function openWhatsApp(title) {
  const msg = `Check out this article from GanaHeza: "${title}" - Learn more on GanaHeza Agriculture Marketplace`;
  const url = `whatsapp://send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(msg)}`;
  Linking.canOpenURL(url).then((ok) => {
    Linking.openURL(ok ? url : `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`);
  });
}

async function shareArticle(post) {
  try {
    await Share.share({
      title: post.title,
      message: `${post.title}\n\n${post.summary}\n\nShared from GanaHeza Agriculture Marketplace`,
    });
  } catch {
    Alert.alert('Error', 'Could not share this article.');
  }
}

function renderContent(content) {
  return content.split('\n').map((line, index) => {
    if (!line.trim()) return <View key={index} style={{ height: 10 }} />;

    if (line.startsWith('**') && line.endsWith('**')) {
      return (
        <Text key={index} style={styles.contentHeading}>
          {line.replace(/\*\*/g, '')}
        </Text>
      );
    }
    if (/^\d+\./.test(line.trim())) {
      return (
        <View key={index} style={styles.listItem}>
          <Text style={styles.listBullet}>•</Text>
          <Text style={styles.listText}>{line.replace(/^\d+\.\s*/, '')}</Text>
        </View>
      );
    }
    if (line.trim().startsWith('-')) {
      return (
        <View key={index} style={styles.listItem}>
          <Text style={styles.listBullet}>•</Text>
          <Text style={styles.listText}>{line.replace(/^[-\s]+/, '')}</Text>
        </View>
      );
    }
    return (
      <Text key={index} style={styles.contentParagraph}>{line}</Text>
    );
  });
}

export default function BlogDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBlogPostById(id).then(setPost).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <View style={styles.centered}>
          <Ionicons name="leaf-outline" size={40} color={Colors.primaryLight} />
          <Text style={styles.loadingText}>Loading article...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!post) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.textSecondary} />
          <Text style={styles.loadingText}>Article not found.</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>← Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero image placeholder ────────────── */}
        <View style={styles.heroImage}>
          <Ionicons name="newspaper-outline" size={64} color={Colors.primaryLight} style={{ opacity: 0.4 }} />
          {/* Category badge on image */}
          <TouchableOpacity
            style={styles.heroCategoryBadge}
            onPress={() => router.push('/(tabs)/blog')}
            activeOpacity={0.8}
          >
            <Text style={styles.heroCategoryText}>{post.category}</Text>
          </TouchableOpacity>
        </View>

        {/* ── Article header ───────────────────── */}
        <View style={styles.articleHeader}>
          <View style={styles.metaRow}>
            <View style={styles.readTimeRow}>
              <Ionicons name="time-outline" size={13} color={Colors.textSecondary} />
              <Text style={styles.readTime}>{post.readTime}</Text>
            </View>
            {/* Share button */}
            <TouchableOpacity
              style={styles.shareBtn}
              onPress={() => shareArticle(post)}
              activeOpacity={0.8}
            >
              <Ionicons name="share-social-outline" size={16} color={Colors.primary} />
              <Text style={styles.shareBtnText}>Share</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>{post.title}</Text>

          {/* Author + date */}
          <View style={styles.authorRow}>
            <View style={styles.authorAvatar}>
              <Ionicons name="person-outline" size={14} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.authorName}>{post.author}</Text>
              <Text style={styles.date}>{post.date}</Text>
            </View>
          </View>
        </View>

        {/* ── Summary ──────────────────────────── */}
        <View style={styles.summaryBlock}>
          <Text style={styles.summaryText}>{post.summary}</Text>
        </View>

        {/* ── Article content ──────────────────── */}
        <View style={styles.contentBlock}>
          {renderContent(post.content)}
        </View>

        {/* ── Related actions ──────────────────── */}
        <View style={styles.actionsBlock}>
          {/* WhatsApp share */}
          <TouchableOpacity
            style={styles.whatsappBtn}
            onPress={() => openWhatsApp(post.title)}
            activeOpacity={0.85}
          >
            <Ionicons name="logo-whatsapp" size={18} color={Colors.white} />
            <Text style={styles.whatsappBtnText}>Share on WhatsApp</Text>
          </TouchableOpacity>

          {/* More articles */}
          <TouchableOpacity
            style={styles.moreBtn}
            onPress={() => router.push('/(tabs)/blog')}
            activeOpacity={0.85}
          >
            <Ionicons name="newspaper-outline" size={18} color={Colors.primary} />
            <Text style={styles.moreBtnText}>More Articles</Text>
          </TouchableOpacity>
        </View>

        {/* ── Footer ───────────────────────────── */}
        <View style={styles.articleFooter}>
          <TouchableOpacity
            style={styles.footerTag}
            onPress={() => router.push('/(tabs)/about')}
            activeOpacity={0.75}
          >
            <Ionicons name="leaf-outline" size={14} color={Colors.primary} />
            <Text style={styles.footerTagText}>GanaHeza Agriculture</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 24 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 20 },
  loadingText: { fontSize: 15, color: Colors.textSecondary },
  backBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 8,
  },
  backBtnText: { color: Colors.white, fontWeight: '700' },

  // Hero
  heroImage: {
    height: 220,
    backgroundColor: Colors.heroBg,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  heroCategoryBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: 'rgba(46,125,50,0.88)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  heroCategoryText: { fontSize: 12, color: Colors.white, fontWeight: '700' },

  // Header
  articleHeader: {
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
    gap: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  readTimeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  readTime: { fontSize: 12, color: Colors.textSecondary },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.tagBg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  shareBtnText: { fontSize: 12, color: Colors.primary, fontWeight: '600' },
  title: { fontSize: 22, fontWeight: '800', color: Colors.textMain, lineHeight: 30 },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  authorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.tagBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorName: { fontSize: 13, fontWeight: '600', color: Colors.textMain },
  date: { fontSize: 11, color: Colors.textSecondary },

  // Summary
  summaryBlock: {
    backgroundColor: Colors.heroBg,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  summaryText: {
    fontSize: 14,
    color: Colors.textMain,
    fontStyle: 'italic',
    lineHeight: 22,
    fontWeight: '500',
  },

  // Content
  contentBlock: { paddingHorizontal: 20, paddingTop: 20 },
  contentHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textMain,
    marginTop: 16,
    marginBottom: 6,
  },
  contentParagraph: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 23,
    marginBottom: 4,
  },
  listItem: { flexDirection: 'row', gap: 8, marginBottom: 4, paddingLeft: 4 },
  listBullet: { fontSize: 14, color: Colors.primary, lineHeight: 23, fontWeight: '700' },
  listText: { flex: 1, fontSize: 14, color: Colors.textSecondary, lineHeight: 23 },

  // Actions
  actionsBlock: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 24,
    gap: 10,
  },
  whatsappBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#25D366',
    borderRadius: 14,
    paddingVertical: 13,
    elevation: 3,
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  whatsappBtnText: { fontSize: 13, fontWeight: '700', color: Colors.white },
  moreBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingVertical: 13,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  moreBtnText: { fontSize: 13, fontWeight: '700', color: Colors.primary },

  // Footer
  articleFooter: {
    marginHorizontal: 20,
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    alignItems: 'center',
  },
  footerTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.tagBg,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  footerTagText: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
});
