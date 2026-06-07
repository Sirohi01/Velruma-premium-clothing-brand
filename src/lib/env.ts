export function getRequiredEnv(name: string, developmentFallback?: string) {
  const value = process.env[name];
  if (value) return value;

  if (process.env.NODE_ENV !== 'production' && developmentFallback) {
    return developmentFallback;
  }

  throw new Error(`Missing required environment variable: ${name}`);
}

export function getJwtSecret() {
  return getRequiredEnv('JWT_SECRET', 'velruma-development-secret');
}

export function getAppUrl() {
  return getRequiredEnv('NEXT_PUBLIC_APP_URL', 'http://localhost:3000').replace(/\/$/, '');
}
