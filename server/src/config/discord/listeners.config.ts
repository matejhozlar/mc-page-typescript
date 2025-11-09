export interface ListenersConfig {
  stats: {
    statsUpdateIntervalMs: number;
  };
  votes: {
    voteDurationMs: number;
    cooldown: {
      successMs: number;
      failMs: number;
    };
  };
}

const config = {
  stats: {
    statsUpdateIntervalMs: 30 * 60 * 1000,
  },
  votes: {
    voteDurationMs: 30_000,
    cooldown: {
      successMs: 577_100,
      failMs: 3 * 60_000,
    },
  },
} satisfies ListenersConfig;

export default config;
