export interface RuntimeConfig {
  middlewareUrl: string;
  maxMessagesPerPlayer: number;
  gameDurationSeconds: number;
  matchTimeoutSeconds: number;
}

declare global {
  interface Window {
    __HUMAN_VS_BOT_CONFIG__?: Partial<RuntimeConfig>;
  }
}

const DEFAULT_CONFIG: RuntimeConfig = {
  middlewareUrl: 'http://localhost:3000',
  maxMessagesPerPlayer: 10,
  gameDurationSeconds: 120,
  matchTimeoutSeconds: 10,
};

export function getRuntimeConfig(): RuntimeConfig {
  const browserConfig =
    typeof window !== 'undefined' ? window.__HUMAN_VS_BOT_CONFIG__ ?? {} : {};

  return {
    ...DEFAULT_CONFIG,
    ...browserConfig,
  };
}
