import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { submitContactMessage } from '@/services/api';

// ── GanaHeza contact details ──────────────────────────────────────────────────
const WHATSAPP_NUMBER = '250783486662'; // no + or spaces
const PHONE_NUMBER    = '+250 783 486 662';

const CONTACT_ITEMS = [
  { icon: 'call-outline',     label: 'Phone',           value: PHONE_NUMBER,           action: () => Linking.openURL(`tel:+250783486662`) },
  { icon: 'mail-outline',     label: 'Email',           value: 'ganaheza16@gmail.com', action: () => Linking.openURL('mailto:ganaheza16@gmail.com') },
  { icon: 'mail-outline',     label: 'Official Email',  value: 'info@ganaheza.com',    action: () => Linking.openURL('mailto:info@ganaheza.com') },
  { icon: 'location-outline', label: 'Location',        value: 'Kayonza, Rwanda',      action: () => Linking.openURL('https://maps.google.com/?q=Kayonza,Rwanda') },
];

const NAVIGATION_ITEMS = [
  { label: 'Home', route: '/(tabs)', icon: 'home-outline' },
  { label: 'Products', route: '/(tabs)/products', icon: 'leaf-outline' },
  { label: 'Blog', route: '/(tabs)/blog', icon: 'newspaper-outline' },
  { label: 'About', route: '/(tabs)/about', icon: 'information-circle-outline' },
];

function ContactBottomNavigation() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <TouchableOpacity
        style={styles.backNavItem}
        onPress={() => router.back()}
        activeOpacity={0.75}
        accessibilityLabel="Back"
      >
        <Ionicons name="chevron-back" size={20} color={Colors.textSecondary} />
        <Text style={styles.navLabel}>Back</Text>
      </TouchableOpacity>

      {NAVIGATION_ITEMS.map((item) => (
        <TouchableOpacity
          key={item.label}
          style={styles.navItem}
          onPress={() => router.replace(item.route)}
          activeOpacity={0.75}
          accessibilityLabel={item.label}
        >
          <Ionicons name={item.icon} size={22} color="#AAAAAA" />
          <Text style={styles.navLabel}>{item.label}</Text>
        </TouchableOpacity>
      ))}

      <View style={styles.navItem} accessibilityLabel="Chat with us, current page">
        <View style={styles.activeNavBar} />
        <Ionicons name="chatbubble-ellipses" size={22} color={Colors.primary} />
        <Text style={[styles.navLabel, styles.navLabelActive]}>Chat</Text>
      </View>
    </View>
  );
}

function openWhatsApp(message = '') {
  const encoded = encodeURIComponent(message);
  const url = `whatsapp://send?phone=${WHATSAPP_NUMBER}&text=${encoded}`;
  Linking.canOpenURL(url)
    .then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        // Fallback to web WhatsApp if app not installed
        Linking.openURL(
          `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`
        );
      }
    })
    .catch(() => {
      Alert.alert('Error', 'Could not open WhatsApp. Please check if it is installed.');
    });
}

