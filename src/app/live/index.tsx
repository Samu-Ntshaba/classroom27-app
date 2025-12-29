import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { STREAM_USERS, type StreamUserMode } from '../../constants/stream';

const DEFAULT_TITLE = 'Classroom 27 Live';

export default function LiveLobbyScreen() {
  const [mode, setMode] = useState<'host' | 'participant'>('host');
  const [classroomTitle, setClassroomTitle] = useState(DEFAULT_TITLE);
  const [classroomId, setClassroomId] = useState('');
  const [participantProfile, setParticipantProfile] = useState<StreamUserMode>('learner1');

  const isHost = mode === 'host';

  const classroomSubtitle = useMemo(() => {
    const user = STREAM_USERS[isHost ? 'host' : participantProfile];
    return `${isHost ? 'Hosting as' : 'Joining as'} ${user.name}`;
  }, [isHost, participantProfile]);

  const handleCreate = () => {
    const newId = `c27-${Date.now()}`;
    router.push({
      pathname: '/live/[classroomId]',
      params: {
        classroomId: newId,
        mode: 'host',
        title: classroomTitle || DEFAULT_TITLE,
      },
    });
  };

  const handleJoin = () => {
    if (!classroomId.trim()) {
      return;
    }

    router.push({
      pathname: '/live/[classroomId]',
      params: {
        classroomId: classroomId.trim(),
        mode: 'participant',
        user: participantProfile,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.hero}>
          <Text style={styles.title}>Classroom 27 Live</Text>
          <Text style={styles.subtitle}>
            Create a live classroom or join an ongoing session in seconds.
          </Text>
        </View>

        <View style={styles.modeToggle}>
          <TouchableOpacity
            style={[styles.modeButton, isHost && styles.modeButtonActive]}
            onPress={() => setMode('host')}
          >
            <Text style={[styles.modeText, isHost && styles.modeTextActive]}>Host</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, !isHost && styles.modeButtonActive]}
            onPress={() => setMode('participant')}
          >
            <Text style={[styles.modeText, !isHost && styles.modeTextActive]}>
              Participant
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.caption}>{classroomSubtitle}</Text>

        {isHost ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Create a classroom</Text>
            <TextInput
              value={classroomTitle}
              onChangeText={setClassroomTitle}
              placeholder="Classroom title"
              placeholderTextColor="#94A3B8"
              style={styles.input}
            />
            <TouchableOpacity style={styles.primaryButton} onPress={handleCreate}>
              <Text style={styles.primaryButtonText}>Start classroom</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Join a classroom</Text>
            <TextInput
              value={classroomId}
              onChangeText={setClassroomId}
              placeholder="Enter classroom ID"
              placeholderTextColor="#94A3B8"
              style={styles.input}
              autoCapitalize="none"
            />
            <View style={styles.profileRow}>
              {(['learner1', 'learner2'] as StreamUserMode[]).map((profile) => {
                const user = STREAM_USERS[profile];
                const isActive = participantProfile === profile;
                return (
                  <TouchableOpacity
                    key={profile}
                    style={[styles.profileChip, isActive && styles.profileChipActive]}
                    onPress={() => setParticipantProfile(profile)}
                  >
                    <Text style={[styles.profileText, isActive && styles.profileTextActive]}>
                      {user.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity style={styles.primaryButton} onPress={handleJoin}>
              <Text style={styles.primaryButtonText}>Join classroom</Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B0B0F',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 16,
  },
  hero: {
    gap: 6,
  },
  title: {
    color: '#F9FAFB',
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 4,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  modeButtonActive: {
    backgroundColor: '#2563EB',
  },
  modeText: {
    color: '#CBD5F5',
    fontWeight: '500',
  },
  modeTextActive: {
    color: '#FFFFFF',
  },
  caption: {
    color: '#94A3B8',
    fontSize: 12,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 18,
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    color: '#F9FAFB',
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    backgroundColor: 'rgba(15,23,42,0.9)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#F9FAFB',
  },
  profileRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  profileChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  profileChipActive: {
    backgroundColor: '#2563EB',
  },
  profileText: {
    color: '#CBD5F5',
    fontSize: 12,
  },
  profileTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
