import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  GridLayout,
  SpeakerLayout,
  useCallStateHooks,
} from '@stream-io/video-react-native-sdk';

type ClassroomVideoStageProps = {
  layout: 'speaker' | 'grid';
  reactionTrail?: { emoji?: string }[];
};

export function ClassroomVideoStage({
  layout,
  reactionTrail = [],
}: ClassroomVideoStageProps) {
  const { useParticipants, useCallCallingState } = useCallStateHooks();
  const participants = useParticipants();
  const callingState = useCallCallingState();

  useEffect(() => {
    console.log(
      `[LiveClassroom] callingState=${callingState} participantCount=${participants.length}`,
    );
  }, [callingState, participants.length]);

  return (
    <View style={styles.container}>
      {layout === 'speaker' ? <SpeakerLayout /> : <GridLayout />}
      {reactionTrail.length > 0 ? (
        <View style={styles.reactionsOverlay}>
          {reactionTrail.map((reaction, index) => (
            <Text key={`${reaction.emoji ?? 'reaction'}-${index}`} style={styles.reactionBubble}>
              {reaction.emoji}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0F',
  },
  reactionsOverlay: {
    position: 'absolute',
    right: 12,
    top: 12,
    alignItems: 'center',
    gap: 6,
  },
  reactionBubble: {
    fontSize: 20,
    backgroundColor: 'rgba(15,23,42,0.8)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    overflow: 'hidden',
  },
});