export default function ContactScreen() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      Alert.alert('Missing Fields', 'Please fill in your name, email and message.');
      return;
    }
    setSubmitting(true);
    try {
      await submitContactMessage(form);
      Alert.alert(
        '✅ Message Sent!',
        'Thank you for reaching out. Our team will get back to you soon.',
        [{ text: 'OK', onPress: () => setForm({ name: '', phone: '', email: '', message: '' }) }]
      );
    } catch {
      Alert.alert('Error', 'Could not send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* ── Hero ─────────────────────────────── */}
          <View style={styles.hero}>
            <View style={styles.heroIconWrap}>
              <Ionicons name="chatbubbles-outline" size={34} color={Colors.white} />
            </View>
            <Text style={styles.heroTitle}>Contact GanaHeza</Text>
            <Text style={styles.heroSub}>We're here to help. Reach out anytime.</Text>
          </View>

          {/* ── WhatsApp CTA ─────────────────────── */}
          <TouchableOpacity
            style={styles.whatsappBtn}
            onPress={() => openWhatsApp('Hello GanaHeza, I would like to inquire about your products.')}
            activeOpacity={0.85}
          >
            <View style={styles.whatsappIconWrap}>
              <Ionicons name="logo-whatsapp" size={26} color={Colors.white} />
            </View>
            <View style={styles.whatsappTextWrap}>
              <Text style={styles.whatsappTitle}>Chat on WhatsApp</Text>
              <Text style={styles.whatsappSub}>{PHONE_NUMBER}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>

          {/* ── Contact Details ──────────────────── */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Contact Information</Text>
            {CONTACT_ITEMS.map((item, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.contactRow, i < CONTACT_ITEMS.length - 1 && styles.contactBorder]}
                onPress={item.action ?? undefined}
                activeOpacity={item.action ? 0.7 : 1}
              >
                <View style={styles.contactIconWrap}>
                  <Ionicons name={item.icon} size={18} color={Colors.primary} />
                </View>
                <View style={styles.contactTexts}>
                  <Text style={styles.contactLabel}>{item.label}</Text>
                  <Text style={[styles.contactValue, item.action && styles.contactLink]}>
                    {item.value}
                  </Text>
                </View>
                {item.action && (
                  <Ionicons name="chevron-forward" size={16} color={Colors.cardBorder} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Divider ──────────────────────────── */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or send us a message</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* ── Contact Form ─────────────────────── */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Send a Message</Text>

            {[
              { field: 'name',    label: 'Full Name *',      placeholder: 'Your full name',     keyboard: 'default',       caps: 'words' },
              { field: 'phone',   label: 'Phone Number',     placeholder: '+250 783 486 662',   keyboard: 'phone-pad',     caps: 'none' },
              { field: 'email',   label: 'Email Address *',  placeholder: 'your@email.com',     keyboard: 'email-address', caps: 'none' },
            ].map(({ field, label, placeholder, keyboard, caps }) => (
              <View key={field} style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>{label}</Text>
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
            ))}

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Message *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={form.message}
                onChangeText={(v) => updateField('message', v)}
                placeholder="Write your message here..."
                placeholderTextColor={Colors.textSecondary}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
              onPress={handleSubmit}
              disabled={submitting}
              activeOpacity={0.85}
            >
              <Ionicons name="send-outline" size={18} color={Colors.white} />
              <Text style={styles.submitText}>{submitting ? 'Sending...' : 'Send Message'}</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
      <ContactBottomNavigation />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 24 },

  // Bottom navigation remains visible while the customer fills in the form.
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
    paddingTop: 6,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    gap: 3,
    position: 'relative',
  },
  backNavItem: {
    width: 58,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    gap: 3,
    borderRightWidth: 1,
    borderRightColor: Colors.cardBorder,
  },
  navLabel: { fontSize: 10, fontWeight: '700', color: '#666666' },
  navLabelActive: { color: Colors.primary, fontWeight: '800' },
  activeNavBar: {
    position: 'absolute',
    top: 0,
    left: '25%',
    right: '25%',
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },

  // Hero
  hero: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    paddingTop: 36,
    paddingBottom: 30,
    paddingHorizontal: 24,
    gap: 8,
  },
  heroIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  heroTitle: { fontSize: 22, fontWeight: '800', color: Colors.white },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', textAlign: 'center' },

  // WhatsApp CTA
  whatsappBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#25D366',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    gap: 14,
    elevation: 4,
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  whatsappIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  whatsappTextWrap: { flex: 1 },
  whatsappTitle: { fontSize: 15, fontWeight: '800', color: Colors.white },
  whatsappSub: { fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 2 },

  // Card
  card: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textMain,
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },

  // Contact rows
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  contactBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  contactIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.tagBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactTexts: { flex: 1 },
  contactLabel: { fontSize: 11, color: Colors.textSecondary, marginBottom: 2 },
  contactValue: { fontSize: 14, fontWeight: '600', color: Colors.textMain },
  contactLink: { color: Colors.primary },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 20,
    gap: 10,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.divider },
  dividerText: { fontSize: 12, color: Colors.textSecondary },

  // Form
  fieldGroup: { marginBottom: 14 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: Colors.textMain, marginBottom: 6 },
  input: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.textMain,
  },
  textArea: { minHeight: 110, paddingTop: 12 },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 15,
    marginTop: 6,
  },
  submitText: { fontSize: 15, fontWeight: '700', color: Colors.white },
});
