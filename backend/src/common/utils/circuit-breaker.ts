import { Logger } from '@nestjs/common';

export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

export interface CircuitBreakerOptions {
  failureThreshold?: number;
  recoveryTimeoutMs?: number;
  requestTimeoutMs?: number;
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private lastFailureTime = 0;
  private readonly failureThreshold: number;
  private readonly recoveryTimeoutMs: number;
  private readonly requestTimeoutMs: number;
  private readonly logger: Logger;

  constructor(
    private readonly serviceName: string,
    options: CircuitBreakerOptions = {},
  ) {
    this.failureThreshold = options.failureThreshold || 5;
    this.recoveryTimeoutMs = options.recoveryTimeoutMs || 30000;
    this.requestTimeoutMs = options.requestTimeoutMs || 5000;
    this.logger = new Logger(`CircuitBreaker:${serviceName}`);
  }

  public getState(): CircuitState {
    if (this.state === CircuitState.OPEN) {
      const now = Date.now();
      if (now - this.lastFailureTime > this.recoveryTimeoutMs) {
        this.state = CircuitState.HALF_OPEN;
        this.logger.warn(`Circuit for ${this.serviceName} is now HALF_OPEN. Testing connectivity...`);
      }
    }
    return this.state;
  }

  public async execute<T>(fn: () => Promise<T>, fallback?: () => Promise<T> | T): Promise<T> {
    const currentState = this.getState();

    if (currentState === CircuitState.OPEN) {
      this.logger.warn(`Circuit for ${this.serviceName} is OPEN. Executing fallback immediately.`);
      if (fallback) {
        return fallback();
      }
      throw new Error(`CircuitBreaker: ${this.serviceName} service is currently unavailable (OPEN).`);
    }

    try {
      const result = await Promise.race([
        fn(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout of ${this.requestTimeoutMs}ms exceeded for ${this.serviceName}`)), this.requestTimeoutMs),
        ),
      ]);

      this.onSuccess();
      return result;
    } catch (error: any) {
      this.onFailure(error);
      if (fallback) {
        this.logger.log(`Using fallback response for ${this.serviceName} due to error: ${error?.message}`);
        return fallback();
      }
      throw error;
    }
  }

  private onSuccess(): void {
    if (this.state === CircuitState.HALF_OPEN) {
      this.logger.log(`Circuit for ${this.serviceName} has recovered and is now CLOSED.`);
    }
    this.failureCount = 0;
    this.state = CircuitState.CLOSED;
  }

  private onFailure(error: any): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    this.logger.error(`Call to ${this.serviceName} failed (${this.failureCount}/${this.failureThreshold}): ${error?.message}`);

    if (this.failureCount >= this.failureThreshold || this.state === CircuitState.HALF_OPEN) {
      this.state = CircuitState.OPEN;
      this.logger.error(`Circuit for ${this.serviceName} has tripped and is now OPEN for ${this.recoveryTimeoutMs}ms`);
    }
  }

  public getMetrics() {
    return {
      service: this.serviceName,
      state: this.getState(),
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime ? new Date(this.lastFailureTime).toISOString() : null,
    };
  }
}
