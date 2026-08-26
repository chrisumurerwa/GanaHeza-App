import React, { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { useProducts } from '@/context/ProductContext';

const WHATSAPP_NUMBER = '250783486662';

// ─── Preset images (same set as dashboard) ────────────────────────────────────
const IMAGE_PRESETS = [
  { key: 'none',      label: 'Default Icon',  image: null },
  { key: 'avocado',   label: 'Avocado',        image: require('@/assets/images/avocado.jpg') },
  { key: 'beans',     label: 'Beans',          image: require('@/assets/images/beans.jpg') },
  { key: 'habanero',  label: 'Habanero',       image: require('@/assets/images/habanero.jpg') },
  { key: 'tomatoes',  label: 'Tomatoes',       image: require('@/assets/images/tomatoes.jpg') },
  { key: 'mangoes',   label: 'Mangoes',        image: require('@/assets/images/mangoes.jpg') },
  { key: 'coffee',    label: 'Coffee',         image: require('@/assets/images/coffee.jpg') },
  { key: 'maize',     label: 'Maize',          image: require('@/assets/images/maize.jpg') },
  { key: 'passion',   label: 'Passion Fruit',  image: require('@/assets/images/passion-fruit.jpg') },
  { key: 'macadamia', label: 'Macadamia',      image: require('@/assets/images/macadamia.jpg') },
  { key: 'teja',      label: 'Teja Chilli',    image: require('@/assets/images/teja.jpg') },
];

const CATEGORIES = [
  'Vegetables', 'Fruits', 'Cereals', 'Nuts',
  'Cash Crops', 'Chillies', 'Roots & Tubers',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
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

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ProductDetailsScreen() {
  const { id, fromDashboard } = useLocalSearchParams();
  const router = useRouter();
  const { getProductById, loading: productsLoading, fetchProducts, updateProduct } = useProducts();
  const product = getProductById(id);

  // ── Edit modal state ──────────────────────────────────────────────────────
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [imageMode, setImageMode] = useState('upload'); // 'upload' | 'preset' | 'url'

  function buildInitialForm(p) {
    return {
      name:            p?.name        ?? '',
      category:        p?.category    ?? 'Vegetables',
      price:           p?.price       != null ? String(p.price) : '',
      currency:        p?.currency    ?? 'RWF',
      priceUnit:       p?.priceUnit   ?? 'Kg',
      quantity:        p?.quantity    != null ? String(p.quantity) : '',
      unit:            p?.unit        ?? 'Kg',
      period:          p?.period      ?? 'Week',
      location:        p?.location    ?? 'Rwanda',
      description:     p?.description ?? '',
      status:          p?.status      ?? 'available',
      // image fields
      uploadedImageUri:  null,       // local file:// URI from picker
      selectedImageKey:  'none',     // preset key
      customImageUrl:    p?.imageUrl ?? '', // full URL (existing or typed)
    };
  }

  const [form, setForm] = useState(() => buildInitialForm(product));

  function openEditModal() {
    setForm(buildInitialForm(product));
    setImageMode(
      product?.imageUrl
        ? (product.imageUrl.startsWith('http') ? 'url' : 'upload')
        : 'upload'
    );
    setEditOpen(true);
  }

  // ── Image pickers ─────────────────────────────────────────────────────────
  async function pickFromGallery() {
    try {
      const ImagePicker = require('expo-image-picker');
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: false,
        quality: 0.85,
      });
      if (!result.canceled && result.assets?.[0]?.uri) {
        setForm((prev) => ({
          ...prev,
          uploadedImageUri: result.assets[0].uri,
          selectedImageKey: 'custom',
          customImageUrl:   '',
        }));
      }
    } catch (err) {
      Alert.alert('Gallery Error', err.message || 'Could not open gallery.');
    }
  }

  async function takePhoto() {
    try {
      const ImagePicker = require('expo-image-picker');
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission Needed', 'Allow camera access in your device settings.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({ quality: 0.85 });
      if (!result.canceled && result.assets?.[0]?.uri) {
        setForm((prev) => ({
          ...prev,
          uploadedImageUri: result.assets[0].uri,
          selectedImageKey: 'custom',
          customImageUrl:   '',
        }));
      }
    } catch (err) {
      Alert.alert('Camera Error', err.message || 'Could not open camera.');
    }
  }

  // ── Save handler ──────────────────────────────────────────────────────────
  async function handleSave() {
    if (!form.name.trim()) {
      Alert.alert('Validation', 'Product name is required.');
      return;
    }

    // Resolve the image to pass to updateProduct
    let image = null;
    if (form.uploadedImageUri) {
      image = { uri: form.uploadedImageUri };
    } else if (imageMode === 'url' && form.customImageUrl.trim()) {
      image = { uri: form.customImageUrl.trim() };
    } else if (imageMode === 'preset') {
      const preset = IMAGE_PRESETS.find((p) => p.key === form.selectedImageKey);
      image = preset?.image ?? null;
    } else {
      // Keep the existing image if no new one chosen
      image = product?.image ?? null;
    }

    setSaving(true);
    try {
      await updateProduct(id, {
        name:        form.name.trim(),
        category:    form.category,
        price:       form.price       ? Number(form.price)    : null,
        currency:    form.currency,
        priceUnit:   form.priceUnit,
        quantity:    form.quantity    ? Number(form.quantity) : null,
        unit:        form.unit        || null,
        period:      form.period      || null,
        location:    form.location.trim() || null,
        description: form.description.trim() || null,
        status:      form.status,
        image,
      });
      setEditOpen(false);
      Alert.alert('Saved', `"${form.name.trim()}" has been updated.`);
    } catch (err) {
      Alert.alert('Save Failed', err?.message || 'Could not update the product.');
    } finally {
      setSaving(false);
    }
  }

  // ── Guards ────────────────────────────────────────────────────────────────
  if (productsLoading) {
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
          <TouchableOpacity style={styles.retryBtn} onPress={fetchProducts} activeOpacity={0.8}>
            <Text style={styles.retryBtnText}>Reload Products</Text>
          </TouchableOpacity>
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

  // Resolve what image is currently shown in the edit form preview
  const editPreviewSource = (() => {
    if (form.uploadedImageUri) return { uri: form.uploadedImageUri };
    if (imageMode === 'url' && form.customImageUrl.trim()) return { uri: form.customImageUrl.trim() };
    if (imageMode === 'preset') {
      const p = IMAGE_PRESETS.find((p) => p.key === form.selectedImageKey);
      if (p?.image) return p.image;
    }
    return product.image ?? null;
  })();

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* ── Product Image ──────────────────────────────────────────── */}
        <View style={styles.imageBlock}>
          {product.imageUrl ? (
            <Image source={{ uri: product.imageUrl }} style={styles.productImage} resizeMode="cover" />
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

          {/* Edit button — only shown when opened from the admin dashboard */}
          {!!fromDashboard && (
            <TouchableOpacity style={styles.editImageBtn} onPress={openEditModal} activeOpacity={0.85}>
              <Ionicons name="create-outline" size={16} color={Colors.white} />
              <Text style={styles.editImageBtnText}>Edit Product</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Product Title ──────────────────────────────────────────── */}
        <View style={styles.titleBlock}>
          <View style={styles.titleRow}>
            <Text style={styles.productName}>{product.name}</Text>
            {!!fromDashboard && (
              <TouchableOpacity style={styles.editIconBtn} onPress={openEditModal} activeOpacity={0.8}>
                <Ionicons name="pencil-outline" size={18} color={Colors.primary} />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.productCode}>Product Code: {product.code}</Text>
        </View>

        {/* ── Price Highlight Banner ─────────────────────────────────── */}
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

        {/* ── Details Card ───────────────────────────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            <Ionicons name="information-circle-outline" size={15} color={Colors.primary} />
            {' '}Product Details
          </Text>
          <InfoRow icon="pricetag-outline" label="Price"              value={priceText}            highlight={!!product.price} />
          <View style={styles.sep} />
          <InfoRow icon="layers-outline"   label="Available Quantity" value={qtyText} />
          <View style={styles.sep} />
          <InfoRow icon="location-outline" label="Location"           value={product.location ?? 'Rwanda'} />
          <View style={styles.sep} />
          <InfoRow icon="barcode-outline"  label="Product Code"       value={product.code} />
        </View>

        {/* ── Description Card ───────────────────────────────────────── */}
        {product.description && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              <Ionicons name="document-text-outline" size={15} color={Colors.primary} />
              {' '}Description
            </Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>
        )}

        {/* ── Why GanaHeza Card ──────────────────────────────────────── */}
        <View style={styles.whyCard}>
          <Ionicons name="shield-checkmark-outline" size={22} color={Colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.whyTitle}>Quality Guaranteed</Text>
            <Text style={styles.whyText}>
              All GanaHeza products are sourced from verified Rwandan farmers and meet export quality standards.
            </Text>
          </View>
        </View>

        {/* ── Action Buttons ─────────────────────────────────────────── */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.orderBtn}
            onPress={() => router.push({ pathname: '/order', params: { id: product.id } })}
            activeOpacity={0.85}
          >
            <Ionicons name="cart-outline" size={20} color={Colors.white} />
            <Text style={styles.orderBtnText}>Order Now</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.whatsappBtn}
            onPress={() => openWhatsApp(product.name)}
            activeOpacity={0.85}
          >
            <Ionicons name="logo-whatsapp" size={20} color={Colors.white} />
            <Text style={styles.whatsappBtnText}>WhatsApp</Text>
          </TouchableOpacity>

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

      {/* ════════════════════════════════════════════════════════════════
          EDIT PRODUCT MODAL
      ════════════════════════════════════════════════════════════════ */}
      <Modal
        visible={editOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => !saving && setEditOpen(false)}
      >
        <SafeAreaView style={styles.modalSafe}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            {/* Modal header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Edit Product</Text>
                <Text style={styles.modalSub}>{product.name}</Text>
              </View>
              <TouchableOpacity
                onPress={() => !saving && setEditOpen(false)}
                style={styles.modalCloseBtn}
                activeOpacity={0.7}
                disabled={saving}
              >
                <Ionicons name="close" size={22} color={Colors.textMain} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={{ paddingBottom: 40 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >

              {/* ── PRODUCT IMAGE SECTION ─────────────────────────────── */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Product Photo</Text>

                {/* Current image preview */}
                <View style={styles.currentImageWrap}>
                  {editPreviewSource ? (
                    <Image source={editPreviewSource} style={styles.currentImage} resizeMode="cover" />
                  ) : (
                    <View style={[styles.currentImage, styles.currentImageFallback]}>
                      <Ionicons name="leaf-outline" size={40} color={Colors.primaryLight} />
                      <Text style={styles.noImageText}>No image</Text>
                    </View>
                  )}
                  {(form.uploadedImageUri || (imageMode === 'url' && form.customImageUrl.trim())) && (
                    <View style={styles.newBadge}>
                      <Text style={styles.newBadgeText}>New</Text>
                    </View>
                  )}
                </View>

                {/* Mode tabs */}
                <View style={styles.modeRow}>
                  {[
                    { key: 'upload', icon: 'images-outline',  label: 'Gallery' },
                    { key: 'preset', icon: 'leaf-outline',    label: 'Presets' },
                    { key: 'url',    icon: 'link-outline',    label: 'URL' },
                  ].map((m) => (
                    <TouchableOpacity
                      key={m.key}
                      style={[styles.modeBtn, imageMode === m.key && styles.modeBtnActive]}
                      onPress={() => setImageMode(m.key)}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name={m.icon}
                        size={14}
                        color={imageMode === m.key ? Colors.white : Colors.primary}
                      />
                      <Text style={[styles.modeBtnText, imageMode === m.key && styles.modeBtnTextActive]}>
                        {m.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Mode: Gallery / Camera */}
                {imageMode === 'upload' && (
                  <View style={styles.uploadBox}>
                    {form.uploadedImageUri ? (
                      <View style={styles.uploadedPreviewRow}>
                        <Image
                          source={{ uri: form.uploadedImageUri }}
                          style={styles.uploadedThumb}
                          resizeMode="cover"
                        />
                        <View style={styles.uploadedActions}>
                          <TouchableOpacity style={styles.changeBtn} onPress={pickFromGallery} activeOpacity={0.8}>
                            <Ionicons name="images-outline" size={14} color={Colors.white} />
                            <Text style={styles.changeBtnText}>Change</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.removeBtn}
                            onPress={() => setForm((p) => ({ ...p, uploadedImageUri: null }))}
                            activeOpacity={0.8}
                          >
                            <Ionicons name="trash-outline" size={14} color={Colors.white} />
                            <Text style={styles.changeBtnText}>Remove</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <View style={styles.pickerButtons}>
                        <TouchableOpacity style={styles.galleryBtn} onPress={pickFromGallery} activeOpacity={0.85}>
                          <Ionicons name="cloud-upload-outline" size={26} color={Colors.primary} />
                          <Text style={styles.galleryBtnTitle}>Upload from Gallery</Text>
                          <Text style={styles.galleryBtnSub}>JPG, PNG or WEBP</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.cameraBtn} onPress={takePhoto} activeOpacity={0.85}>
                          <Ionicons name="camera-outline" size={18} color={Colors.primary} />
                          <Text style={styles.cameraBtnText}>Take Photo with Camera</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}

                {/* Mode: Presets */}
                {imageMode === 'preset' && (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.presetsRow}
                  >
                    {IMAGE_PRESETS.map((preset) => {
                      const active = form.selectedImageKey === preset.key && !form.uploadedImageUri;
                      return (
                        <TouchableOpacity
                          key={preset.key}
                          style={[styles.presetCard, active && styles.presetCardActive]}
                          onPress={() =>
                            setForm((prev) => ({
                              ...prev,
                              selectedImageKey: preset.key,
                              uploadedImageUri: null,
                              customImageUrl:   '',
                            }))
                          }
                          activeOpacity={0.8}
                        >
                          {preset.image ? (
                            <Image source={preset.image} style={styles.presetImg} resizeMode="cover" />
                          ) : (
                            <View style={[styles.presetImg, styles.presetFallback]}>
                              <Ionicons name="leaf-outline" size={22} color={Colors.primaryLight} />
                            </View>
                          )}
                          <Text
                            style={[styles.presetLabel, active && styles.presetLabelActive]}
                            numberOfLines={1}
                          >
                            {preset.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}

                {/* Mode: URL */}
                {imageMode === 'url' && (
                  <View style={styles.urlBox}>
                    <Text style={styles.urlHint}>Paste a direct image URL:</Text>
                    <TextInput
                      style={styles.formInput}
                      value={form.customImageUrl}
                      onChangeText={(v) =>
                        setForm((prev) => ({
                          ...prev,
                          customImageUrl:   v,
                          uploadedImageUri: null,
                        }))
                      }
                      placeholder="https://example.com/photo.jpg"
                      placeholderTextColor={Colors.textSecondary}
                      autoCapitalize="none"
                      keyboardType="url"
                    />
                    {form.customImageUrl.trim().length > 0 && (
                      <Image
                        source={{ uri: form.customImageUrl.trim() }}
                        style={styles.urlPreview}
                        resizeMode="cover"
                      />
                    )}
                  </View>
                )}
              </View>

              {/* ── PRODUCT DETAILS ──────────────────────────────────── */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Product Details</Text>

                {/* Name */}
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Product Name *</Text>
                  <TextInput
                    style={styles.formInput}
                    value={form.name}
                    onChangeText={(v) => setForm((p) => ({ ...p, name: v }))}
                    placeholder="e.g. Fresh Avocado"
                    placeholderTextColor={Colors.textSecondary}
                  />
                </View>

                {/* Category */}
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Category *</Text>
                  <View style={styles.chipsWrap}>
                    {CATEGORIES.map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        style={[styles.chip, form.category === cat && styles.chipActive]}
                        onPress={() => setForm((p) => ({ ...p, category: cat }))}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.chipText, form.category === cat && styles.chipTextActive]}>
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Price row */}
                <View style={styles.fieldRow}>
                  <View style={[styles.field, { flex: 2 }]}>
                    <Text style={styles.fieldLabel}>Price (RWF)</Text>
                    <TextInput
                      style={styles.formInput}
                      value={form.price}
                      onChangeText={(v) => setForm((p) => ({ ...p, price: v }))}
                      placeholder="e.g. 1500"
                      placeholderTextColor={Colors.textSecondary}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={[styles.field, { flex: 1 }]}>
                    <Text style={styles.fieldLabel}>Per Unit</Text>
                    <TextInput
                      style={styles.formInput}
                      value={form.priceUnit}
                      onChangeText={(v) => setForm((p) => ({ ...p, priceUnit: v }))}
                      placeholder="Kg"
                      placeholderTextColor={Colors.textSecondary}
                    />
                  </View>
                </View>

                {/* Quantity & Unit */}
                <View style={styles.fieldRow}>
                  <View style={[styles.field, { flex: 1 }]}>
                    <Text style={styles.fieldLabel}>Quantity</Text>
                    <TextInput
                      style={styles.formInput}
                      value={form.quantity}
                      onChangeText={(v) => setForm((p) => ({ ...p, quantity: v }))}
                      placeholder="e.g. 500"
                      placeholderTextColor={Colors.textSecondary}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={[styles.field, { flex: 1 }]}>
                    <Text style={styles.fieldLabel}>Unit</Text>
                    <View style={styles.miniChips}>
                      {['Kg', 'T', 'Tonnes', 'Bags'].map((u) => (
                        <TouchableOpacity
                          key={u}
                          style={[styles.miniChip, form.unit === u && styles.miniChipActive]}
                          onPress={() => setForm((p) => ({ ...p, unit: u }))}
                        >
                          <Text style={[styles.miniChipText, form.unit === u && styles.miniChipTextActive]}>
                            {u}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>

                {/* Location */}
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Origin / Province</Text>
                  <TextInput
                    style={styles.formInput}
                    value={form.location}
                    onChangeText={(v) => setForm((p) => ({ ...p, location: v }))}
                    placeholder="e.g. Eastern Province, Rwanda"
                    placeholderTextColor={Colors.textSecondary}
                  />
                </View>

                {/* Description */}
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Description</Text>
                  <TextInput
                    style={[styles.formInput, styles.textArea]}
                    value={form.description}
                    onChangeText={(v) => setForm((p) => ({ ...p, description: v }))}
                    placeholder="Describe quality, harvest dates, packaging..."
                    placeholderTextColor={Colors.textSecondary}
                    multiline
                    numberOfLines={3}
                  />
                </View>

                {/* Status */}
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Status</Text>
                  <View style={styles.miniChips}>
                    {['available', 'unavailable'].map((s) => (
                      <TouchableOpacity
                        key={s}
                        style={[
                          styles.statusChip,
                          form.status === s && (s === 'available' ? styles.statusChipAvailable : styles.statusChipUnavailable),
                        ]}
                        onPress={() => setForm((p) => ({ ...p, status: s }))}
                        activeOpacity={0.8}
                      >
                        <Text style={[
                          styles.statusChipText,
                          form.status === s && { color: Colors.white, fontWeight: '700' },
                        ]}>
                          {s === 'available' ? '✓ Available' : '✗ Unavailable'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              {/* Save button */}
              <TouchableOpacity
                style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                onPress={handleSave}
                activeOpacity={0.85}
                disabled={saving}
              >
                {saving ? (
                  <Text style={styles.saveBtnText}>Saving...</Text>
                ) : (
                  <>
                    <Ionicons name="checkmark-circle-outline" size={20} color={Colors.white} />
                    <Text style={styles.saveBtnText}>Save Changes</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: Colors.background },
  content:     { paddingBottom: 24 },
  centered:    { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 15, color: Colors.textSecondary },

  // ── Image block ──
  imageBlock: {
    height: 260,
    position: 'relative',
    backgroundColor: Colors.heroBg,
  },
  productImage: { width: '100%', height: 260 },
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
  availDot:  { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.available },
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

  // Edit button overlaid on image (bottom-left)
  editImageBtn: {
    position: 'absolute',
    bottom: 12,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(46,125,50,0.92)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  editImageBtnText: { color: Colors.white, fontSize: 12, fontWeight: '700' },

  // ── Title block ──
  titleBlock: {
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  productName: {
    flex: 1,
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textMain,
    marginBottom: 4,
  },
  editIconBtn: {
    padding: 6,
    backgroundColor: Colors.heroBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginLeft: 8,
    marginTop: 2,
  },
  productCode: { fontSize: 12, color: Colors.textSecondary, letterSpacing: 0.3 },

  // ── Price banner ──
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
  priceBannerLabel:   { fontSize: 11, color: 'rgba(255,255,255,0.75)', fontWeight: '500', marginBottom: 4 },
  priceBannerValue:   { fontSize: 18, fontWeight: '800', color: Colors.white },
  priceBannerQtyWrap: { alignItems: 'flex-end' },
  priceBannerQty:     { fontSize: 14, fontWeight: '700', color: Colors.white },

  // ── Cards ──
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
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12 },
  infoIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: Colors.tagBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTexts:     { flex: 1 },
  infoLabel:     { fontSize: 11, color: Colors.textSecondary, marginBottom: 2 },
  infoValue:     { fontSize: 14, fontWeight: '600', color: Colors.textMain },
  infoHighlight: { color: Colors.primary, fontSize: 15, fontWeight: '700' },
  sep:           { height: 1, backgroundColor: Colors.divider, marginLeft: 46 },
  description:   { fontSize: 14, color: Colors.textSecondary, lineHeight: 23 },

  // ── Why card ──
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
  whyTitle: { fontSize: 13, fontWeight: '700', color: Colors.primary, marginBottom: 4 },
  whyText:  { fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },

  // ── Actions ──
  actions: { flexDirection: 'row', marginHorizontal: 16, marginTop: 18, gap: 8 },
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
  retryBtn: {
    marginTop: 14,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.primary,
    borderRadius: 10,
  },
  retryBtnText: { color: Colors.white, fontSize: 14, fontWeight: '700' },

  // ════ EDIT MODAL ════════════════════════════════════════════════════════════

  modalSafe: { flex: 1, backgroundColor: Colors.background },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  modalTitle:    { fontSize: 18, fontWeight: '800', color: Colors.textMain },
  modalSub:      { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  modalCloseBtn: { padding: 4 },
  modalScroll:   { padding: 16 },

  section: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: 14,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textMain,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
    paddingBottom: 10,
    marginBottom: 2,
  },

  // Current image preview
  currentImageWrap: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    height: 180,
    backgroundColor: Colors.heroBg,
  },
  currentImage: { width: '100%', height: '100%' },
  currentImageFallback: { alignItems: 'center', justifyContent: 'center', gap: 6 },
  noImageText:  { fontSize: 12, color: Colors.textSecondary },
  newBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  newBadgeText: { color: Colors.white, fontSize: 11, fontWeight: '700' },

  // Mode tabs
  modeRow: { flexDirection: 'row', gap: 8 },
  modeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  modeBtnActive:     { backgroundColor: Colors.primary },
  modeBtnText:       { fontSize: 11, fontWeight: '700', color: Colors.primary },
  modeBtnTextActive: { color: Colors.white },

  // Upload mode
  uploadBox: { gap: 8 },
  pickerButtons: { gap: 8 },
  galleryBtn: {
    backgroundColor: Colors.heroBg,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
    borderStyle: 'dashed',
    padding: 16,
    alignItems: 'center',
    gap: 4,
  },
  galleryBtnTitle: { fontSize: 13, fontWeight: '700', color: Colors.textMain },
  galleryBtnSub:   { fontSize: 11, color: Colors.textSecondary },
  cameraBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.white,
    borderRadius: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  cameraBtnText: { fontSize: 12, fontWeight: '600', color: Colors.textMain },

  // Uploaded image preview
  uploadedPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.heroBg,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  uploadedThumb: { width: 72, height: 72, borderRadius: 8 },
  uploadedActions: { flex: 1, gap: 8 },
  changeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 6,
  },
  removeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.unavailable,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 6,
  },
  changeBtnText: { fontSize: 12, color: Colors.white, fontWeight: '700' },

  // Presets
  presetsRow: { gap: 10, paddingVertical: 4 },
  presetCard: {
    alignItems: 'center',
    gap: 4,
    padding: 6,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
    backgroundColor: Colors.white,
    width: 80,
  },
  presetCardActive:  { borderColor: Colors.primary, backgroundColor: Colors.heroBg },
  presetImg:         { width: 56, height: 56, borderRadius: 8 },
  presetFallback:    { backgroundColor: Colors.heroBg, alignItems: 'center', justifyContent: 'center' },
  presetLabel:       { fontSize: 10, fontWeight: '600', color: Colors.textSecondary, textAlign: 'center' },
  presetLabelActive: { color: Colors.primary, fontWeight: '700' },

  // URL mode
  urlBox:    { gap: 8 },
  urlHint:   { fontSize: 11, color: Colors.textSecondary },
  urlPreview: { width: '100%', height: 120, borderRadius: 10, marginTop: 4 },

  // Form fields
  field:      { gap: 6 },
  fieldRow:   { flexDirection: 'row', gap: 10 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: Colors.textMain },
  formInput: {
    backgroundColor: Colors.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.textMain,
  },
  textArea: { height: 80, textAlignVertical: 'top' },

  // Category chips
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  chipActive:     { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText:       { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  chipTextActive: { color: Colors.white, fontWeight: '700' },

  // Mini unit chips
  miniChips: { flexDirection: 'row', gap: 6 },
  miniChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  miniChipActive:     { backgroundColor: Colors.primary, borderColor: Colors.primary },
  miniChipText:       { fontSize: 11, fontWeight: '600', color: Colors.textSecondary },
  miniChipTextActive: { color: Colors.white, fontWeight: '700' },

  // Status chips
  statusChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  statusChipAvailable:   { backgroundColor: Colors.available,   borderColor: Colors.available },
  statusChipUnavailable: { backgroundColor: Colors.unavailable, borderColor: Colors.unavailable },
  statusChipText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },

  // Save button
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderRadius: 12,
    marginTop: 4,
    elevation: 3,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: Colors.white, fontSize: 15, fontWeight: '800' },
});
