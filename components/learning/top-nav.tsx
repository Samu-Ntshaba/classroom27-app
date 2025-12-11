import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { brandColors, brandRadii, brandShadows } from '../../lib/branding';
import { BrandLogo } from '../ui/brand-logo';

interface TopNavProps {
  onSearch?: (value: string) => void;
}

export function TopNav({ onSearch }: TopNavProps) {
  return (
    <View style={styles.navContainer}>
      <BrandLogo />
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color={brandColors.muted} />
        <TextInput
          placeholder="Search classrooms, creators, lessons"
          placeholderTextColor={brandColors.muted}
          onChangeText={onSearch}
          style={styles.input}
        />
      </View>
      <View style={styles.userRow}>
        <TouchableOpacity style={styles.avatar} activeOpacity={0.9}>
          <Text style={styles.avatarInitials}>CH</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.userName}>Camille Huynh</Text>
          <Text style={styles.userMeta}>Learner · 12 classes</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} activeOpacity={0.85}>
          <Ionicons name="log-out" size={18} color={brandColors.primaryStrong} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: brandColors.surface,
    borderBottomWidth: 1,
    borderColor: brandColors.border,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: brandColors.highlight,
    borderRadius: brandRadii.pill,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: brandColors.border,
    ...brandShadows.soft,
  },
  input: {
    marginLeft: 8,
    flex: 1,
    color: brandColors.ink,
    fontWeight: '600',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: brandRadii.pill,
    backgroundColor: brandColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    color: '#fff',
    fontWeight: '800',
  },
  userName: {
    fontWeight: '700',
    color: brandColors.ink,
  },
  userMeta: {
    color: brandColors.muted,
    fontSize: 12,
  },
  logoutButton: {
    padding: 8,
    borderRadius: brandRadii.pill,
    backgroundColor: brandColors.highlight,
    borderWidth: 1,
    borderColor: brandColors.border,
  },
});
