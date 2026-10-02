export default () => ({
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  publicAccessEnabled: process.env.PUBLIC_ACCESS_ENABLED !== 'false',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/sports-tracker',
  },
  redis: {
    url: process.env.REDIS_URL,
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'sports_tracker_super_secret_access_jwt_key_2026',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'sports_tracker_super_secret_refresh_jwt_key_2026',
    accessExpiration: process.env.JWT_ACCESS_EXPIRATION || '15m',
    refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
  },
  sportsDb: {
    apiKey: process.env.SPORTS_DB_API_KEY || '3',
    baseUrl: process.env.SPORTS_DB_BASE_URL || 'https://www.thesportsdb.com/api/v1/json',
    timeoutMs: parseInt(process.env.SPORTS_DB_TIMEOUT_MS || '5000', 10),
    enableMockFallback: process.env.ENABLE_MOCK_FALLBACK !== 'false',
  },
  aiPlatform: {
    url: process.env.AI_PLATFORM_URL || 'http://localhost:4001',
    apiKey: process.env.AI_PLATFORM_API_KEY || 'ai-platform-dev-token-2026',
    timeoutMs: parseInt(process.env.AI_PLATFORM_TIMEOUT_MS || '10000', 10),
  },
  notificationService: {
    url: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:4002',
    apiKey: process.env.NOTIFICATION_SERVICE_API_KEY || 'notification-service-dev-token-2026',
    timeoutMs: parseInt(process.env.NOTIFICATION_SERVICE_TIMEOUT_MS || '5000', 10),
  },
  rateLimit: {
    ttl: parseInt(process.env.RATE_LIMIT_TTL || '60', 10),
    limit: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  },
});
