import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import {
  login as apiLogin,
  forgotPassword as apiForgotPassword,
  resetPassword as apiResetPassword,
} from '@/services/api';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
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

const LOGO = require('@/assets/images/Ganaheza LOGO.png');

export default function LoginScreen() {
  const router = useRouter();
  const { t, language, toggleLanguage } = useLanguage();

  // ── Login state ─────────────────────────────────────────────────────────────
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  // ── Forgot-password modal state ─────────────────────────────────────────────
  const [showForgot, setShowForgot]       = useState(false);
  const [forgotStep, setForgotStep]       = useState(1); // 1=email, 2=otp+newpass
  const [forgotEmail, setForgotEmail]     = useState('');
  const [otpCode, setOtpCode]             = useState('');
  const [newPass, setNewPass]             = useState('');
  const [confirmPass, setConfirmPass]     = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [showNewPass, setShowNewPass]     = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // ── Handlers ────────────────────────────────────────────────────────────────

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      Alert.alert(t('login_missing_fields'), t('login_missing_body'));
      return;
    }

    setLoading(true);

    try {
      await apiLogin(email.trim(), password.trim());
      router.replace('/dashboard');
    } catch (err) {
      Alert.alert(
        t('login_failed'),
        err?.message ||
          'Invalid email or password. Please check your credentials and try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  function openForgotModal() {
    setForgotStep(1);
    setForgotEmail(email);
    setOtpCode('');
    setNewPass('');
    setConfirmPass('');
    setShowForgot(true);
  }

  function closeForgotModal() {
    setShowForgot(false);
    setForgotStep(1);
    setOtpCode('');
    setNewPass('');
    setConfirmPass('');
    setForgotLoading(false);
  }

  // Step 1: Send OTP to email
  async function handleSendOtp() {
    if (!forgotEmail.trim()) {
      Alert.alert(t('login_missing_fields'), t('login_missing_body'));
      return;
    }
    setForgotLoading(true);
    try {
      await apiForgotPassword(forgotEmail.trim());
      // Always move to step 2 (don't reveal if email exists)
      setForgotStep(2);
      Alert.alert(t('forgot_code_sent'), t('forgot_code_sent_body'));
    } catch (err) {
      Alert.alert(t('forgot_error_title'), err?.message || 'Something went wrong. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  }

  // Step 2: Verify OTP + set new password
  async function handleResetPassword() {
    if (!otpCode.trim() || otpCode.length !== 6) {
      Alert.alert(t('forgot_error_title'), t('forgot_otp_required'));
      return;
    }
    if (newPass.length < 6) {
      Alert.alert(t('forgot_pass_short_title'), t('forgot_pass_short_body'));
      return;
    }
    if (newPass !== confirmPass) {
      Alert.alert(t('forgot_pass_mismatch_title'), t('forgot_pass_mismatch_body'));
      return;
    }
    setForgotLoading(true);
    try {
      await apiResetPassword(forgotEmail.trim(), otpCode.trim(), newPass);
      Alert.alert(t('forgot_success_title'), t('forgot_success_body'));
      closeForgotModal();
    } catch (err) {
      Alert.alert(t('forgot_error_title'), err?.message || 'Something went wrong. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top row: back button + language toggle */}
          <View style={styles.topRow}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={22} color={Colors.textMain} />
            </TouchableOpacity>

            {/* Language toggle */}
            <TouchableOpacity
              style={styles.langToggle}
              onPress={toggleLanguage}
              activeOpacity={0.7}
            >
              <Ionicons name="language-outline" size={16} color={Colors.primary} />
              <Text style={styles.langToggleText}>
                {language === 'en' ? 'EN' : 'RW'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Logo */}
          <View style={styles.logoWrap}>
            <Image source={LOGO} style={styles.logo} resizeMode="contain" />
          </View>

          {/* Title */}
          <View style={styles.titleWrap}>
            <Text style={styles.title}>{t('login_welcome')}</Text>
            <Text style={styles.subtitle}>{t('login_subtitle')}</Text>
          </View>

          {/* Login Form Card */}
          <View style={styles.card}>
            {/* Email */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>{t('login_email_label')}</Text>
              <View style={styles.inputWrap}>
                <Ionicons
                  name="mail-outline"
                  size={18}
                  color={Colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder={t('login_email_ph')}
                  placeholderTextColor={Colors.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>{t('login_password_label')}</Text>
              <View style={styles.inputWrap}>
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color={Colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder={t('login_password_ph')}
                  placeholderTextColor={Colors.textSecondary}
                  secureTextEntry={!showPass}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setShowPass(!showPass)}
                  style={styles.eyeBtn}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={showPass ? 'eye-off-outline' : 'eye-outline'}
                    size={19}
                    color={Colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity
              style={styles.forgotWrap}
              activeOpacity={0.7}
              onPress={openForgotModal}
            >
              <Text style={styles.forgotText}>{t('login_forgot')}</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <Text style={styles.loginBtnText}>{t('login_signing_in')}</Text>
              ) : (
                <>
                  <Ionicons
                    name="log-in-outline"
                    size={20}
                    color={Colors.white}
                  />
                  <Text style={styles.loginBtnText}>{t('login_signin')}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Bottom spacing */}
          <View style={styles.bottomSpace} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ─── Forgot Password Modal ─────────────────────────────────────────── */}
      <Modal
        visible={showForgot}
        transparent
        animationType="fade"
        onRequestClose={closeForgotModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {/* Modal header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('forgot_title')}</Text>
              <TouchableOpacity onPress={closeForgotModal} activeOpacity={0.7}>
                <Ionicons name="close" size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {forgotStep === 1 ? (
              // ── Step 1: Enter email ──
              <View>
                <Text style={styles.modalDesc}>{t('forgot_step1_desc')}</Text>

                <Text style={styles.fieldLabel}>{t('forgot_email_label')}</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="mail-outline" size={18} color={Colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={forgotEmail}
                    onChangeText={setForgotEmail}
                    placeholder={t('forgot_email_ph')}
                    placeholderTextColor={Colors.textSecondary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.modalBtn, forgotLoading && styles.loginBtnDisabled]}
                  onPress={handleSendOtp}
                  disabled={forgotLoading}
                  activeOpacity={0.85}
                >
                  <Text style={styles.loginBtnText}>
                    {forgotLoading ? t('forgot_sending') : t('forgot_send_code')}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              // ── Step 2: Enter OTP + new password ──
              <View>
                <Text style={styles.modalDesc}>{t('forgot_step2_desc')}</Text>

                {/* OTP code */}
                <Text style={styles.fieldLabel}>{t('forgot_otp_label')}</Text>
                <View style={[styles.inputWrap, { marginBottom: 14 }]}>
                  <Ionicons name="keypad-outline" size={18} color={Colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { letterSpacing: 6, fontSize: 20, fontWeight: '700' }]}
                    value={otpCode}
                    onChangeText={(v) => setOtpCode(v.replace(/[^0-9]/g, '').slice(0, 6))}
                    placeholder="000000"
                    placeholderTextColor={Colors.textSecondary}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>

                {/* New Password */}
                <Text style={styles.fieldLabel}>{t('forgot_new_pass_label')}</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="lock-closed-outline" size={18} color={Colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={newPass}
                    onChangeText={setNewPass}
                    placeholder={t('forgot_new_pass_ph')}
                    placeholderTextColor={Colors.textSecondary}
                    secureTextEntry={!showNewPass}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity onPress={() => setShowNewPass(!showNewPass)} style={styles.eyeBtn} activeOpacity={0.7}>
                    <Ionicons name={showNewPass ? 'eye-off-outline' : 'eye-outline'} size={19} color={Colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                {/* Confirm Password */}
                <Text style={[styles.fieldLabel, { marginTop: 14 }]}>{t('forgot_confirm_label')}</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="lock-closed-outline" size={18} color={Colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={confirmPass}
                    onChangeText={setConfirmPass}
                    placeholder={t('forgot_confirm_ph')}
                    placeholderTextColor={Colors.textSecondary}
                    secureTextEntry={!showConfirmPass}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity onPress={() => setShowConfirmPass(!showConfirmPass)} style={styles.eyeBtn} activeOpacity={0.7}>
                    <Ionicons name={showConfirmPass ? 'eye-off-outline' : 'eye-outline'} size={19} color={Colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[styles.modalBtn, forgotLoading && styles.loginBtnDisabled]}
                  onPress={handleResetPassword}
                  disabled={forgotLoading}
                  activeOpacity={0.85}
                >
                  <Text style={styles.loginBtnText}>
                    {forgotLoading ? t('forgot_resetting') : t('forgot_reset_btn')}
                  </Text>
                </TouchableOpacity>

                {/* Resend code */}
                <TouchableOpacity style={{ alignItems: 'center', marginTop: 12 }} onPress={() => setForgotStep(1)} activeOpacity={0.7}>
                  <Text style={[styles.forgotText, { fontSize: 12 }]}>{t('forgot_send_code')} again</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Back to login link */}
            <TouchableOpacity
              style={styles.modalBackLink}
              onPress={closeForgotModal}
              activeOpacity={0.7}
            >
              <Text style={styles.forgotText}>{t('forgot_back_login')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  keyboard: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },

  /* Top row: back + language toggle */
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  /* Back button */
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },

  /* Language toggle */
  langToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },

  langToggleText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '700',
  },

  /* Logo */
  logoWrap: {
    alignItems: 'center',
    marginBottom: 24,
  },

  logo: {
    width: 120,
    height: 120,
  },

  /* Title */
  titleWrap: {
    alignItems: 'center',
    marginBottom: 28,
  },

  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textMain,
  },

  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },

  /* Card */
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },

  fieldGroup: {
    marginBottom: 18,
  },

  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMain,
    marginBottom: 8,
  },

  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },

  inputIcon: {
    marginRight: 8,
  },

  input: {
    flex: 1,
    fontSize: 14,
    color: Colors.textMain,
    paddingVertical: 0,
  },

  eyeBtn: {
    padding: 4,
    marginLeft: 5,
  },

  /* Forgot password */
  forgotWrap: {
    alignItems: 'flex-end',
    marginBottom: 20,
    marginTop: -4,
  },

  forgotText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },

  /* Login button */
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 15,
    elevation: 3,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },

  loginBtnDisabled: {
    opacity: 0.7,
  },

  loginBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },

  bottomSpace: {
    height: 40,
  },

  /* ─── Forgot Password Modal ─── */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  modalCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textMain,
  },

  modalDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 16,
    lineHeight: 19,
  },

  modalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 16,
    elevation: 3,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },

  modalBackLink: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 8,
  },
});
