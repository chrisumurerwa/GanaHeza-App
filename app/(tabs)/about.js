import React from 'react';
import {
  Linking,
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

const WHATSAPP_NUMBER = '250783486662';

function openWhatsApp() {
  const msg = 'Hello GanaHeza, I would like to know more about your platform.';
  const url = `whatsapp://send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(msg)}`;
  Linking.canOpenURL(url).then((ok) => {
    Linking.openURL(ok ? url : `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`);
  });
}

function StatItem({ value, label, onPress }) {
  return (
    <TouchableOpacity style={styles.statItem} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function OfferRow({ icon, text, onPress }) {
  return (
    <TouchableOpacity
      style={styles.offerRow}
      onPress={onPress}
      activeOpacity={onPress ? 0.75 : 1}
    >
      <View style={styles.offerIcon}>
        <Ionicons name={icon} size={16} color={Colors.primary} />
      </View>
      <Text style={styles.offerText}>{text}</Text>
      {onPress && <Ionicons name="chevron-forward" size={14} color={Colors.cardBorder} />}
    </TouchableOpacity>
  );
}

export default function AboutScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} overScrollMode="never">

        {/* ── Brand Hero ─────────────────────────────── */}
        <View style={styles.brandHero}>
          <View style={styles.brandIcon}>
            <Ionicons name="leaf" size={36} color={Colors.white} />
          </View>
          <Text style={styles.brandName}>GanaHeza</Text>
          <Text style={styles.brandTagline}>Agriculture Marketplace · Kayonza, Rwanda</Text>

          {/* WhatsApp quick button in hero */}
          <TouchableOpacity style={styles.heroWhatsapp} onPress={openWhatsApp} activeOpacity={0.85}>
            <Ionicons name="logo-whatsapp" size={16} color={Colors.white} />
            <Text style={styles.heroWhatsappText}>Chat with us</Text>
          </TouchableOpacity>
        </View>

        {/* ── Stats — tappable ───────────────────────── */}
        <View style={styles.statsRow}>
          <StatItem value="15+" label="Products"  onPress={() => router.push('/(tabs)/products')} />
          <View style={styles.statDivider} />
          <StatItem value="6+"  label="Articles"  onPress={() => router.push('/(tabs)/blog')} />
          <View style={styles.statDivider} />
          <StatItem value="2026" label="Est." />
        </View>

        {/* ── About ─────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIconWrap}>
                <Ionicons name="information-circle-outline" size={20} color={Colors.primary} />
              </View>
              <Text style={styles.cardTitle}>About GanaHeza</Text>
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.bodyText}>
                GanaHeza is a digital agriculture platform designed to connect farmers and
                agricultural stakeholders with reliable information about agricultural products,
                market prices, available quantities and farming opportunities.
              </Text>
              <Text style={[styles.bodyText, { marginTop: 10 }]}>
                Our platform empowers Rwanda's farming community by making critical market
                information easily accessible, reducing information gaps and helping farmers
                make better decisions.
              </Text>
            </View>
          </View>
        </View>

        {/* ── Mission & Vision ──────────────────────── */}
        <View style={styles.section}>
          <View style={styles.mvRow}>
            <View style={[styles.mvCard, { backgroundColor: Colors.primary }]}>
              <Ionicons name="rocket-outline" size={24} color={Colors.white} style={{ marginBottom: 10 }} />
              <Text style={styles.mvTitle}>Our Mission</Text>
              <Text style={styles.mvText}>
                To empower farmers with accessible and reliable agricultural market information.
              </Text>
            </View>
            <View style={[styles.mvCard, { backgroundColor: Colors.primaryLight }]}>
              <Ionicons name="eye-outline" size={24} color={Colors.white} style={{ marginBottom: 10 }} />
              <Text style={styles.mvTitle}>Our Vision</Text>
              <Text style={styles.mvText}>
                To build a connected agricultural ecosystem where farmers make better decisions.
              </Text>
            </View>
          </View>
        </View>

        {/* ── What We Offer — tappable ──────────────── */}
        <View style={styles.section}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIconWrap}>
                <Ionicons name="grid-outline" size={20} color={Colors.primary} />
              </View>
              <Text style={styles.cardTitle}>What We Offer</Text>
            </View>
            <View style={styles.cardBody}>
              <OfferRow icon="pricetag-outline"  text="Real-time agricultural market prices"             onPress={() => router.push('/(tabs)/products')} />
              <OfferRow icon="leaf-outline"       text="Product availability and quantities"               onPress={() => router.push('/(tabs)/products')} />
              <OfferRow icon="people-outline"     text="Direct connection between farmers and buyers"      onPress={() => router.push('/contact')} />
              <OfferRow icon="newspaper-outline"  text="Farming tips and market news"                      onPress={() => router.push('/(tabs)/blog')} />
              <OfferRow icon="call-outline"       text="Direct contact and inquiry support"                onPress={() => router.push('/contact')} />
            </View>
          </View>
        </View>

        {/* ── Quick Contact Buttons ─────────────────── */}
        <View style={styles.section}>
          <View style={styles.quickContactRow}>
            <TouchableOpacity
              style={styles.quickBtn}
              onPress={() => Linking.openURL('tel:+250783486662')}
              activeOpacity={0.85}
            >
              <Ionicons name="call-outline" size={20} color={Colors.primary} />
              <Text style={styles.quickBtnText}>Call Us</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickBtn, styles.quickBtnWhatsapp]}
              onPress={openWhatsApp}
              activeOpacity={0.85}
            >
              <Ionicons name="logo-whatsapp" size={20} color={Colors.white} />
              <Text style={[styles.quickBtnText, { color: Colors.white }]}>WhatsApp</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickBtn}
              onPress={() => Linking.openURL('mailto:info@ganaheza.com')}
              activeOpacity={0.85}
            >
              <Ionicons name="mail-outline" size={20} color={Colors.primary} />
              <Text style={styles.quickBtnText}>Email</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Contact CTA ───────────────────────────── */}
        <TouchableOpacity
          style={styles.contactCta}
          onPress={() => router.push('/contact')}
          activeOpacity={0.85}
        >
          <View>
            <Text style={styles.ctaTitle}>Get in Touch</Text>
            <Text style={styles.ctaSub}>We'd love to hear from you</Text>
          </View>
          <View style={styles.ctaArrow}>
            <Ionicons name="arrow-forward" size={18} color={Colors.white} />
          </View>
        </TouchableOpacity>

        {/* ── Footer ────────────────────────────────── */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2026 GanaHeza · Kayonza, Rwanda</Text>
          <TouchableOpacity onPress={() => Linking.openURL('mailto:info@ganaheza.com')}>
            <Text style={styles.footerLink}>info@ganaheza.com</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL('tel:+250783486662')}>
            <Text style={styles.footerLink}>+250 783 486 662</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 100 },

  // Hero
  brandHero: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 28,
  },
  brandIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  brandName: { fontSize: 28, fontWeight: '800', color: Colors.white, letterSpacing: 0.5 },
  brandTagline: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  heroWhatsapp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    marginTop: 16,
  },
  heroWhatsappText: { fontSize: 13, color: Colors.white, fontWeight: '700' },

  // Stats
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
    justifyContent: 'space-around',
  },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 22, fontWeight: '800', color: Colors.primary },
  statLabel: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: Colors.cardBorder, marginVertical: 4 },

  // Sections
  section: { marginHorizontal: 16, marginTop: 20 },

  // Card
  card: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
    backgroundColor: Colors.heroBg,
  },
  cardIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: Colors.textMain },
  cardBody: { padding: 16 },
  bodyText: { fontSize: 14, color: Colors.textSecondary, lineHeight: 22 },

  // Mission/Vision
  mvRow: { flexDirection: 'row', gap: 12 },
  mvCard: { flex: 1, borderRadius: 14, padding: 18 },
  mvTitle: { fontSize: 14, fontWeight: '700', color: Colors.white, marginBottom: 8 },
  mvText: { fontSize: 12, color: 'rgba(255,255,255,0.9)', lineHeight: 18 },

  // Offer rows
  offerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  offerIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.tagBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  offerText: { fontSize: 14, color: Colors.textMain, flex: 1 },

  // Quick contact
  quickContactRow: { flexDirection: 'row', gap: 10 },
  quickBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingVertical: 13,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  quickBtnWhatsapp: {
    backgroundColor: '#25D366',
    borderColor: '#25D366',
  },
  quickBtnText: { fontSize: 12, fontWeight: '700', color: Colors.primary },

  // CTA
  contactCta: {
    backgroundColor: Colors.primary,
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ctaTitle: { fontSize: 16, fontWeight: '700', color: Colors.white },
  ctaSub: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  ctaArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Footer
  footer: { alignItems: 'center', marginTop: 28, gap: 6 },
  footerText: { fontSize: 12, color: Colors.textSecondary },
  footerLink: { fontSize: 12, color: Colors.primary, fontWeight: '600' },
});
