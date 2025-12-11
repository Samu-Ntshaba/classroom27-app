import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';

import { brandColors } from '../../lib/branding';
import { TopNav } from './top-nav';
import { BottomNav } from './bottom-nav';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <TopNav />
      <View style={styles.content}>{children}</View>
      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: brandColors.surface,
  },
  content: {
    flex: 1,
  },
});
