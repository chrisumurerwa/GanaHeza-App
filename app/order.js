import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import Colors from '@/constants/colors';
import { useProducts } from '@/context/ProductContext';
import { useCart } from '@/context/CartContext';

const UNITS = ['Kg', 'T'];

function formatDeliveryDate(date) {
  return new Intl.DateTimeFormat('en-RW', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

// ─── Quantity Counter (+/-) ───────────────────────────────────────────────────
function QuantityCounter({ value, onChange, min = 1, max = 99999 }) {
  const [localText, setLocalText] = useState(String(value));

  useEffect(() => {
    setLocalText(String(value));
  }, [value]);

  function decrement() {
    const next = Math.max(min, (parseInt(localText, 10) || min) - 1);
    setLocalText(String(next));
    onChange(next);
  }
  function increment() {
    const next = Math.min(max, (parseInt(localText, 10) || 0) + 1);
    setLocalText(String(next));
    onChange(next);
  }
  function handleText(text) {
    const clean = text.replace(/[^0-9]/g, '');
    setLocalText(clean);
    const num = parseInt(clean, 10);
    if (!isNaN(num)) {
      onChange(Math.min(max, num));
    }
  }
  function handleBlur() {
    const num = parseInt(localText, 10);
    if (isNaN(num) || num < min) {
      setLocalText(String(min));
      onChange(min);
    } else if (num > max) {
      setLocalText(String(max));
      onChange(max);
    }
  }

  return (
    <View style={styles.counter}>
      <TouchableOpacity
        style={[styles.counterBtn, value <= min && styles.counterBtnDisabled]}
        onPress={decrement}
        activeOpacity={0.8}
        disabled={value <= min}
      >
        <Ionicons name="remove" size={20} color={value <= min ? Colors.textSecondary : Colors.white} />
      </TouchableOpacity>

      <TextInput
        style={styles.counterInput}
        value={localText}
        onChangeText={handleText}
        onBlur={handleBlur}
        keyboardType="numeric"
        textAlign="center"
        selectTextOnFocus
      />

      <TouchableOpacity
        style={styles.counterBtn}
        onPress={increment}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={20} color={Colors.white} />
      </TouchableOpacity>
    </View>
  );
}

export default function OrderScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { addToCart, submitDirectOrder } = useCart();
  const { getProductById } = useProducts();

  const [product, setProduct] = useState(() => getProductById(id));
  const [quantity, setQuantity] = useState(1);
  const [selectedUnit, setSelectedUnit] = useState('Kg');
  const [deliveryDate, setDeliveryDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    deliveryDate: '',
    notes: '',
  });

  useEffect(() => {
    const p = getProductById(id);
    setProduct(p);
    if (p?.unit) setSelectedUnit(p.unit);
    if (p?.quantity) setQuantity(1);
  }, [id, getProductById]);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleDeliveryDateChange(event, selectedDate) {
    if (Platform.OS !== 'ios') setShowDatePicker(false);
    if (!selectedDate) return;

    setDeliveryDate(selectedDate);
    updateField('deliveryDate', formatDeliveryDate(selectedDate));
  }

  function handleAddToCart() {
    if (!form.name.trim() || !form.phone.trim()) {
      Alert.alert('Missing Fields', 'Please fill in your name and phone number.');
      return;
    }
    addToCart(product, {
      quantity,
      unit: selectedUnit,
      deliveryDate: form.deliveryDate,
      notes: form.notes,
      clientName: form.name,
      clientPhone: form.phone,
      clientEmail: form.email,
    });
    Alert.alert(
      '✅ Added to Cart!',
      `${product.name} (${quantity} ${selectedUnit}) has been added to your cart.`,
      [
        { text: 'Continue Shopping', onPress: () => router.back() },
        { text: 'View Cart', onPress: () => router.push('/cart') },
      ]
    );
  }

  const [submittingOrder, setSubmittingOrder] = useState(false);

  async function handleDirectOrder() {
    if (!form.name.trim() || !form.phone.trim()) {
      Alert.alert('Missing Contact Info', 'Please provide your Full Name and Phone Number so our team can confirm your order.');
      return;
    }
    setSubmittingOrder(true);
    try {
      const newOrder = await submitDirectOrder(product, {
        quantity,
        unit: selectedUnit,
        deliveryDate: form.deliveryDate,
        notes: form.notes,
        clientName: form.name,
        clientPhone: form.phone,
        clientEmail: form.email,
      });
      Alert.alert(
        '🎉 Order Placed Successfully!',
        `Order ${newOrder.id} for ${quantity} ${selectedUnit} of ${product.name} has been sent directly to GanaHeza management. We will contact you at ${form.phone}.`,
        [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
      );
    } catch (err) {
      Alert.alert(
        'Order Failed',
        err?.message || 'Something went wrong while submitting your order. Please check your connection and try again.'
      );
    } finally {
      setSubmittingOrder(false);
    }
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <View style={styles.centered}>
          <Ionicons name="leaf-outline" size={40} color={Colors.primaryLight} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* ── Header ────────────────────────────── */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color={Colors.textMain} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Place Order</Text>
          <View style={{ width: 38 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Product summary card ──────────────── */}
          <View style={styles.productCard}>
            <View style={styles.productImgWrap}>
              {product.image ? (
                <Image source={product.image} style={styles.productImg} resizeMode="cover" />
              ) : (
                <View style={styles.productImgFallback}>
                  <Ionicons name="leaf" size={28} color={Colors.white} />
                </View>
              )}
            </View>
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productCode}>{product.code}</Text>
              {product.price ? (
                <Text style={styles.productPrice}>
                  {product.price.toLocaleString()} {product.currency}/{product.priceUnit}
                </Text>
              ) : (
                <Text style={styles.productPriceTbd}>Price on request</Text>
              )}
            </View>
            <View style={styles.availBadge}>
              <View style={styles.dot} />
              <Text style={styles.availText}>In Stock</Text>
            </View>
          </View>

          {/* ── Order Details card ───────────────── */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="cube-outline" size={18} color={Colors.primary} />
              <Text style={styles.cardTitle}>Order Details</Text>
            </View>

            {/* Quantity label + counter */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Quantity *</Text>
              <QuantityCounter value={quantity} onChange={setQuantity} />
            </View>

            {/* Unit selector — full-width row of chips */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Unit</Text>
              <View style={styles.unitsGrid}>
                {UNITS.map((u) => (
                  <TouchableOpacity
                    key={u}
                    style={[styles.unitChip, selectedUnit === u && styles.unitChipActive]}
                    onPress={() => setSelectedUnit(u)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.unitText, selectedUnit === u && styles.unitTextActive]}>
                      {u}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Selected summary */}
            <View style={styles.selectedSummary}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
              <Text style={styles.selectedText}>
                Ordering: <Text style={styles.selectedBold}>{quantity} {selectedUnit}</Text> of {product.name}
              </Text>
            </View>

            {/* Delivery date */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Preferred Delivery Date</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.75}
                accessibilityLabel="Choose preferred delivery date"
                accessibilityHint="Opens a calendar to select a delivery date"
              >
                <Ionicons name="calendar-outline" size={16} color={Colors.textSecondary} />
                <Text style={[styles.datePickerText, !form.deliveryDate && styles.datePickerPlaceholder]}>
                  {form.deliveryDate || 'Choose a date'}
                </Text>
                <Ionicons name="chevron-down" size={18} color={Colors.textSecondary} />
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={deliveryDate || new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'inline' : 'default'}
                  minimumDate={new Date()}
                  onChange={handleDeliveryDateChange}
                />
              )}
            </View>

            {/* Notes */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Additional Notes</Text>
              <TextInput
                style={[styles.inputDirect, styles.textArea]}
                value={form.notes}
                onChangeText={(v) => updateField('notes', v)}
                placeholder="Special requirements, delivery address, etc."
                placeholderTextColor={Colors.textSecondary}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* ── Your Details card ────────────────── */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="person-outline" size={18} color={Colors.primary} />
              <Text style={styles.cardTitle}>Your Contact Details</Text>
            </View>

            {[
              { field: 'name',  label: 'Full Name *',     placeholder: 'Your full name',   icon: 'person-outline',   keyboard: 'default',       caps: 'words' },
              { field: 'phone', label: 'Phone Number *',  placeholder: '+250 XXX XXX XXX', icon: 'call-outline',     keyboard: 'phone-pad',     caps: 'none' },
              { field: 'email', label: 'Email (optional)', placeholder: 'your@email.com',  icon: 'mail-outline',     keyboard: 'email-address', caps: 'none' },
            ].map(({ field, label, placeholder, icon, keyboard, caps }) => (
              <View key={field} style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>{label}</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name={icon} size={16} color={Colors.textSecondary} />
                  <TextInput
                    style={styles.input}
                    value={form[field]}
                    onChangeText={(v) => updateField(field, v)}
                    placeholder={placeholder}
                    placeholderTextColor={Colors.textSecondary}
                    keyboardType={keyboard}
                    autoCapitalize={caps}
                  />
                </View>
              </View>
            ))}
          </View>

          {/* ── Info note ────────────────────────── */}
          <View style={styles.infoNote}>
            <Ionicons name="information-circle-outline" size={16} color={Colors.primary} />
            <Text style={styles.infoNoteText}>
              Our team will contact you to confirm your order and arrange delivery.
            </Text>
          </View>

          {/* ── Action Buttons ─────────────────── */}
          <View style={{ gap: 10 }}>
            <TouchableOpacity
              style={[styles.addToCartBtn, submittingOrder && { opacity: 0.6 }]}
              onPress={handleDirectOrder}
              disabled={submittingOrder}
              activeOpacity={0.85}
            >
              <Ionicons name={submittingOrder ? 'sync-outline' : 'flash-outline'} size={22} color={Colors.white} />
              <Text style={styles.addToCartText}>{submittingOrder ? 'Submitting…' : `Place Order Now — ${quantity} ${selectedUnit}`}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryCartBtn}
              onPress={handleAddToCart}
              activeOpacity={0.85}
            >
              <Ionicons name="cart-outline" size={20} color={Colors.primary} />
              <Text style={styles.secondaryCartText}>Add to Cart & Continue</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  loadingText: { fontSize: 15, color: Colors.textSecondary },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: Colors.background,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.cardBorder,
  },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '800', color: Colors.textMain, textAlign: 'center' },

  content: { padding: 16, gap: 14 },

  // Product card
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  productImgWrap: { width: 80, height: 80 },
  productImg: { width: 80, height: 80 },
  productImgFallback: {
    width: 80, height: 80,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  productInfo: { flex: 1, paddingHorizontal: 12, paddingVertical: 10 },
  productName: { fontSize: 15, fontWeight: '700', color: Colors.textMain },
  productCode: { fontSize: 10, color: Colors.textSecondary, marginTop: 2 },
  productPrice: { fontSize: 13, fontWeight: '700', color: Colors.primary, marginTop: 4 },
  productPriceTbd: { fontSize: 12, color: Colors.textSecondary, fontStyle: 'italic', marginTop: 4 },
  availBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#E8F5E9', paddingHorizontal: 10,
    paddingVertical: 6, marginRight: 10, borderRadius: 8,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.available },
  availText: { fontSize: 10, color: Colors.available, fontWeight: '700' },

  // Card
  card: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginBottom: 16, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.divider,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: Colors.textMain },

  // Fields
  fieldGroup: { marginBottom: 14 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: Colors.textMain, marginBottom: 8 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.background, borderWidth: 1,
    borderColor: Colors.inputBorder, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 12,
  },
  input: { flex: 1, fontSize: 14, color: Colors.textMain, paddingVertical: 0 },
  datePickerButton: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.background, borderWidth: 1,
    borderColor: Colors.inputBorder, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 13,
  },
  datePickerText: { flex: 1, fontSize: 14, color: Colors.textMain },
  datePickerPlaceholder: { color: Colors.textSecondary },
  inputDirect: {
    backgroundColor: Colors.background, borderWidth: 1,
    borderColor: Colors.inputBorder, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: Colors.textMain,
  },
  textArea: { minHeight: 80, paddingTop: 12 },

  // ── Quantity counter ──────────────────────────────
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
    alignSelf: 'flex-start',
    backgroundColor: Colors.white,
  },
  counterBtn: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
  },
  counterBtnDisabled: {
    backgroundColor: Colors.cardBorder,
  },
  counterInput: {
    width: 80,
    height: 48,
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textMain,
    textAlign: 'center',
    backgroundColor: Colors.white,
  },

  // ── Unit chips grid ───────────────────────────────
  unitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  unitChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
    backgroundColor: Colors.white,
    minWidth: 64,
    alignItems: 'center',
  },
  unitChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  unitText: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary },
  unitTextActive: { color: Colors.white },

  // Selected summary
  selectedSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.heroBg,
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  selectedText: { fontSize: 13, color: Colors.textSecondary },
  selectedBold: { fontWeight: '700', color: Colors.primary },

  // Info note
  infoNote: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: Colors.heroBg, borderRadius: 12,
    padding: 14, borderWidth: 1, borderColor: Colors.cardBorder,
  },
  infoNoteText: { flex: 1, fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },

  // Add to cart
  addToCartBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, backgroundColor: Colors.primary, borderRadius: 14,
    paddingVertical: 16, elevation: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8,
  },
  addToCartText: { fontSize: 15, fontWeight: '800', color: Colors.white },
  secondaryCartBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: Colors.white, borderRadius: 14,
    paddingVertical: 14, borderWidth: 1.5, borderColor: Colors.primary,
  },
  secondaryCartText: { fontSize: 14, fontWeight: '700', color: Colors.primary },
});
