import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
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
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { useCart } from '@/context/CartContext';
import { useProducts } from '@/context/ProductContext';
import { getBlogPosts, changePassword as apiChangePassword } from '@/services/api';
import { useLanguage } from '@/context/LanguageContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const LOGO = require('@/assets/images/Ganaheza LOGO.png');

// ÔöÇÔöÇÔöÇ Preset Images for Products ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ
const IMAGE_PRESETS = [
  { key: 'none', label: 'Default Icon', image: null },
  { key: 'avocado', label: 'Avocado', image: require('@/assets/images/avocado.jpg') },
  { key: 'beans', label: 'Beans', image: require('@/assets/images/beans.jpg') },
  { key: 'habanero', label: 'Habanero', image: require('@/assets/images/habanero.jpg') },
  { key: 'tomatoes', label: 'Tomatoes', image: require('@/assets/images/tomatoes.jpg') },
  { key: 'mangoes', label: 'Mangoes', image: require('@/assets/images/mangoes.jpg') },
  { key: 'coffee', label: 'Coffee', image: require('@/assets/images/coffee.jpg') },
  { key: 'maize', label: 'Maize', image: require('@/assets/images/maize.jpg') },
  { key: 'passion', label: 'Passion Fruit', image: require('@/assets/images/passion-fruit.jpg') },
  { key: 'macadamia', label: 'Macadamia', image: require('@/assets/images/macadamia.jpg') },
  { key: 'teja', label: 'Teja Chilli', image: require('@/assets/images/teja.jpg') },
];

const CATEGORIES = [
  'Vegetables',
  'Fruits',
  'Cereals',
  'Nuts',
  'Cash Crops',
  'Chillies',
  'Roots & Tubers',
];

const TABS = ['Overview', 'Products', 'Orders', 'Blog'];

