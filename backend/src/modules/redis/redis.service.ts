import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis | null = null;
  private readonly logger = new Logger(RedisService.name);
  private isConnected = false;
  private inMemoryFallback = new Map<string, { value: string; expiresAt: number | null }>();

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const redisUrl = this.configService.get<string>('redis.url');
    const host = this.configService.get<string>('redis.host', 'localhost');
    const port = this.configService.get<number>('redis.port', 6379);
    const password = this.configService.get<string>('redis.password');

    const commonOptions = {
      retryStrategy: (times: number) => {
        if (times > 5) {
          this.logger.warn(`Redis reconnection stopped after ${times} retries. Using in-memory fallback.`);
          return null;
        }
        return Math.min(times * 500, 3000);
      },
      maxRetriesPerRequest: 2,
      enableOfflineQueue: false,
      lazyConnect: true,
    };

    try {
      if (redisUrl && redisUrl.trim()) {
        this.client = new Redis(redisUrl.trim(), commonOptions);
      } else {
        this.client = new Redis({
          host,
          port,
          password: password || undefined,
          ...commonOptions,
        });
      }

      this.client.on('connect', () => {
        this.isConnected = true;
        this.logger.log(`Connected to Redis (${redisUrl ? 'via REDIS_URL' : `${host}:${port}`})`);
      });

      this.client.on('error', (err) => {
        this.isConnected = false;
        this.logger.warn(`Redis connection error: ${err.message}. Operating in fallback mode.`);
      });

      this.client.connect().catch((err) => {
        this.isConnected = false;
        this.logger.warn(`Initial Redis connection failed: ${err.message}. In-memory cache enabled.`);
      });
    } catch (e: any) {
      this.isConnected = false;
      this.logger.warn(`Failed to initialize Redis client: ${e.message}`);
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit().catch(() => {});
    }
  }

  public getIsConnected(): boolean {
    return this.isConnected;
  }

  public async get<T = any>(key: string): Promise<T | null> {
    if (this.isConnected && this.client) {
      try {
        const data = await this.client.get(key);
        if (!data) return null;
        return JSON.parse(data) as T;
      } catch (err: any) {
        this.logger.warn(`Redis get error on ${key}: ${err.message}`);
      }
    }

    // In-memory fallback
    const item = this.inMemoryFallback.get(key);
    if (!item) return null;
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.inMemoryFallback.delete(key);
      return null;
    }
    return JSON.parse(item.value) as T;
  }

  public async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    const serialized = JSON.stringify(value);

    if (this.isConnected && this.client) {
      try {
        if (ttlSeconds && ttlSeconds > 0) {
          await this.client.set(key, serialized, 'EX', ttlSeconds);
        } else {
          await this.client.set(key, serialized);
        }
        return;
      } catch (err: any) {
        this.logger.warn(`Redis set error on ${key}: ${err.message}`);
      }
    }

    // In-memory fallback
    const expiresAt = ttlSeconds && ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : null;
    this.inMemoryFallback.set(key, { value: serialized, expiresAt });
  }

  public async del(key: string): Promise<void> {
    if (this.isConnected && this.client) {
      try {
        await this.client.del(key);
      } catch (err: any) {
        this.logger.warn(`Redis del error on ${key}: ${err.message}`);
      }
    }
    this.inMemoryFallback.delete(key);
  }

  public async delPattern(pattern: string): Promise<void> {
    if (this.isConnected && this.client) {
      try {
        const keys = await this.client.keys(pattern);
        if (keys.length > 0) {
          await this.client.del(...keys);
        }
      } catch (err: any) {
        this.logger.warn(`Redis delPattern error on ${pattern}: ${err.message}`);
      }
    }

    const regex = new RegExp(`^${pattern.replace(/\*/g, '.*')}$`);
    for (const key of this.inMemoryFallback.keys()) {
      if (regex.test(key)) {
        this.inMemoryFallback.delete(key);
      }
    }
  }

  /**
   * Acquire a distributed lock with TTL
   */
  public async acquireLock(lockName: string, ttlSeconds = 10): Promise<boolean> {
    const key = `sports:lock:${lockName}`;
    if (this.isConnected && this.client) {
      try {
        const result = await this.client.set(key, 'locked', 'EX', ttlSeconds, 'NX');
        return result === 'OK';
      } catch (err: any) {
        this.logger.warn(`Redis acquireLock error on ${lockName}: ${err.message}`);
      }
    }

    const item = this.inMemoryFallback.get(key);
    if (item && (!item.expiresAt || Date.now() <= item.expiresAt)) {
      return false;
    }
    this.inMemoryFallback.set(key, { value: 'locked', expiresAt: Date.now() + ttlSeconds * 1000 });
    return true;
  }

  public async releaseLock(lockName: string): Promise<void> {
    await this.del(`sports:lock:${lockName}`);
  }
}
