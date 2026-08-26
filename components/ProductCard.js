import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import StatusBadge from '@/components/StatusBadge';

/**
 * Formats the quantity string, e.g. "200 Kg / Week" or "—" if not available.
 */
function formatQuantity(product) {
  if (!product.quantity || !product.unit) return null;
  const period = product.period ? ` / ${product.period}` : '';
  return `${product.quantity} ${product.unit}${period}`;
}

/**
 * Formats the price string. Shows "Price not available" when price is null.
 */
function formatPrice(product) {
  if (!product.price) return null;
  return `${product.price.toLocaleString()} ${product.currency} / ${product.priceUnit}`;
}

/**
 * ProductCard - displays a single agricultural product in a card.
 * Props:
 *   product: product object from data/products.js
 *   onPress: function — called when the card or "View Details" is tapped
 */
export default function ProductCard({ product, onPress }) {
  const quantityText = formatQuantity(product);
  const priceText = formatPrice(product);

  // imageUrl is already a full URL (normalized in ProductContext)
  const imageUrl = product.imageUrl;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {/* Left color accent bar */}
      <View style={styles.accentBar} />

      {/* Product thumbnail image */}
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.thumbnail} resizeMode="cover" />
      ) : (
        <View style={[styles.thumbnail, styles.thumbnailFallback]}>
          <Ionicons name="leaf-outline" size={28} color={Colors.primaryLight} />
        </View>
      )}

      <View style={styles.body}>
        {/* Header row: name + category */}
        <View style={styles.headerRow}>
          <View style={styles.nameBlock}>
            <Text style={styles.name} numberOfLines={1}>{product.name}</Text>
            <Text style={styles.code}>Code: {product.code}</Text>
          </View>
          <View style={styles.categoryTag}>
            <Text style={styles.categoryText}>{product.category}</Text>
          </View>
        </View>

        {/* Info rows */}
        <View style={styles.infoRow}>
          <Ionicons name="layers-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.infoLabel}>Quantity: </Text>
          <Text style={styles.infoValue}>
            {quantityText ?? 'Not specified'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="pricetag-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.infoLabel}>Price: </Text>
          <Text style={[styles.infoValue, !priceText && styles.noPrice]}>
            {priceText ?? 'Price not available'}
          </Text>
        </View>

        {/* Footer row: status badge */}
        <View style={styles.footer}>
          <StatusBadge status={product.status} />
          <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
  },
  accentBar: {
    width: 4,
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  thumbnail: {
    width: 84,
    height: '100%',
    minHeight: 84,
  },
  thumbnailFallback: {
    backgroundColor: Colors.tagBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    padding: 14,
    gap: 7,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  nameBlock: {
    flex: 1,
    marginRight: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textMain,
    marginBottom: 2,
  },
  code: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontFamily: 'monospace',
  },
  categoryTag: {
    backgroundColor: Colors.tagBg,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  categoryText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  infoLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  infoValue: {
    fontSize: 13,
    color: Colors.textMain,
    fontWeight: '600',
  },
  noPrice: {
    color: Colors.textSecondary,
    fontWeight: '400',
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  detailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  detailsBtnText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
});
