import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { useProducts } from '@/context/ProductContext';

const WHATSAPP_NUMBER = '250783486662';

function openWhatsApp(productName) {
  const msg = `Hello GanaHeza, I am interested in your product: *${productName}*. Please provide more details.`;
  const url = `whatsapp://send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(msg)}`;
  Linking.canOpenURL(url)
    .then((ok) => {
      if (ok) {
        Linking.openURL(url);
      } else {
        Linking.openURL(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`);
      }
    })
    .catch(() => Alert.alert('Error', 'Could not open WhatsApp.'));
}

function InfoRow({ icon, label, value, highlight }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIconWrap}>
        <Ionicons name={icon} size={16} color={Colors.primary} />
      </View>
      <View style={styles.infoTexts}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={[styles.infoValue, highlight && styles.infoHighlight]}>{value}</Text>
      </View>
    </View>
  );
}

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { getProductById } = useProducts();
  const product = getProductById(id);
  const [loading, setLoading] = useState(false);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <View style={styles.centered}>
          <Ionicons name="leaf-outline" size={40} color={Colors.primaryLight} />
          <Text style={styles.loadingText}>Loading product...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.textSecondary} />
          <Text style={styles.loadingText}>Product not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const qtyText = product.quantity && product.unit
    ? `${product.quantity} ${product.unit}${product.period ? ' / ' + product.period : ''}`
    : 'Not specified';

  const priceText = product.price
    ? `${product.price.toLocaleString()} ${product.currency} / ${product.priceUnit}`
    : 'Price not available';

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* ── Product Image ─────────────────────── */}
        <View style={styles.imageBlock}>
          {product.image ? (
            <Image source={product.image} style={styles.productImage} resizeMode="cover" />
          ) : (
            <View style={styles.imageFallback}>
              <Ionicons name="leaf-outline" size={72} color={Colors.primaryLight} />
            </View>
          )}

          {/* Overlay: category + status */}
          <View style={styles.imageOverlay}>
            <View style={styles.catPill}>
              <Text style={styles.catPillText}>{product.category}</Text>
            </View>
            <View style={styles.availPill}>
              <View style={styles.availDot} />
              <Text style={styles.availText}>Available</Text>
            </View>
          </View>

          {/* Code tag */}
          <View style={styles.codeTag}>
            <Text style={styles.codeTagText}>{product.code}</Text>
          </View>
        </View>

        {/* ── Product Title ─────────────────────── */}
        <View style={styles.titleBlock}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productCode}>Product Code: {product.code}</Text>
        </View>

        {/* ── Price Highlight Banner ────────────── */}
        <View style={styles.priceBanner}>
          <View>
            <Text style={styles.priceBannerLabel}>Market Price</Text>
            <Text style={styles.priceBannerValue}>{priceText}</Text>
          </View>
          <View style={styles.priceBannerQtyWrap}>
            <Text style={styles.priceBannerLabel}>Weekly Supply</Text>
            <Text style={styles.priceBannerQty}>{qtyText}</Text>
          </View>
        </View>

        {/* ── Details Card ──────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            <Ionicons name="information-circle-outline" size={15} color={Colors.primary} />
            {' '}Product Details
          </Text>
          <InfoRow icon="pricetag-outline"  label="Price"             value={priceText}                highlight={!!product.price} />
          <View style={styles.sep} />
          <InfoRow icon="layers-outline"    label="Available Quantity" value={qtyText} />
          <View style={styles.sep} />
          <InfoRow icon="location-outline"  label="Location"           value={product.location ?? 'Rwanda'} />
          <View style={styles.sep} />
          <InfoRow icon="barcode-outline"   label="Product Code"       value={product.code} />
        </View>

        {/* ── Description Card ──────────────────── */}
        {product.description && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              <Ionicons name="document-text-outline" size={15} color={Colors.primary} />
              {' '}Description
            </Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>
        )}

        {/* ── Why GanaHeza Card ─────────────────── */}
        <View style={styles.whyCard}>
          <Ionicons name="shield-checkmark-outline" size={22} color={Colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.whyTitle}>Quality Guaranteed</Text>
            <Text style={styles.whyText}>
              All GanaHeza products are sourced from verified Rwandan farmers and meet export quality standards.
            </Text>
          </View>
        </View>

        {/* ── Action Buttons ────────────────────── */}
        <View style={styles.actions}>
          {/* Order Now — main action */}
          <TouchableOpacity
            style={styles.orderBtn}
            onPress={() => router.push({ pathname: '/order', params: { id: product.id } })}
            activeOpacity={0.85}
          >
            <Ionicons name="cart-outline" size={20} color={Colors.white} />
            <Text style={styles.orderBtnText}>Order Now</Text>
          </TouchableOpacity>

          {/* WhatsApp */}
          <TouchableOpacity
            style={styles.whatsappBtn}
            onPress={() => openWhatsApp(product.name)}
            activeOpacity={0.85}
          >
            <Ionicons name="logo-whatsapp" size={20} color={Colors.white} />
            <Text style={styles.whatsappBtnText}>WhatsApp</Text>
          </TouchableOpacity>

          {/* Contact page */}
          <TouchableOpacity
            style={styles.contactBtn}
            onPress={() => router.push('/contact')}
            activeOpacity={0.85}
          >
            <Ionicons name="call-outline" size={20} color={Colors.primary} />
            <Text style={styles.contactBtnText}>Call Us</Text>
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
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 15, color: Colors.textSecondary },

  // Image
  imageBlock: {
    height: 260,
    position: 'relative',
    backgroundColor: Colors.heroBg,
  },
  productImage: {
    width: '100%',
    height: 260,
  },
  imageFallback: {
    width: '100%',
    height: 260,
    backgroundColor: Colors.heroBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageOverlay: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    gap: 8,
  },
  catPill: {
    backgroundColor: 'rgba(46,125,50,0.88)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  catPillText: { fontSize: 11, color: Colors.white, fontWeight: '700' },
  availPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  availDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.available },
  availText: { fontSize: 11, color: Colors.available, fontWeight: '700' },
  codeTag: {
    position: 'absolute',
    bottom: 12,
    right: 14,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  codeTagText: { color: Colors.white, fontSize: 11, fontWeight: '600' },

  // Title
  titleBlock: {
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  productName: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textMain,
    marginBottom: 4,
  },
  productCode: {
    fontSize: 12,
    color: Colors.textSecondary,
    letterSpacing: 0.3,
  },

  // Price banner
  priceBanner: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceBannerLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '500',
    marginBottom: 4,
  },
  priceBannerValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.white,
  },
  priceBannerQtyWrap: {
    alignItems: 'flex-end',
  },
  priceBannerQty: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },

  // Cards
  card: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textMain,
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  infoIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: Colors.tagBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTexts: { flex: 1 },
  infoLabel: { fontSize: 11, color: Colors.textSecondary, marginBottom: 2 },
  infoValue: { fontSize: 14, fontWeight: '600', color: Colors.textMain },
  infoHighlight: { color: Colors.primary, fontSize: 15, fontWeight: '700' },
  sep: { height: 1, backgroundColor: Colors.divider, marginLeft: 46 },

  // Description
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 23,
  },

  // Why card
  whyCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: Colors.heroBg,
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  whyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  whyText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },

  // Actions
  actions: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 18,
    gap: 8,
  },
  orderBtn: {
    flex: 1.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 15,
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  orderBtnText: { fontSize: 14, fontWeight: '800', color: Colors.white },
  whatsappBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#25D366',
    borderRadius: 14,
    paddingVertical: 15,
    elevation: 3,
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  whatsappBtnText: { fontSize: 13, fontWeight: '700', color: Colors.white },
  contactBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingVertical: 15,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  contactBtnText: { fontSize: 13, fontWeight: '700', color: Colors.primary },
});
