import { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ClassroomTopBarProps = {
  title: string;
  subtitle?: string;
  layoutMode: 'speaker' | 'grid';
  onToggleLayout: () => void;
  onLeave: () => void;
};

export function ClassroomTopBar({
  title,
  subtitle,
  layoutMode,
  onToggleLayout,
  onLeave,
}: ClassroomTopBarProps) {
  const insets = useSafeAreaInsets();
  const layoutLabel = useMemo(
    () => (layoutMode === 'speaker' ? 'Grid' : 'Speaker'),
    [layoutMode],
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.toggleButton} onPress={onToggleLayout}>
          <Text style={styles.toggleText}>{layoutLabel} view</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.leaveButton} onPress={onLeave}>
          <Text style={styles.leaveText}>Leave</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0B0B0F',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  title: {
    color: '#F9FAFB',
    fontSize: 18,
    fontWeight: '600',
  },
  subtitle: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  toggleText: {
    color: '#E5E7EB',
    fontSize: 12,
    fontWeight: '500',
  },
  leaveButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#EF4444',
  },
  leaveText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
