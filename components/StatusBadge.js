import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Colors from '@/constants/colors';

/**
 * StatusBadge - displays product availability as a colored badge.
 * Props:
 *   status: 'available' | 'unavailable' | string
 */
export default function StatusBadge({ status }) {
  const isAvailable = status === 'available';

  return (
    <View style={[styles.badge, isAvailable ? styles.availableBg : styles.unavailableBg]}>
      <View style={[styles.dot, isAvailable ? styles.availableDot : styles.unavailableDot]} />
      <Text style={[styles.label, isAvailable ? styles.availableText : styles.unavailableText]}>
        {isAvailable ? 'Available' : 'Out of Stock'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 5,
  },
  availableBg: {
    backgroundColor: '#E8F5E9',
  },
  unavailableBg: {
    backgroundColor: '#FFEBEE',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  availableDot: {
    backgroundColor: Colors.available,
  },
  unavailableDot: {
    backgroundColor: Colors.unavailable,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
  availableText: {
    color: Colors.available,
  },
  unavailableText: {
    color: Colors.unavailable,
  },
});
