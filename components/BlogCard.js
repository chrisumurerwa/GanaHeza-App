import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';

/**
 * BlogCard - displays a blog post preview card.
 * Props:
 *   post: blog post object from data/blog.js
 *   onPress: function
 */
export default function BlogCard({ post, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {/* Placeholder image area */}
      <View style={styles.imagePlaceholder}>
        <Ionicons name="newspaper-outline" size={36} color={Colors.primaryLight} />
      </View>

      <View style={styles.body}>
        {/* Category tag + read time */}
        <View style={styles.metaRow}>
          <View style={styles.categoryTag}>
            <Text style={styles.categoryText}>{post.category}</Text>
          </View>
          <View style={styles.readTimeRow}>
            <Ionicons name="time-outline" size={12} color={Colors.textSecondary} />
            <Text style={styles.readTime}>{post.readTime}</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>{post.title}</Text>

        {/* Summary */}
        <Text style={styles.summary} numberOfLines={2}>{post.summary}</Text>

        {/* Footer: date + read more */}
        <View style={styles.footer}>
          <View style={styles.dateRow}>
            <Ionicons name="calendar-outline" size={12} color={Colors.textSecondary} />
            <Text style={styles.date}>{post.date}</Text>
          </View>
          <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.readMoreBtn}>
            <Text style={styles.readMoreText}>Read More</Text>
            <Ionicons name="chevron-forward" size={13} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    marginBottom: 14,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
  },
  imagePlaceholder: {
    height: 130,
    backgroundColor: Colors.heroBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: 14,
    gap: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryTag: {
    backgroundColor: Colors.tagBg,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  categoryText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '700',
  },
  readTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readTime: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textMain,
    lineHeight: 22,
  },
  summary: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  date: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  readMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  readMoreText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
});
