import React, { useState } from 'react';
import { login as apiLogin } from '@/services/api';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please enter your email and password.');
      return;
    }

    setLoading(true);

    try {
      await apiLogin(email.trim(), password.trim());

      // Login successful
      router.replace('/dashboard');
    } catch (err) {
      Alert.alert(
        'Login Failed',
        err?.message ||
          'Invalid email or password. Please check your credentials and try again.'
      );
    } finally {
      setLoading(false);
    }
  }

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
          {/* Back button */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color={Colors.textMain} />
          </TouchableOpacity>

          {/* Logo */}
          <View style={styles.logoWrap}>
            <Image source={LOGO} style={styles.logo} resizeMode="contain" />
          </View>

          {/* Title */}
          <View style={styles.titleWrap}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Sign in to your GanaHeza account
            </Text>
          </View>

          {/* Login Form Card */}
          <View style={styles.card}>
            {/* Email */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Email Address</Text>
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
                  placeholder="your@email.com"
                  placeholderTextColor={Colors.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Password</Text>
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
                  placeholder="Enter your password"
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
              onPress={() => {
                Alert.alert(
                  'Forgot Password',
                  'Password reset functionality will be available soon.'
                );
              }}
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <Text style={styles.loginBtnText}>Signing in...</Text>
              ) : (
                <>
                  <Ionicons
                    name="log-in-outline"
                    size={20}
                    color={Colors.white}
                  />
                  <Text style={styles.loginBtnText}>Sign In</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Bottom spacing */}
          <View style={styles.bottomSpace} />
        </ScrollView>
      </KeyboardAvoidingView>
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

  /* Back button */
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 10,
  },

  /* Logo */
  logoWrap: {
    alignItems: 'center',
    marginVertical: 20,
  },

  logo: {
    width: 160,
    height: 56,
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
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  /* Card */
  card: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
  },

  /* Form fields */
  fieldGroup: {
    marginBottom: 16,
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
    borderColor: Colors.inputBorder,
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
});
