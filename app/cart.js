import React from 'react';
import {
  Alert,
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
import { useCart } from '@/context/CartContext';

export default function CartScreen() {
  const router = useRouter();
  const { cartItems, removeFromCart, clearCart, checkoutCart, totalItems } = useCart();

  function confirmRemove(itemId, name) {
    Alert.alert(
      'Remove Item',
      `Remove ${name} from your cart?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeFromCart(itemId) },
      ]
    );
  }

  function handleCheckout() {
    checkoutCart();
    Alert.alert(
      '📦 Order Submitted Successfully!',
      'Thank you! Your order request has been received by GanaHeza and recorded in the system. Our team will contact you shortly.',
      [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={Colors.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Cart</Text>
        {cartItems.length > 0 && (
          <TouchableOpacity onPress={() => Alert.alert('Clear Cart', 'Remove all items?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Clear', style: 'destructive', onPress: clearCart },
          ])} activeOpacity={0.7}>
            <Text style={styles.clearText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {cartItems.length === 0 ? (
        /* Empty state */
        <View style={styles.emptyState}>
          <Ionicons name="cart-outline" size={80} color={Colors.cardBorder} />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>Browse products and add them to your cart</Text>
          <TouchableOpacity
            style={styles.browseBtn}
            onPress={() => router.push('/(tabs)/products')}
            activeOpacity={0.85}
          >
            <Ionicons name="leaf-outline" size={18} color={Colors.white} />
            <Text style={styles.browseBtnText}>Browse Products</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.countText}>{totalItems} item(s) in cart</Text>

            {cartItems.map((item) => (
              <View key={item.id} style={styles.cartCard}>
                {/* Product image */}
                <View style={styles.cardImgWrap}>
                  {item.product.image ? (
                    <Image source={item.product.image} style={styles.cardImg} resizeMode="cover" />
                  ) : (
                    <View style={styles.cardImgFallback}>
                      <Ionicons name="leaf-outline" size={24} color={Colors.primaryLight} />
                    </View>
                  )}
                </View>

                {/* Info */}
                <View style={styles.cardInfo}>
                  <View style={styles.cardTopRow}>
                    <Text style={styles.cardName}>{item.product.name}</Text>
                    <TouchableOpacity
                      onPress={() => confirmRemove(item.id, item.product.name)}
                      activeOpacity={0.7}
                      style={styles.removeBtn}
                    >
                      <Ionicons name="trash-outline" size={16} color={Colors.unavailable} />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.cardCode}>{item.product.code}</Text>

                  <View style={styles.orderDetails}>
                    <View style={styles.detailChip}>
                      <Ionicons name="cube-outline" size={12} color={Colors.primary} />
                      <Text style={styles.detailChipText}>Qty: {item.orderDetails.quantity} {item.orderDetails.unit}</Text>
                    </View>
                    {item.orderDetails.deliveryDate ? (
                      <View style={styles.detailChip}>
                        <Ionicons name="calendar-outline" size={12} color={Colors.primary} />
                        <Text style={styles.detailChipText}>{item.orderDetails.deliveryDate}</Text>
                      </View>
                    ) : null}
                  </View>

                  {item.orderDetails.notes ? (
                    <Text style={styles.notesText} numberOfLines={2}>
                      Note: {item.orderDetails.notes}
                    </Text>
                  ) : null}

                  <View style={styles.availBadge}>
                    <View style={styles.dot} />
                    <Text style={styles.availText}>Ready to Order</Text>
                  </View>
                </View>
              </View>
            ))}

            {/* Order summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Order Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Products</Text>
                <Text style={styles.summaryValue}>{cartItems.length}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Items</Text>
                <Text style={styles.summaryValue}>{totalItems}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Status</Text>
                <Text style={[styles.summaryValue, { color: Colors.primary }]}>Pending Confirmation</Text>
              </View>
            </View>

            <View style={{ height: 100 }} />
          </ScrollView>

          {/* Checkout button */}
          <View style={styles.checkoutWrap}>
            <TouchableOpacity
              style={styles.checkoutBtn}
              onPress={handleCheckout}
              activeOpacity={0.85}
            >
              <Ionicons name="checkmark-circle-outline" size={22} color={Colors.white} />
              <Text style={styles.checkoutText}>Submit Order Request</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '800', color: Colors.textMain },
  clearText: { fontSize: 13, color: Colors.unavailable, fontWeight: '600' },

  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 40,
  },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: Colors.textMain },
  emptySubtitle: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },
  browseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderRadius: 12,
    marginTop: 8,
  },
  browseBtnText: { fontSize: 15, fontWeight: '700', color: Colors.white },

  listContent: { padding: 16 },
  countText: { fontSize: 13, color: Colors.textSecondary, marginBottom: 12, fontWeight: '500' },

  cartCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  cardImgWrap: { width: 90, height: 100 },
  cardImg: { width: 90, height: 100 },
  cardImgFallback: {
    width: 90,
    height: 100,
    backgroundColor: Colors.heroBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: { flex: 1, padding: 12, gap: 4 },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardName: { fontSize: 14, fontWeight: '700', color: Colors.textMain, flex: 1 },
  removeBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardCode: { fontSize: 10, color: Colors.textSecondary },
  orderDetails: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  detailChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.tagBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  detailChipText: { fontSize: 10, color: Colors.primary, fontWeight: '600' },
  notesText: { fontSize: 11, color: Colors.textSecondary, fontStyle: 'italic' },
  availBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.available },
  availText: { fontSize: 10, color: Colors.available, fontWeight: '600' },

  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: 10,
  },
  summaryTitle: { fontSize: 15, fontWeight: '700', color: Colors.textMain, marginBottom: 4 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: 13, color: Colors.textSecondary },
  summaryValue: { fontSize: 14, fontWeight: '700', color: Colors.textMain },

  checkoutWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
    elevation: 10,
  },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  checkoutText: { fontSize: 16, fontWeight: '800', color: Colors.white },
});
