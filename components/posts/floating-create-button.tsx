import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { brandColors, brandRadii, brandShadows } from '../../lib/branding';

export function FloatingCreateButton() {
  const [open, setOpen] = useState(false);

  return (
    <View pointerEvents="box-none" style={styles.wrapper}>
      {open && (
        <View style={styles.sheet}>
          <CreateRow icon="create" label="Start a post" />
          <CreateRow icon="bar-chart" label="Ask a poll" />
          <CreateRow icon="videocam" label="Open classroom studio" />
        </View>
      )}
      <Pressable
        accessibilityRole="button"
        onPress={() => setOpen((prev) => !prev)}
        style={({ pressed }) => [styles.fab, pressed && { transform: [{ scale: 0.98 }] }]}
      >
        <Ionicons name={open ? 'close' : 'add'} size={26} color="#fff" />
      </Pressable>
    </View>
  );
}

function CreateRow({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <TouchableOpacity style={styles.row} activeOpacity={0.9}>
      <View style={styles.iconPill}>
        <Ionicons name={icon} size={18} color={brandColors.primaryStrong} />
      </View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 84,
    right: 20,
    alignItems: 'flex-end',
    gap: 12,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: brandRadii.pill,
    backgroundColor: brandColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...brandShadows.strong,
  },
  sheet: {
    width: 240,
    backgroundColor: '#fff',
    borderRadius: brandRadii.card,
    padding: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: brandColors.border,
    ...brandShadows.soft,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    borderRadius: brandRadii.pill,
  },
  iconPill: {
    width: 32,
    height: 32,
    borderRadius: brandRadii.pill,
    backgroundColor: brandColors.highlight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: brandColors.border,
  },
  label: {
    fontWeight: '700',
    color: brandColors.ink,
  },
});
