import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { brandColors, brandRadii } from '../../lib/branding';

const navItems = [
  { icon: 'home', label: 'Feed' },
  { icon: 'play-circle', label: 'Classrooms' },
  { icon: 'people', label: 'Creators' },
  { icon: 'notifications', label: 'Alerts' },
  { icon: 'settings', label: 'Settings' },
];

export function BottomNav() {
  return (
    <View style={styles.navBar}>
      {navItems.map((item, index) => (
        <TouchableOpacity key={item.label} style={styles.navItem} activeOpacity={0.85}>
          <Ionicons
            name={(item.icon as keyof typeof Ionicons.glyphMap) ?? 'ellipse'}
            size={22}
            color={index === 0 ? brandColors.primary : brandColors.muted}
          />
          <Text style={[styles.navLabel, index === 0 && styles.navLabelActive]}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: brandColors.border,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: brandRadii.pill,
  },
  navLabel: {
    fontSize: 12,
    color: brandColors.muted,
    fontWeight: '600',
  },
  navLabelActive: {
    color: brandColors.primary,
  },
});
