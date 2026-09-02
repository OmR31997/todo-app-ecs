export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    url: process.env.DATABASE_URL || 'postgresql://admin:admin123@127.0.0.1:5432/myapp?schema=public',
    user: process.env.POSTGRES_USER || 'admin',
    password: process.env.POSTGRES_PASSWORD || 'admin123',
    db: process.env.POSTGRES_DB || 'myapp',
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    host: process.env.POSTGRES_HOST || '127.0.0.1',
  },
  redis: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    tls: process.env.REDIS_TLS === 'true',
  },
});
