import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type WaitingForHostProps = {
  onRetry: () => void;
};

export function WaitingForHost({ onRetry }: WaitingForHostProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Waiting for host...</Text>
      <Text style={styles.subtitle}>
        The classroom hasn’t started yet. We’ll connect you as soon as the host joins.
      </Text>
      <TouchableOpacity style={styles.button} onPress={onRetry}>
        <Text style={styles.buttonText}>Try again</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    color: '#F9FAFB',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
