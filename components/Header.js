import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';

/**
 * Header - top app bar used on the Home screen.
 * Props:
 *   onNotificationPress: function (optional)
 */
export default function Header({ onNotificationPress }) {
  return (
    <View style={styles.container}>
      {/* Brand mark */}
      <View style={styles.brand}>
        <View style={styles.logoMark}>
          <Ionicons name="leaf" size={18} color={Colors.white} />
        </View>
        <View>
          <Text style={styles.appName}>Gana Heza</Text>
          <Text style={styles.tagline}>Gana Heza Company</Text>
        </View>
      </View>

      {/* Actions */}
      <TouchableOpacity
        style={styles.iconBtn}
        onPress={onNotificationPress}
        activeOpacity={0.7}
        accessibilityLabel="Notifications"
      >
        <Ionicons name="notifications-outline" size={22} color={Colors.textMain} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoMark: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.3,
  },
  tagline: {
    fontSize: 10,
    color: Colors.textSecondary,
    letterSpacing: 0.2,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
});