export default function DashboardScreen() {
  const router = useRouter();
  const { orders, updateOrderStatus, deleteOrder } = useCart();
  const { products, addProduct, deleteProduct } = useProducts();
  const { t } = useLanguage();
  
  const [activeTab, setActiveTab] = useState('Overview');
  const [posts, setPosts] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState('All');

  // Selected Order for Details Modal
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Change Password Modal State
  const [showChangePass, setShowChangePass] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPassDash, setNewPassDash] = useState('');
  const [confirmPassDash, setConfirmPassDash] = useState('');
  const [changePassLoading, setChangePassLoading] = useState(false);
  
  // Add Product Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [imageUploadMode, setImageUploadMode] = useState('upload'); // 'upload' | 'preset' | 'url'
  const [form, setForm] = useState({
    name: '',
    category: 'Vegetables',
    price: '',
    currency: 'RWF',
    priceUnit: 'Kg',
    quantity: '',
    unit: 'Kg',
    period: 'Week',
    location: 'Rwanda',
    description: '',
    status: 'available',
    selectedImageKey: 'none',
    uploadedImageUri: null,
    customImageUrl: '',
  });

  useEffect(() => {
    getBlogPosts().then(setPosts);
  }, []);

  async function pickImageFromGallery() {
    try {
      const ImagePicker = require('expo-image-picker');
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0 && result.assets[0].uri) {
        const uri = result.assets[0].uri;
        setForm((prev) => ({
          ...prev,
          uploadedImageUri: uri,
          selectedImageKey: 'custom',
          customImageUrl: '',
        }));
      }
    } catch (err) {
      console.warn('Gallery pick error:', err);
      Alert.alert(
        'Upload Photo',
        'Could not access gallery directly: ' + (err.message || 'Please check device permissions or use Presets/URL.')
      );
    }
  }

  async function takePhotoWithCamera() {
    try {
      const ImagePicker = require('expo-image-picker');
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Permission Needed',
          'Please allow camera permission in phone settings to take produce photos.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0 && result.assets[0].uri) {
        const uri = result.assets[0].uri;
        setForm((prev) => ({
          ...prev,
          uploadedImageUri: uri,
          selectedImageKey: 'custom',
          customImageUrl: '',
        }));
      }
    } catch (err) {
      Alert.alert('Camera Error', 'Could not open camera: ' + (err.message || 'Please try again.'));
    }
  }

  function confirmSignOut() {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out from the Admin Dashboard?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: () => router.replace('/(tabs)') },
      ]
    );
  }

  function openChangePassModal() {
    setCurrentPass('');
    setNewPassDash('');
    setConfirmPassDash('');
    setShowChangePass(true);
  }

  function closeChangePassModal() {
    setShowChangePass(false);
    setCurrentPass('');
    setNewPassDash('');
    setConfirmPassDash('');
    setChangePassLoading(false);
  }

  async function handleChangePassword() {
    if (newPassDash.length < 6) {
      Alert.alert('Password Too Short', 'New password must be at least 6 characters long.');
      return;
    }
    if (newPassDash !== confirmPassDash) {
      Alert.alert('Passwords Do Not Match', 'The new passwords you entered do not match.');
      return;
    }

    setChangePassLoading(true);
    try {
      await apiChangePassword(currentPass, newPassDash);
      Alert.alert('Password Changed!', 'Your password has been changed successfully.');
      closeChangePassModal();
    } catch (err) {
      Alert.alert('Error', err?.message || 'Something went wrong. Please try again.');
    } finally {
      setChangePassLoading(false);
    }
  }

  function handleAddProductSubmit() {
    if (!form.name.trim()) {
      Alert.alert('Validation Error', 'Please enter a product name.');
      return;
    }

    let productImage = null;
    if (form.uploadedImageUri) {
      productImage = { uri: form.uploadedImageUri };
    } else if (imageUploadMode === 'url' && form.customImageUrl.trim()) {
      productImage = { uri: form.customImageUrl.trim() };
    } else {
      const chosenPreset = IMAGE_PRESETS.find((p) => p.key === form.selectedImageKey);
      if (chosenPreset && chosenPreset.image) {
        productImage = chosenPreset.image;
      }
    }

    const created = addProduct({
      name: form.name,
      category: form.category,
      price: form.price ? Number(form.price) : null,
      currency: form.currency,
      priceUnit: form.priceUnit,
      quantity: form.quantity ? Number(form.quantity) : null,
      unit: form.unit,
      period: form.period,
      location: form.location,
      description: form.description,
      status: form.status,
      image: productImage,
    });

    setIsAddModalOpen(false);
    setForm({
      name: '',
      category: 'Vegetables',
      price: '',
      currency: 'RWF',
      priceUnit: 'Kg',
      quantity: '',
      unit: 'Kg',
      period: 'Week',
      location: 'Rwanda',
      description: '',
      status: 'available',
      selectedImageKey: 'none',
      uploadedImageUri: null,
      customImageUrl: '',
    });

    Alert.alert(
      'Product Published! ­ƒî▒',
      `"${created.name}" is now live and visible across the GANA HEZA marketplace.`
    );
    setActiveTab('Products');
  }

  function handleDeleteProduct(id, name) {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${name}"? It will be removed from the marketplace.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteProduct(id) },
      ]
    );
  }

  function handleCallCustomer(phone) {
    if (!phone) return;
    Linking.openURL(`tel:${phone.replace(/\s+/g, '')}`).catch(() => {
      Alert.alert('Unable to Call', `Could not open phone dialer for ${phone}`);
    });
  }

  function handleWhatsAppCustomer(phone, customerName, productName) {
    if (!phone) return;
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Hello ${customerName}, this is GANA HEZA Company regarding your order for ${productName}.`
    );
    Linking.openURL(`whatsapp://send?phone=${cleanPhone}&text=${message}`).catch(() => {
      Alert.alert('WhatsApp Not Installed', `Please contact ${customerName} directly at ${phone}`);
    });
  }

  function handleEmailCustomer(email, customerName, orderId) {
    if (!email) return;
    const subject = encodeURIComponent(`GANA HEZA Order Confirmation - ${orderId}`);
    const body = encodeURIComponent(`Hello ${customerName},\n\nThank you for ordering with GANA HEZA Company.`);
    Linking.openURL(`mailto:${email}?subject=${subject}&body=${body}`).catch(() => {
      Alert.alert('Unable to Email', `Could not open mail app for ${email}`);
    });
  }

  const filteredProducts = products.filter((p) => {
    if (!productSearch.trim()) return true;
    const q = productSearch.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  });

  const filteredOrders = orders.filter((o) => {
    const matchesFilter = orderFilter === 'All' || o.status === orderFilter;
    if (!matchesFilter) return false;
    if (!orderSearch.trim()) return true;
    const q = orderSearch.toLowerCase();
    return (
      o.customerName?.toLowerCase().includes(q) ||
      o.customerPhone?.toLowerCase().includes(q) ||
      o.product?.name?.toLowerCase().includes(q) ||
      o.id?.toLowerCase().includes(q)
    );
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* ÔöÇÔöÇ Dashboard Top Bar ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ */}
      <View style={styles.topBar}>
        <View style={styles.brandRow}>
          <Image source={LOGO} style={styles.logo} resizeMode="contain" />
          <View>
            <Text style={styles.adminTitle}>Admin Portal</Text>
            <Text style={styles.adminSub}>GANA HEZA Management</Text>
          </View>
        </View>
        <View style={styles.topBarActions}>
          <TouchableOpacity style={styles.changePassBtn} onPress={openChangePassModal} activeOpacity={0.8}>
            <Ionicons name="key-outline" size={18} color={Colors.primary} />
            <Text style={styles.changePassBtnText}>Password</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.signOutBtn} onPress={confirmSignOut} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={18} color={Colors.unavailable} />
          <Text style={styles.signOutText}>Exit</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ÔöÇÔöÇ Horizontal Navigation Tabs ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ */}
      <View style={styles.tabsRow}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabBtnText, activeTab === tab && styles.tabBtnTextActive]}>
              {tab}
            </Text>
            {tab === 'Orders' && orders.length > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{orders.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* ÔöÇÔöÇ Tab Content ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >

        {/* ÔòÉÔòÉ OVERVIEW TAB ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ */}
        {activeTab === 'Overview' && (
          <View style={styles.tabContent}>

            {/* Quick stats banner */}
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{products.length}</Text>
                <Text style={styles.statLabel}>Products Live</Text>
              </View>
              <View style={[styles.statBox, styles.statBoxBorder]}>
                <Text style={[styles.statNumber, { color: '#F59E0B' }]}>{orders.length}</Text>
                <Text style={styles.statLabel}>Customer Orders</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statNumber, { color: '#10B981' }]}>
                  {orders.filter((o) => o.status === 'Delivered').length}
                </Text>
                <Text style={styles.statLabel}>Delivered</Text>
              </View>
            </View>

            {/* Quick action cards */}
            <Text style={styles.sectionLabel}>Admin Actions</Text>
            <View style={styles.actionGrid}>
              {[
                { icon: 'add-circle-outline', label: 'Add New\nProduct', color: Colors.primary, action: () => setIsAddModalOpen(true), highlight: true },
                { icon: 'leaf-outline',       label: 'Manage\nProducts', color: '#10B981',        tab: 'Products' },
                { icon: 'cart-outline',       label: 'Customer\nOrders',  color: '#F59E0B',        tab: 'Orders' },
                { icon: 'newspaper-outline',  label: 'Farming\nBlog',    color: '#3B82F6',        tab: 'Blog' },
              ].map((item) => (
                <TouchableOpacity
                  key={item.label}
                  style={[styles.actionCard, item.highlight && styles.actionCardHighlight]}
                  onPress={() => item.action ? item.action() : setActiveTab(item.tab)}
                  activeOpacity={0.85}
                >
                  <View style={[styles.actionIconWrap, { backgroundColor: item.color + '18' }]}>
                    <Ionicons name={item.icon} size={26} color={item.color} />
                  </View>
                  <Text style={styles.actionLabel}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Recent Orders Preview */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionLabel}>Recent Customer Orders</Text>
              <TouchableOpacity onPress={() => setActiveTab('Orders')}>
                <Text style={styles.addInlineText}>View All ({orders.length})</Text>
              </TouchableOpacity>
            </View>

            {orders.slice(0, 3).map((ord) => (
              <TouchableOpacity
                key={ord.id}
                style={styles.recentOrderCard}
                onPress={() => setSelectedOrder(ord)}
                activeOpacity={0.85}
              >
                <View style={styles.recentOrderTop}>
                  <View>
                    <Text style={styles.recentOrderCustomer}>{ord.customerName}</Text>
                    <Text style={styles.recentOrderPhone}>{ord.customerPhone}</Text>
                  </View>
                  <View style={[styles.statusBadgeSmall, getStatusBadgeStyle(ord.status)]}>
                    <Text style={styles.statusBadgeText}>{ord.status}</Text>
                  </View>
                </View>

                <View style={styles.recentOrderDetails}>
                  <Text style={styles.recentOrderProduct}>
                    ­ƒî▒ {ord.product?.name} · <Text style={styles.qtyHighlight}>{ord.quantity} {ord.unit}</Text>
                  </Text>
                  <Text style={styles.recentOrderDate}>­ƒôà Ordered: {ord.orderDate}</Text>
                </View>
              </TouchableOpacity>
            ))}

            {/* Recent products preview */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionLabel}>Latest Products</Text>
              <TouchableOpacity onPress={() => setIsAddModalOpen(true)}>
                <Text style={styles.addInlineText}>+ Add Product</Text>
              </TouchableOpacity>
            </View>

            {products.slice(0, 3).map((p) => (
              <View key={p.id} style={styles.recentRow}>
                <View style={styles.recentImgWrap}>
                  {p.image ? (
                    <Image source={p.image} style={styles.recentImg} resizeMode="cover" />
                  ) : (
                    <View style={[styles.recentImg, { backgroundColor: Colors.heroBg, alignItems: 'center', justifyContent: 'center' }]}>
                      <Ionicons name="leaf-outline" size={18} color={Colors.primaryLight} />
                    </View>
                  )}
                </View>
                <View style={styles.recentInfo}>
                  <Text style={styles.recentName}>{p.name}</Text>
                  <Text style={styles.recentCode}>{p.code} ┬À {p.category}</Text>
                </View>
                <View style={styles.recentRight}>
                  <Text style={[styles.recentPrice, !p.price && styles.noPrice]}>
                    {p.price ? `${p.price.toLocaleString()} RWF` : 'TBD'}
                  </Text>
                  <TouchableOpacity
                    onPress={() => router.push({ pathname: '/product-details', params: { id: p.id, fromDashboard: '1' } })}
                    style={styles.viewLinkBtn}
                  >
                    <Text style={styles.viewLinkText}>View →</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ÔòÉÔòÉ PRODUCTS TAB ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ */}
        {activeTab === 'Products' && (
          <View style={styles.tabContent}>
            {/* Header + Add Product Button */}
            <View style={styles.productsTopBar}>
              <View>
                <Text style={styles.productsMainTitle}>Inventory Management</Text>
                <Text style={styles.productsSubTitle}>{products.length} products published</Text>
              </View>
              <TouchableOpacity
                style={styles.addNewBtn}
                onPress={() => setIsAddModalOpen(true)}
                activeOpacity={0.85}
              >
                <Ionicons name="add" size={18} color={Colors.white} />
                <Text style={styles.addNewBtnText}>Add Product</Text>
              </TouchableOpacity>
            </View>

            {/* Search filter in dashboard */}
            <View style={styles.searchBox}>
              <Ionicons name="search-outline" size={16} color={Colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                value={productSearch}
                onChangeText={setProductSearch}
                placeholder="Filter by name, code or category..."
                placeholderTextColor={Colors.textSecondary}
              />
              {productSearch.length > 0 && (
                <TouchableOpacity onPress={() => setProductSearch('')}>
                  <Ionicons name="close-circle" size={16} color={Colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            {filteredProducts.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="leaf-outline" size={48} color={Colors.cardBorder} />
                <Text style={styles.emptyTitle}>No products match your search</Text>
                <TouchableOpacity
                  style={styles.addNewBtn}
                  onPress={() => setIsAddModalOpen(true)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.addNewBtnText}>+ Add New Product</Text>
                </TouchableOpacity>
              </View>
            ) : (
              filteredProducts.map((p) => (
                <View key={p.id} style={styles.productRow}>
                  <View style={styles.productImgWrap}>
                    {p.image ? (
                      <Image source={p.image} style={styles.productImg} resizeMode="cover" />
                    ) : (
                      <View style={[styles.productImg, { backgroundColor: Colors.heroBg, alignItems: 'center', justifyContent: 'center' }]}>
                        <Ionicons name="leaf-outline" size={20} color={Colors.primaryLight} />
                      </View>
                    )}
                  </View>
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{p.name}</Text>
                    <Text style={styles.productCode}>{p.code}</Text>
                    <View style={styles.badgeRow}>
                      <Text style={styles.productCat}>{p.category}</Text>
                      {p.quantity ? (
                        <Text style={styles.qtyBadge}>{p.quantity} {p.unit}/{p.period}</Text>
                      ) : null}
                    </View>
                  </View>
                  <View style={styles.productRight}>
                    <Text style={[styles.productPrice, !p.price && styles.noPrice]}>
                      {p.price ? `${p.price.toLocaleString()} ${p.currency || 'RWF'}` : 'TBD'}
                    </Text>
                    <View style={styles.actionButtonsRow}>
                      <TouchableOpacity
                        style={styles.viewBtnSmall}
                        onPress={() => router.push({ pathname: '/product-details', params: { id: p.id, fromDashboard: '1' } })}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="eye-outline" size={14} color={Colors.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteBtnSmall}
                        onPress={() => handleDeleteProduct(p.id, p.name)}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="trash-outline" size={14} color={Colors.unavailable} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* ÔòÉÔòÉ ORDERS TAB ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ */}
        {activeTab === 'Orders' && (
          <View style={styles.tabContent}>
            <View style={styles.productsTopBar}>
              <View>
                <Text style={styles.productsMainTitle}>Customer Orders</Text>
                <Text style={styles.productsSubTitle}>{orders.length} orders recorded</Text>
              </View>
            </View>

            {/* Filter Chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.orderFiltersRow}>
              {['All', 'Pending', 'Confirmed', 'Delivered'].map((st) => (
                <TouchableOpacity
                  key={st}
                  style={[styles.orderFilterChip, orderFilter === st && styles.orderFilterChipActive]}
                  onPress={() => setOrderFilter(st)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.orderFilterText, orderFilter === st && styles.orderFilterTextActive]}>
                    {st}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Search */}
            <View style={styles.searchBox}>
              <Ionicons name="search-outline" size={16} color={Colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                value={orderSearch}
                onChangeText={setOrderSearch}
                placeholder="Search by customer name, phone or product..."
                placeholderTextColor={Colors.textSecondary}
              />
              {orderSearch.length > 0 && (
                <TouchableOpacity onPress={() => setOrderSearch('')}>
                  <Ionicons name="close-circle" size={16} color={Colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            {filteredOrders.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="cart-outline" size={56} color={Colors.cardBorder} />
                <Text style={styles.emptyTitle}>No orders found</Text>
                <Text style={styles.emptySubtitle}>Customer orders will appear here in real time.</Text>
              </View>
            ) : (
              filteredOrders.map((ord) => (
                <TouchableOpacity
                  key={ord.id}
                  style={styles.orderCard}
                  onPress={() => setSelectedOrder(ord)}
                  activeOpacity={0.88}
                >
                  {/* Order header with ID, Customer Name & Status */}
                  <View style={styles.orderCardHeader}>
                    <View style={styles.orderCustomerBlock}>
                      <Text style={styles.orderCustomerId}>{ord.id}</Text>
                      <Text style={styles.orderCustomerName}>­ƒæñ {ord.customerName}</Text>
                    </View>
                    <View style={[styles.statusBadge, getStatusBadgeStyle(ord.status)]}>
                      <Text style={styles.statusBadgeText}>{ord.status}</Text>
                    </View>
                  </View>

                  {/* Customer Contact & Ordered Product */}
                  <View style={styles.orderCardBody}>
                    <View style={styles.orderProductRow}>
                      <View style={styles.orderProductImgBox}>
                        {ord.product?.image ? (
                          <Image source={ord.product.image} style={styles.orderProductImg} resizeMode="cover" />
                        ) : (
                          <View style={[styles.orderProductImg, { backgroundColor: Colors.heroBg, alignItems: 'center', justifyContent: 'center' }]}>
                            <Ionicons name="leaf-outline" size={18} color={Colors.primaryLight} />
                          </View>
                        )}
                      </View>
                      <View style={styles.orderProductInfo}>
                        <Text style={styles.orderProductName}>{ord.product?.name}</Text>
                        <Text style={styles.orderQuantityText}>
                          Quantity: <Text style={styles.orderQuantityBold}>{ord.quantity} {ord.unit}</Text>
                        </Text>
                        <Text style={styles.orderContactText}>­ƒô× {ord.customerPhone}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Order Dates & Tap to view */}
                  <View style={styles.orderCardFooter}>
                    <View>
                      <Text style={styles.orderDateText}>Ordered: {ord.orderDate}</Text>
                      <Text style={styles.orderDeliveryDateText}>Delivery: {ord.deliveryDate}</Text>
                    </View>
                    <View style={styles.orderTapHint}>
                      <Text style={styles.orderTapHintText}>Details</Text>
                      <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {/* ÔòÉÔòÉ BLOG TAB ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ */}
        {activeTab === 'Blog' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionLabel}>{posts.length} Articles</Text>
            {posts.map((post) => (
              <TouchableOpacity
                key={post.id}
                style={styles.blogCard}
                onPress={() => router.push({ pathname: '/blog-details', params: { id: post.id } })}
                activeOpacity={0.85}
              >
                <View style={styles.blogStrip} />
                <View style={styles.blogBody}>
                  <View style={styles.blogMeta}>
                    <View style={styles.blogCatTag}>
                      <Text style={styles.blogCatText}>{post.category}</Text>
                    </View>
                    <Text style={styles.blogDate}>{post.date}</Text>
                  </View>
                  <Text style={styles.blogTitle} numberOfLines={2}>{post.title}</Text>
                  <Text style={styles.blogSummary} numberOfLines={2}>{post.summary}</Text>
                  <Text style={styles.readMore}>Read Article</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ */}
      {/* ÔöÇÔöÇ MODAL: ORDER DETAILS (WHEN ADMIN CLICKS ON ANY ORDER) ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ */}
      {/* ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ */}
      <Modal
        visible={!!selectedOrder}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedOrder(null)}
      >
        {selectedOrder && (
          <SafeAreaView style={styles.modalSafe}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalHeaderTitle}>Order Details</Text>
                <Text style={styles.modalHeaderSub}>{selectedOrder.id} ┬À Placed on {selectedOrder.orderDate}</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setSelectedOrder(null)}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={22} color={Colors.textMain} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* Customer Contact Card */}
              <View style={styles.detailCard}>
                <Text style={styles.detailCardHeader}>Customer Information</Text>
                <View style={styles.detailItem}>
                  <Ionicons name="person-outline" size={18} color={Colors.primary} />
                  <Text style={styles.detailItemValue}>{selectedOrder.customerName}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="call-outline" size={18} color={Colors.primary} />
                  <Text style={styles.detailItemValue}>{selectedOrder.customerPhone}</Text>
                </View>
                {selectedOrder.customerEmail ? (
                  <View style={styles.detailItem}>
                    <Ionicons name="mail-outline" size={18} color={Colors.primary} />
                    <Text style={styles.detailItemValue}>{selectedOrder.customerEmail}</Text>
                  </View>
                ) : null}

                {/* Quick Contact Buttons */}
                <View style={styles.contactButtonsRow}>
                  <TouchableOpacity
                    style={styles.quickCallBtn}
                    onPress={() => handleCallCustomer(selectedOrder.customerPhone)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="call" size={16} color={Colors.white} />
                    <Text style={styles.quickCallText}>Call</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.quickWhatsappBtn}
                    onPress={() => handleWhatsAppCustomer(selectedOrder.customerPhone, selectedOrder.customerName, selectedOrder.product?.name)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="logo-whatsapp" size={16} color={Colors.white} />
                    <Text style={styles.quickCallText}>WhatsApp</Text>
                  </TouchableOpacity>

                  {selectedOrder.customerEmail ? (
                    <TouchableOpacity
                      style={styles.quickEmailBtn}
                      onPress={() => handleEmailCustomer(selectedOrder.customerEmail, selectedOrder.customerName, selectedOrder.id)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="mail" size={16} color={Colors.white} />
                      <Text style={styles.quickCallText}>Email</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>

              {/* Product & Quantity Card */}
              <View style={styles.detailCard}>
                <Text style={styles.detailCardHeader}>Ordered Product & Amount</Text>
                {/* Tapping the product row opens the full product details screen */}
                <TouchableOpacity
                  style={styles.detailProductRow}
                  activeOpacity={0.8}
                  onPress={() => {
                    if (!selectedOrder.product?.id) return;
                    setSelectedOrder(null);
                    router.push({
                      pathname: '/product-details',
                      params: { id: selectedOrder.product.id, fromDashboard: '1' },
                    });
                  }}
                >
                  <View style={styles.detailImgWrap}>
                    {selectedOrder.product?.image ? (
                      <Image source={selectedOrder.product.image} style={styles.detailImg} resizeMode="cover" />
                    ) : (
                      <View style={[styles.detailImg, { backgroundColor: Colors.heroBg, alignItems: 'center', justifyContent: 'center' }]}>
                        <Ionicons name="leaf-outline" size={24} color={Colors.primaryLight} />
                      </View>
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.detailProductName}>{selectedOrder.product?.name}</Text>
                    <Text style={styles.detailProductCode}>{selectedOrder.product?.code} · {selectedOrder.product?.category}</Text>
                    <Text style={styles.detailProductLocation}>📍 {selectedOrder.product?.location || 'Rwanda'}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={Colors.primary} style={{ marginLeft: 4 }} />
                </TouchableOpacity>

                {/* Amount ordered in Tons or Kg */}
                <View style={styles.orderAmountBanner}>
                  <View>
                    <Text style={styles.orderAmountLabel}>Total Ordered Quantity</Text>
                    <Text style={styles.orderAmountValue}>
                      {selectedOrder.quantity} {selectedOrder.unit}
                    </Text>
                  </View>
                  {selectedOrder.totalPrice ? (
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.orderAmountLabel}>Estimated Value</Text>
                      <Text style={styles.orderPriceValue}>
                        {selectedOrder.totalPrice.toLocaleString()} {selectedOrder.currency}
                      </Text>
                    </View>
                  ) : null}
                </View>

                {/* Dates */}
                <View style={styles.datesRow}>
                  <View style={styles.dateCol}>
                    <Text style={styles.dateColLabel}>Order Placed Date</Text>
                    <Text style={styles.dateColVal}>{selectedOrder.orderDate}</Text>
                  </View>
                  <View style={styles.dateCol}>
                    <Text style={styles.dateColLabel}>Preferred Delivery Date</Text>
                    <Text style={styles.dateColVal}>{selectedOrder.deliveryDate}</Text>
                  </View>
                </View>

                {/* Notes */}
                {selectedOrder.notes ? (
                  <View style={styles.orderNotesBox}>
                    <Text style={styles.orderNotesLabel}>Customer Notes / Delivery Address:</Text>
                    <Text style={styles.orderNotesText}>{selectedOrder.notes}</Text>
                  </View>
                ) : null}
              </View>

              {/* Status Update Card — Professional Stepper */}
              <View style={styles.detailCard}>
                <View style={styles.statusHeaderRow}>
                  <Text style={styles.detailCardHeader}>Order Status</Text>
                  <View style={[styles.currentStatusPill, getStatusBadgeStyle(selectedOrder.status)]}>
                    <Text style={styles.currentStatusPillText}>
                      {selectedOrder.status === 'Pending' ? '⏳' : selectedOrder.status === 'Confirmed' ? '✅' : '🚚'} {selectedOrder.status}
                    </Text>
                  </View>
                </View>

                {/* Status Timeline / Stepper */}
                <View style={styles.stepperWrap}>
                  {[
                    { key: 'Pending',   icon: 'time-outline',             label: 'Pending',   desc: 'Order received' },
                    { key: 'Confirmed', icon: 'checkmark-circle-outline', label: 'Confirmed', desc: 'Order confirmed' },
                    { key: 'Delivered', icon: 'cube-outline',             label: 'Delivered', desc: 'Order delivered' },
                  ].map((step, idx, arr) => {
                    const currentIndex = arr.findIndex(s => s.key === selectedOrder.status);
                    const isDone    = idx < currentIndex;
                    const isCurrent = idx === currentIndex;

                    return (
                      <View key={step.key} style={styles.stepRow}>
                        {idx > 0 && (
                          <View style={[
                            styles.stepConnector,
                            (isDone || isCurrent) && { backgroundColor: Colors.primary },
                          ]} />
                        )}
                        <TouchableOpacity
                          style={[
                            styles.stepCircle,
                            isDone    && { backgroundColor: Colors.available },
                            isCurrent && { backgroundColor: Colors.primary, borderColor: Colors.primary },
                          ]}
                          onPress={() => {
                            const targetStatus = step.key;
                            if (targetStatus === selectedOrder.status) return;
                            Alert.alert(
                              'Update Status',
                              `Change order status to "${step.label}"?`,
                              [
                                { text: 'Cancel', style: 'cancel' },
                                {
                                  text: 'Update',
                                  onPress: async () => {
                                    setSelectedOrder((prev) => ({ ...prev, status: targetStatus }));
                                    try {
                                      await updateOrderStatus(selectedOrder.id, targetStatus);
                                    } catch (err) {
                                      Alert.alert('Update Failed', err?.message || 'Could not update order status.');
                                      setSelectedOrder((prev) => ({ ...prev, status: selectedOrder.status }));
                                    }
                                  },
                                },
                              ]
                            );
                          }}
                          activeOpacity={0.8}
                        >
                          <Ionicons
                            name={isDone ? 'checkmark' : step.icon}
                            size={18}
                            color={isDone || isCurrent ? Colors.white : Colors.textSecondary}
                          />
                        </TouchableOpacity>
                        <View style={styles.stepLabelWrap}>
                          <Text style={[styles.stepLabel, (isDone || isCurrent) && { color: Colors.textMain, fontWeight: '700' }]}>
                            {step.label}
                          </Text>
                          <Text style={styles.stepDesc}>{step.desc}</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>

                {/* Quick advance button */}
                {selectedOrder.status !== 'Delivered' && (
                  <TouchableOpacity
                    style={styles.advanceStatusBtn}
                    onPress={() => {
                      const nextStatus = selectedOrder.status === 'Pending' ? 'Confirmed' : 'Delivered';
                      Alert.alert(
                        'Update Status',
                        `Change order status to "${nextStatus}"?`,
                        [
                          { text: 'Cancel', style: 'cancel' },
                          {
                            text: 'Update',
                            onPress: async () => {
                              setSelectedOrder((prev) => ({ ...prev, status: nextStatus }));
                              try {
                                await updateOrderStatus(selectedOrder.id, nextStatus);
                              } catch (err) {
                                Alert.alert('Update Failed', err?.message || 'Could not update order status.');
                                setSelectedOrder((prev) => ({ ...prev, status: selectedOrder.status }));
                              }
                            },
                          },
                        ]
                      );
                    }}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="arrow-forward-circle-outline" size={16} color={Colors.white} />
                    <Text style={styles.advanceStatusBtnText}>
                      {selectedOrder.status === 'Pending' ? 'Confirm Order' : 'Mark as Delivered'}
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Delete Order Button */}
                <TouchableOpacity
                  style={styles.deleteOrderBtn}
                  onPress={() => {
                    Alert.alert('Delete Order', `Delete order ${selectedOrder.id}?`, [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: async () => {
                          try {
                            await deleteOrder(selectedOrder.id);
                            setSelectedOrder(null);
                          } catch (err) {
                            Alert.alert('Delete Failed', err?.message || 'Could not delete the order.');
                          }
                        },
                      },
                    ]);
                  }}
                >
                  <Ionicons name="trash-outline" size={16} color={Colors.unavailable} />
                  <Text style={styles.deleteOrderText}>Delete Order Record</Text>
                </TouchableOpacity>
              </View>

              <View style={{ height: 40 }} />
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>

      {/* ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ */}
      {/* ÔöÇÔöÇ MODAL: ADD NEW PRODUCT (WITH PHOTO UPLOAD BUTTON) ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ */}
      {/* ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ */}
      <Modal
        visible={isAddModalOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsAddModalOpen(false)}
      >
        <SafeAreaView style={styles.modalSafe}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalHeaderTitle}>Add New Product</Text>
                <Text style={styles.modalHeaderSub}>Publish fresh produce to GANA HEZA</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setIsAddModalOpen(false)}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={22} color={Colors.textMain} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalContent}
              contentContainerStyle={{ paddingBottom: 40 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Product Name */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Product Name *</Text>
                <TextInput
                  style={styles.formInput}
                  value={form.name}
                  onChangeText={(v) => setForm((prev) => ({ ...prev, name: v }))}
                  placeholder="e.g. Fresh Ginger, Hass Avocado, Irish Potatoes"
                  placeholderTextColor={Colors.textSecondary}
                />
              </View>

              {/* Photo Upload & Presets Section */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Product Photo *</Text>

                {/* Upload Mode Selector */}
                <View style={styles.photoModeRow}>
                  <TouchableOpacity
                    style={[styles.photoModeBtn, imageUploadMode === 'upload' && styles.photoModeBtnActive]}
                    onPress={() => setImageUploadMode('upload')}
                  >
                    <Ionicons
                      name="image-outline"
                      size={15}
                      color={imageUploadMode === 'upload' ? Colors.white : Colors.primary}
                    />
                    <Text style={[styles.photoModeText, imageUploadMode === 'upload' && styles.photoModeTextActive]}>
                      Device Gallery
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.photoModeBtn, imageUploadMode === 'preset' && styles.photoModeBtnActive]}
                    onPress={() => setImageUploadMode('preset')}
                  >
                    <Ionicons
                      name="leaf-outline"
                      size={15}
                      color={imageUploadMode === 'preset' ? Colors.white : Colors.primary}
                    />
                    <Text style={[styles.photoModeText, imageUploadMode === 'preset' && styles.photoModeTextActive]}>
                      Presets
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.photoModeBtn, imageUploadMode === 'url' && styles.photoModeBtnActive]}
                    onPress={() => setImageUploadMode('url')}
                  >
                    <Ionicons
                      name="link-outline"
                      size={15}
                      color={imageUploadMode === 'url' ? Colors.white : Colors.primary}
                    />
                    <Text style={[styles.photoModeText, imageUploadMode === 'url' && styles.photoModeTextActive]}>
                      Image URL
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Mode 1: Device Gallery & Camera Picker */}
                {imageUploadMode === 'upload' && (
                  <View style={styles.uploadContainer}>
                    {form.uploadedImageUri ? (
                      <View style={styles.uploadedImagePreviewContainer}>
                        <Image
                          source={{ uri: form.uploadedImageUri }}
                          style={styles.uploadedFullImg}
                          resizeMode="cover"
                        />
                        <View style={styles.imageActionOverlay}>
                          <TouchableOpacity
                            style={styles.changeImageBtn}
                            onPress={pickImageFromGallery}
                            activeOpacity={0.8}
                          >
                            <Ionicons name="images-outline" size={14} color={Colors.white} />
                            <Text style={styles.changeImageText}>Change</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.removeImageBtn}
                            onPress={() => setForm((prev) => ({ ...prev, uploadedImageUri: null }))}
                            activeOpacity={0.8}
                          >
                            <Ionicons name="trash-outline" size={14} color={Colors.white} />
                            <Text style={styles.changeImageText}>Remove</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <View style={styles.uploadButtonsBox}>
                        <TouchableOpacity
                          style={styles.galleryPickBtn}
                          onPress={pickImageFromGallery}
                          activeOpacity={0.85}
                        >
                          <View style={styles.galleryIconWrap}>
                            <Ionicons name="cloud-upload" size={28} color={Colors.primary} />
                          </View>
                          <Text style={styles.galleryBtnTitle}>Upload from Phone Gallery</Text>
                          <Text style={styles.galleryBtnSub}>Select JPG, PNG or WEBP photo</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.cameraPickBtn}
                          onPress={takePhotoWithCamera}
                          activeOpacity={0.85}
                        >
                          <Ionicons name="camera-outline" size={18} color={Colors.primary} />
                          <Text style={styles.cameraPickText}>Take Photo with Camera</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}

                {/* Mode 2: Preset Picker */}
                {imageUploadMode === 'preset' && (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.imagePresetsRow}
                  >
                    {IMAGE_PRESETS.map((preset) => {
                      const isSelected = form.selectedImageKey === preset.key && !form.uploadedImageUri;
                      return (
                        <TouchableOpacity
                          key={preset.key}
                          style={[styles.presetCard, isSelected && styles.presetCardActive]}
                          onPress={() =>
                            setForm((prev) => ({
                              ...prev,
                              selectedImageKey: preset.key,
                              uploadedImageUri: null,
                              customImageUrl: '',
                            }))
                          }
                          activeOpacity={0.8}
                        >
                          {preset.image ? (
                            <Image source={preset.image} style={styles.presetImg} resizeMode="cover" />
                          ) : (
                            <View style={[styles.presetImg, styles.presetFallback]}>
                              <Ionicons name="leaf-outline" size={24} color={Colors.primaryLight} />
                            </View>
                          )}
                          <Text
                            style={[styles.presetLabel, isSelected && styles.presetLabelActive]}
                            numberOfLines={1}
                          >
                            {preset.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}

                {/* Mode 3: Custom URL Upload Input */}
                {imageUploadMode === 'url' && (
                  <View style={styles.customUploadBox}>
                    <Text style={styles.customUploadHint}>
                      Enter an image web address (URL) or photo link:
                    </Text>
                    <TextInput
                      style={styles.formInput}
                      value={form.customImageUrl}
                      onChangeText={(v) =>
                        setForm((prev) => ({
                          ...prev,
                          customImageUrl: v,
                          uploadedImageUri: null,
                        }))
                      }
                      placeholder="https://example.com/photo.jpg"
                      placeholderTextColor={Colors.textSecondary}
                      autoCapitalize="none"
                      keyboardType="url"
                    />
                    {form.customImageUrl.trim().length > 0 && (
                      <View style={styles.imagePreviewBox}>
                        <Text style={styles.previewLabel}>Photo Preview:</Text>
                        <Image
                          source={{ uri: form.customImageUrl.trim() }}
                          style={styles.uploadedPreviewImg}
                          resizeMode="cover"
                        />
                      </View>
                    )}
                  </View>
                )}
              </View>

              {/* Category selector */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Category *</Text>
                <View style={styles.chipsWrap}>
                  {CATEGORIES.map((cat) => {
                    const isSelected = form.category === cat;
                    return (
                      <TouchableOpacity
                        key={cat}
                        style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
                        onPress={() => setForm((prev) => ({ ...prev, category: cat }))}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.categoryChipText, isSelected && styles.categoryChipTextActive]}>
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Price Row */}
              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 2 }]}>
                  <Text style={styles.formLabel}>Price (RWF)</Text>
                  <TextInput
                    style={styles.formInput}
                    value={form.price}
                    onChangeText={(v) => setForm((prev) => ({ ...prev, price: v }))}
                    placeholder="e.g. 1500"
                    placeholderTextColor={Colors.textSecondary}
                    keyboardType="numeric"
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>Per Unit</Text>
                  <TextInput
                    style={styles.formInput}
                    value={form.priceUnit}
                    onChangeText={(v) => setForm((prev) => ({ ...prev, priceUnit: v }))}
                    placeholder="Kg"
                    placeholderTextColor={Colors.textSecondary}
                  />
                </View>
              </View>

              {/* Quantity & Unit Row */}
              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>Available Qty</Text>
                  <TextInput
                    style={styles.formInput}
                    value={form.quantity}
                    onChangeText={(v) => setForm((prev) => ({ ...prev, quantity: v }))}
                    placeholder="e.g. 500"
                    placeholderTextColor={Colors.textSecondary}
                    keyboardType="numeric"
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>Unit (T / Kg)</Text>
                  <View style={styles.miniChipsRow}>
                    {['Kg', 'T', 'Tonnes', 'Bags'].map((u) => (
                      <TouchableOpacity
                        key={u}
                        style={[styles.miniChip, form.unit === u && styles.miniChipActive]}
                        onPress={() => setForm((prev) => ({ ...prev, unit: u }))}
                      >
                        <Text style={[styles.miniChipText, form.unit === u && styles.miniChipTextActive]}>{u}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              {/* Location */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Origin / Province</Text>
                <TextInput
                  style={styles.formInput}
                  value={form.location}
                  onChangeText={(v) => setForm((prev) => ({ ...prev, location: v }))}
                  placeholder="e.g. Eastern Province, Rwanda"
                  placeholderTextColor={Colors.textSecondary}
                />
              </View>

              {/* Description */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Description</Text>
                <TextInput
                  style={[styles.formInput, styles.textArea]}
                  value={form.description}
                  onChangeText={(v) => setForm((prev) => ({ ...prev, description: v }))}
                  placeholder="Describe quality, harvest dates, and packaging..."
                  placeholderTextColor={Colors.textSecondary}
                  multiline
                  numberOfLines={3}
                />
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={styles.publishBtn}
                onPress={handleAddProductSubmit}
                activeOpacity={0.85}
              >
                <Ionicons name="checkmark-circle-outline" size={20} color={Colors.white} />
                <Text style={styles.publishBtnText}>Publish to App</Text>
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        visible={showChangePass}
        transparent
        animationType="fade"
        onRequestClose={closeChangePassModal}
      >
        <View style={styles.cpOverlay}>
          <View style={styles.cpCard}>
            <View style={styles.cpHeader}>
              <Text style={styles.cpTitle}>Change Password</Text>
              <TouchableOpacity onPress={closeChangePassModal} activeOpacity={0.7}>
                <Ionicons name="close" size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.cpDesc}>Update your account password</Text>

            {/* Current Password */}
            <Text style={styles.cpLabel}>Current Password</Text>
            <View style={styles.cpInputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color={Colors.textSecondary} />
              <TextInput
                style={styles.cpInput}
                value={currentPass}
                onChangeText={setCurrentPass}
                placeholder="Enter current password"
                placeholderTextColor={Colors.textSecondary}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* New Password */}
            <Text style={styles.cpLabel}>New Password</Text>
            <View style={styles.cpInputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color={Colors.textSecondary} />
              <TextInput
                style={styles.cpInput}
                value={newPassDash}
                onChangeText={setNewPassDash}
                placeholder="Enter new password"
                placeholderTextColor={Colors.textSecondary}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Confirm New Password */}
            <Text style={styles.cpLabel}>Confirm New Password</Text>
            <View style={styles.cpInputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color={Colors.textSecondary} />
              <TextInput
                style={styles.cpInput}
                value={confirmPassDash}
                onChangeText={setConfirmPassDash}
                placeholder="Re-enter new password"
                placeholderTextColor={Colors.textSecondary}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <TouchableOpacity
              style={[styles.cpBtn, changePassLoading && { opacity: 0.7 }]}
              onPress={handleChangePassword}
              disabled={changePassLoading}
              activeOpacity={0.85}
            >
              <Text style={styles.cpBtnText}>
                {changePassLoading ? 'Changing...' : 'Change Password'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ÔöÇÔöÇÔöÇ Status Badge Colors ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ
function getStatusBadgeStyle(status) {
  switch (status) {
    case 'Confirmed':
      return { backgroundColor: '#10B981' };
    case 'Delivered':
      return { backgroundColor: '#3B82F6' };
    default:
      return { backgroundColor: '#F59E0B' };
  }
}

// ÔöÇÔöÇÔöÇ Styles ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: { width: 34, height: 34 },
  adminTitle: { fontSize: 16, fontWeight: '800', color: Colors.textMain },
  adminSub: { fontSize: 11, color: Colors.textSecondary },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
  },
  signOutText: { fontSize: 12, fontWeight: '700', color: Colors.unavailable },
  topBarActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  changePassBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#E8F5E9',
  },
  changePassBtnText: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  cpOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cpCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  cpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cpTitle: { fontSize: 20, fontWeight: '700', color: Colors.textMain },
  cpDesc: { fontSize: 13, color: Colors.textSecondary, marginBottom: 16 },
  cpLabel: { fontSize: 13, fontWeight: '600', color: Colors.textMain, marginBottom: 6, marginTop: 12 },
  cpInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  cpInput: { flex: 1, fontSize: 14, color: Colors.textMain, paddingVertical: 0, marginLeft: 8 },
  cpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 20,
  },
  cpBtnText: { color: Colors.white, fontSize: 15, fontWeight: '700' },

  tabsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
    paddingHorizontal: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    flexDirection: 'row',
    gap: 5,
  },
  tabBtnActive: { borderBottomColor: Colors.primary },
  tabBtnText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  tabBtnTextActive: { color: Colors.primary, fontWeight: '700' },
  tabBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  tabBadgeText: { color: Colors.white, fontSize: 10, fontWeight: '700' },

  content: { padding: 16, paddingBottom: 60 },
  tabContent: { gap: 16 },

  // Stats
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  statBox: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  statBoxBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: Colors.cardBorder,
  },
  statNumber: { fontSize: 20, fontWeight: '800', color: Colors.primary },
  statLabel: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },

  sectionLabel: { fontSize: 15, fontWeight: '800', color: Colors.textMain },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  addInlineText: { fontSize: 13, fontWeight: '700', color: Colors.primary },

  // Action grid
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actionCard: {
    width: (SCREEN_WIDTH - 42) / 2,
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    alignItems: 'center',
    gap: 8,
    elevation: 1,
  },
  actionCardHighlight: { borderColor: Colors.primary, borderWidth: 1.5 },
  actionIconWrap: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { fontSize: 12, fontWeight: '700', color: Colors.textMain, textAlign: 'center' },

  // Recent Orders in Overview
  recentOrderCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: 6,
  },
  recentOrderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  recentOrderCustomer: { fontSize: 14, fontWeight: '700', color: Colors.textMain },
  recentOrderPhone: { fontSize: 12, color: Colors.textSecondary },
  statusBadgeSmall: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusBadgeText: { color: Colors.white, fontSize: 10, fontWeight: '700' },
  recentOrderDetails: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  recentOrderProduct: { fontSize: 12, color: Colors.textMain },
  qtyHighlight: { fontWeight: '700', color: Colors.primary },
  recentOrderDate: { fontSize: 11, color: Colors.textSecondary },

  // Recent products
  recentRow: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: 10,
  },
  recentImgWrap: { width: 44, height: 44, borderRadius: 8, overflow: 'hidden' },
  recentImg: { width: '100%', height: '100%' },
  recentInfo: { flex: 1 },
  recentName: { fontSize: 13, fontWeight: '700', color: Colors.textMain },
  recentCode: { fontSize: 11, color: Colors.textSecondary },
  recentRight: { alignItems: 'flex-end', gap: 4 },
  recentPrice: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  noPrice: { fontStyle: 'italic', color: Colors.textSecondary },
  viewLinkBtn: { paddingHorizontal: 6, paddingVertical: 2 },
  viewLinkText: { fontSize: 11, fontWeight: '700', color: Colors.primary },

  // Products tab
  productsTopBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  productsMainTitle: { fontSize: 18, fontWeight: '800', color: Colors.textMain },
  productsSubTitle: { fontSize: 12, color: Colors.textSecondary },
  addNewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addNewBtnText: { color: Colors.white, fontWeight: '700', fontSize: 13 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: 8,
    height: 42,
  },
  searchInput: { flex: 1, fontSize: 13, color: Colors.textMain },
  productRow: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: 12,
    elevation: 1,
  },
  productImgWrap: { width: 52, height: 52, borderRadius: 10, overflow: 'hidden' },
  productImg: { width: '100%', height: '100%' },
  productInfo: { flex: 1, gap: 2 },
  productName: { fontSize: 14, fontWeight: '700', color: Colors.textMain },
  productCode: { fontSize: 11, color: Colors.textSecondary },
  badgeRow: { flexDirection: 'row', gap: 6, marginTop: 2 },
  productCat: { fontSize: 10, color: Colors.primary, backgroundColor: Colors.tagBg, paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4, fontWeight: '600' },
  qtyBadge: { fontSize: 10, color: Colors.textSecondary, backgroundColor: Colors.heroBg, paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 },
  productRight: { alignItems: 'flex-end', gap: 6 },
  productPrice: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  actionButtonsRow: { flexDirection: 'row', gap: 6 },
  viewBtnSmall: { padding: 6, backgroundColor: Colors.heroBg, borderRadius: 6 },
  deleteBtnSmall: { padding: 6, backgroundColor: '#FEE2E2', borderRadius: 6 },

  // Orders Tab
  orderFiltersRow: { gap: 8, paddingBottom: 4 },
  orderFilterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  orderFilterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  orderFilterText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  orderFilterTextActive: { color: Colors.white, fontWeight: '700' },

  orderCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  orderCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  orderCustomerBlock: { gap: 2 },
  orderCustomerId: { fontSize: 11, fontWeight: '800', color: Colors.primary },
  orderCustomerName: { fontSize: 15, fontWeight: '700', color: Colors.textMain },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },

  orderCardBody: {
    backgroundColor: Colors.heroBg,
    borderRadius: 10,
    padding: 10,
  },
  orderProductRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  orderProductImgBox: { width: 44, height: 44, borderRadius: 8, overflow: 'hidden' },
  orderProductImg: { width: '100%', height: '100%' },
  orderProductInfo: { flex: 1, gap: 2 },
  orderProductName: { fontSize: 13, fontWeight: '700', color: Colors.textMain },
  orderQuantityText: { fontSize: 12, color: Colors.textSecondary },
  orderQuantityBold: { fontWeight: '800', color: Colors.primary },
  orderContactText: { fontSize: 11, color: Colors.textSecondary },

  orderCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
    paddingTop: 8,
  },
  orderDateText: { fontSize: 10, color: Colors.textSecondary },
  orderDeliveryDateText: { fontSize: 10, color: Colors.primary, fontWeight: '600' },
  orderTapHint: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  orderTapHintText: { fontSize: 12, fontWeight: '700', color: Colors.primary },

  // Order Details Modal
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
  modalHeaderTitle: { fontSize: 18, fontWeight: '800', color: Colors.textMain },
  modalHeaderSub: { fontSize: 12, color: Colors.textSecondary },
  modalCloseBtn: { padding: 4 },
  modalContent: { padding: 16, gap: 14 },

  detailCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: 12,
    marginBottom: 14,
  },
  detailCardHeader: { fontSize: 14, fontWeight: '800', color: Colors.textMain, borderBottomWidth: 1, borderBottomColor: Colors.cardBorder, paddingBottom: 6 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailItemValue: { fontSize: 14, fontWeight: '600', color: Colors.textMain },

  contactButtonsRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  quickCallBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: 8,
  },
  quickWhatsappBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#25D366',
    paddingVertical: 10,
    borderRadius: 8,
  },
  quickEmailBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#3B82F6',
    paddingVertical: 10,
    borderRadius: 8,
  },
  quickCallText: { color: Colors.white, fontWeight: '700', fontSize: 12 },

  detailProductRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 10, backgroundColor: Colors.heroBg, padding: 10, borderWidth: 1, borderColor: Colors.cardBorder },
  detailImgWrap: { width: 64, height: 64, borderRadius: 12, overflow: 'hidden' },
  detailImg: { width: '100%', height: '100%' },
  detailProductName: { fontSize: 16, fontWeight: '800', color: Colors.textMain },
  detailProductCode: { fontSize: 12, color: Colors.textSecondary },
  detailProductLocation: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },

  orderAmountBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  orderAmountLabel: { fontSize: 11, color: Colors.textSecondary },
  orderAmountValue: { fontSize: 18, fontWeight: '800', color: Colors.primary },
  orderPriceValue: { fontSize: 15, fontWeight: '800', color: Colors.textMain },

  datesRow: { flexDirection: 'row', gap: 10 },
  dateCol: { flex: 1, backgroundColor: Colors.heroBg, padding: 10, borderRadius: 8 },
  dateColLabel: { fontSize: 10, color: Colors.textSecondary },
  dateColVal: { fontSize: 12, fontWeight: '700', color: Colors.textMain, marginTop: 2 },

  orderNotesBox: { backgroundColor: '#FFFBEB', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#FEF3C7' },
  orderNotesLabel: { fontSize: 11, fontWeight: '700', color: '#B45309', marginBottom: 2 },
  orderNotesText: { fontSize: 12, color: Colors.textMain, lineHeight: 17 },

  statusButtonsRow: { flexDirection: 'row', gap: 8 },
  statusChangeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.heroBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusChangeBtnActive: { elevation: 2 },
  statusChangeText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },

  deleteOrderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
    marginTop: 6,
  },
  deleteOrderText: { fontSize: 12, fontWeight: '700', color: Colors.unavailable },

  // Order Status Stepper
  statusHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  currentStatusPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  currentStatusPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.white,
  },
  stepperWrap: {
    gap: 0,
    marginBottom: 20,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 52,
    position: 'relative',
  },
  stepConnector: {
    position: 'absolute',
    left: 17,
    top: -26,
    width: 2,
    height: 26,
    backgroundColor: Colors.cardBorder,
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.heroBg,
    borderWidth: 2,
    borderColor: Colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLabelWrap: {
    flex: 1,
  },
  stepLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  stepDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  advanceStatusBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 10,
    elevation: 3,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  advanceStatusBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },

  // Add product form
  formGroup: { gap: 6, marginBottom: 14 },
  formLabel: { fontSize: 13, fontWeight: '700', color: Colors.textMain },
  formInput: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.textMain,
  },
  textArea: { height: 75, textAlignVertical: 'top' },
  formRow: { flexDirection: 'row', gap: 10 },

  // Photo Mode Row
  photoModeRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  photoModeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  photoModeBtnActive: { backgroundColor: Colors.primary },
  photoModeText: { fontSize: 11, fontWeight: '700', color: Colors.primary },
  photoModeTextActive: { color: Colors.white },

  // Upload Container & Gallery Picker
  uploadContainer: { gap: 10 },
  uploadButtonsBox: { gap: 8 },
  galleryPickBtn: {
    backgroundColor: Colors.heroBg,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
    borderStyle: 'dashed',
    padding: 16,
    alignItems: 'center',
    gap: 4,
  },
  galleryIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    elevation: 1,
  },
  galleryBtnTitle: { fontSize: 13, fontWeight: '700', color: Colors.textMain },
  galleryBtnSub: { fontSize: 11, color: Colors.textSecondary },

  cameraPickBtn: {
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
  cameraPickText: { fontSize: 12, fontWeight: '600', color: Colors.textMain },

  // Preview container
  uploadedImagePreviewContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    height: 160,
  },
  uploadedFullImg: { width: '100%', height: '100%' },
  imageActionOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    gap: 8,
  },
  changeImageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(46,125,50,0.9)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  removeImageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(220,38,38,0.9)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  changeImageText: { fontSize: 11, color: Colors.white, fontWeight: '700' },

  imagePresetsRow: { gap: 10, paddingVertical: 4 },
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
  presetCardActive: { borderColor: Colors.primary, backgroundColor: Colors.heroBg },
  presetImg: { width: 56, height: 56, borderRadius: 8 },
  presetFallback: { backgroundColor: Colors.heroBg, alignItems: 'center', justifyContent: 'center' },
  presetLabel: { fontSize: 10, fontWeight: '600', color: Colors.textSecondary, textAlign: 'center' },
  presetLabelActive: { color: Colors.primary, fontWeight: '700' },

  customUploadBox: { gap: 8 },
  customUploadHint: { fontSize: 11, color: Colors.textSecondary },
  imagePreviewBox: { marginTop: 6, gap: 4 },
  previewLabel: { fontSize: 11, fontWeight: '700', color: Colors.primary },
  uploadedPreviewImg: { width: '100%', height: 120, borderRadius: 10 },

  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  categoryChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  categoryChipText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  categoryChipTextActive: { color: Colors.white, fontWeight: '700' },

  miniChipsRow: { flexDirection: 'row', gap: 6 },
  miniChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  miniChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  miniChipText: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary },
  miniChipTextActive: { color: Colors.white, fontWeight: '700' },

  publishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 10,
    elevation: 3,
  },
  publishBtnText: { color: Colors.white, fontSize: 15, fontWeight: '800' },

  // Empty state
  emptyState: { alignItems: 'center', paddingVertical: 40, gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: Colors.textMain },
  emptySubtitle: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center' },

  // Blog
  blogCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
  },
  blogStrip: { height: 4, backgroundColor: Colors.primary },
  blogBody: { padding: 14, gap: 6 },
  blogMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  blogCatTag: { backgroundColor: Colors.tagBg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  blogCatText: { fontSize: 10, color: Colors.primary, fontWeight: '700' },
  blogDate: { fontSize: 11, color: Colors.textSecondary },
  blogTitle: { fontSize: 14, fontWeight: '700', color: Colors.textMain },
  blogSummary: { fontSize: 12, color: Colors.textSecondary },
  readMore: { fontSize: 12, fontWeight: '700', color: Colors.primary, marginTop: 4 },
});
