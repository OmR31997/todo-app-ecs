const Redis = require('ioredis');
const path = require('path');
const fs = require('fs');

// Attempt to load environment variables from .env if present
try {
  const envPath = path.resolve(__dirname, '../../../.env');
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf-8');
    envConfig.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, ...valueParts] = trimmed.split('=');
        const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
        if (key && !process.env[key.trim()]) {
          process.env[key.trim()] = value;
        }
      }
    });
  }
} catch (e) {
  // Ignore error if .env is missing or unreadable
}

async function clearRedis() {
  const host = process.env.REDIS_HOST || '127.0.0.1';
  const port = parseInt(process.env.REDIS_PORT || '6379', 10);
  const password = process.env.REDIS_PASSWORD || undefined;
  const tls = process.env.REDIS_TLS === 'true';

  console.log(`Connecting to Redis at ${host}:${port}...`);

  const redis = new Redis({
    host,
    port,
    password,
    tls: tls ? {} : undefined,
    connectTimeout: 5000,
    maxRetriesPerRequest: 1,
  });

  try {
    const result = await redis.flushall();
    console.log(`[Success] Redis cache cleared: ${result}`);
    await redis.quit();
    process.exit(0);
  } catch (error) {
    console.error(`[Error] Failed to clear Redis cache:`, error instanceof Error ? error.message : error);
    try {
      await redis.quit();
    } catch {
      // Ignore disconnect errors on failure
    }
    process.exit(1);
  }
}

clearRedis();
