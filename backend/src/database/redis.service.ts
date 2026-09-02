import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const host = this.configService.get<string>('redis.host', '127.0.0.1');
    const port = this.configService.get<number>('redis.port', 6379);
    const password = this.configService.get<string>('redis.password');
    const tls = this.configService.get<boolean>('redis.tls', false);

    this.logger.log(`Initializing Redis client connecting to ${host}:${port} (TLS: ${tls})`);

    this.client = new Redis({
      host,
      port,
      password: password || undefined,
      tls: tls ? {} : undefined,
      enableOfflineQueue: false, // Don't block or queue API requests if Redis is offline/reconnecting
      retryStrategy: (times) => {
        const delay = Math.min(times * 100, 3000);
        return delay;
      },
      lazyConnect: true,
    });

    this.client.on('connect', () => {
      this.logger.log(`Connected to Redis instance on ${host}:${port}`);
    });

    this.client.on('error', (err) => {
      this.logger.warn(`Redis Connection Warning/Error (${host}:${port}): ${err.message}`);
    });

    this.client.connect().catch((err) => {
      this.logger.warn(`Initial Redis connection could not be established (${host}:${port}): ${err.message}`);
    });
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
      this.logger.log('Redis client disconnected');
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.client) return null;
    try {
      const data = await this.client.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error) {
      this.logger.warn(`Error reading key "${key}" from Redis: ${error instanceof Error ? error.message : error}`);
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    if (!this.client) return;
    try {
      const serialized = JSON.stringify(value);
      if (ttlSeconds > 0) {
        await this.client.set(key, serialized, 'EX', ttlSeconds);
      } else {
        await this.client.set(key, serialized);
      }
    } catch (error) {
      this.logger.warn(`Error setting key "${key}" in Redis: ${error instanceof Error ? error.message : error}`);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.client) return;
    try {
      await this.client.del(key);
    } catch (error) {
      this.logger.warn(`Error deleting key "${key}" from Redis: ${error instanceof Error ? error.message : error}`);
    }
  }

  async delByPattern(pattern: string): Promise<void> {
    if (!this.client) return;
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } catch (error) {
      this.logger.warn(`Error deleting pattern "${pattern}" from Redis: ${error instanceof Error ? error.message : error}`);
    }
  }
}
