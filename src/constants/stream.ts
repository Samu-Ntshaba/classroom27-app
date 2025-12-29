export const STREAM_API_KEY = 'xmzhgjbptbuu';

// TODO: Replace these placeholder tokens with real Stream video tokens.
export const STREAM_TOKENS = {
  host: 'PASTE_HOST_TOKEN_HERE',
  learner1: 'PASTE_LEARNER_ONE_TOKEN_HERE',
  learner2: 'PASTE_LEARNER_TWO_TOKEN_HERE',
};

export const STREAM_USERS = {
  host: {
    id: 'host-1',
    name: 'Instructor Ava',
    image: 'https://i.pravatar.cc/150?img=32',
  },
  learner1: {
    id: 'learner-1',
    name: 'Learner Kai',
    image: 'https://i.pravatar.cc/150?img=12',
  },
  learner2: {
    id: 'learner-2',
    name: 'Learner Noor',
    image: 'https://i.pravatar.cc/150?img=47',
  },
};

export type StreamUserMode = keyof typeof STREAM_USERS;
