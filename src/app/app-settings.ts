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

const PRODUCTION_MIDDLEWARE_URL = 'https://humanvsbot-middleware.onrender.com';

const DEFAULT_CONFIG: RuntimeConfig = {
  middlewareUrl: PRODUCTION_MIDDLEWARE_URL,
  maxMessagesPerPlayer: 10,
  gameDurationSeconds: 120,
  matchTimeoutSeconds: 10,
};

function isLocalBrowserHost(hostname: string): boolean {
  return ['localhost', '127.0.0.1', '0.0.0.0', '::1'].includes(hostname);
}

function normalizeMiddlewareUrl(url: string): string {
  return url.trim().replace(/\/$/, '');
}

function isLocalMiddlewareUrl(url: string): boolean {
  try {
    return isLocalBrowserHost(new URL(url).hostname);
  } catch {
    return url.includes('localhost') || url.includes('127.0.0.1');
  }
}

export function getRuntimeConfig(): RuntimeConfig {
  const isBrowser = typeof window !== 'undefined';
  const browserConfig =
    isBrowser ? window.__HUMAN_VS_BOT_CONFIG__ ?? {} : {};

  const configuredMiddlewareUrl = normalizeMiddlewareUrl(
    browserConfig.middlewareUrl ?? DEFAULT_CONFIG.middlewareUrl,
  );

  const isDeployedBrowser =
    isBrowser && !isLocalBrowserHost(window.location.hostname);

  const middlewareUrl =
    isDeployedBrowser && isLocalMiddlewareUrl(configuredMiddlewareUrl)
      ? PRODUCTION_MIDDLEWARE_URL
      : configuredMiddlewareUrl;

  if (
    isDeployedBrowser &&
    configuredMiddlewareUrl !== middlewareUrl
  ) {
    console.warn(
      'Ignoring localhost middleware URL in deployed frontend. Check public/config.js.',
    );
  }

  return {
    ...DEFAULT_CONFIG,
    ...browserConfig,
    middlewareUrl,
  };
}
