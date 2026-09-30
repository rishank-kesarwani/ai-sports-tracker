import { CircuitBreaker, CircuitState } from './circuit-breaker';

describe('CircuitBreaker', () => {
  let breaker: CircuitBreaker;

  beforeEach(() => {
    breaker = new CircuitBreaker('TestService', {
      failureThreshold: 3,
      recoveryTimeoutMs: 100,
      requestTimeoutMs: 50,
    });
  });

  it('should start in CLOSED state', () => {
    expect(breaker.getState()).toBe(CircuitState.CLOSED);
  });

  it('should execute successfully when target function succeeds', async () => {
    const result = await breaker.execute(async () => 'success_data');
    expect(result).toBe('success_data');
    expect(breaker.getState()).toBe(CircuitState.CLOSED);
  });

  it('should transition to OPEN after reaching failure threshold', async () => {
    const failingFn = async () => {
      throw new Error('Service down');
    };

    for (let i = 0; i < 3; i++) {
      await expect(breaker.execute(failingFn)).rejects.toThrow('Service down');
    }

    expect(breaker.getState()).toBe(CircuitState.OPEN);
  });

  it('should use fallback when provided upon failure', async () => {
    const failingFn = async () => {
      throw new Error('Network timeout');
    };
    const fallbackFn = () => 'cached_fallback_value';

    const result = await breaker.execute(failingFn, fallbackFn);
    expect(result).toBe('cached_fallback_value');
  });

  it('should transition to HALF_OPEN after recovery timeout expires', async () => {
    const failingFn = async () => {
      throw new Error('Failure');
    };
    for (let i = 0; i < 3; i++) {
      await expect(breaker.execute(failingFn)).rejects.toThrow();
    }
    expect(breaker.getState()).toBe(CircuitState.OPEN);

    // Wait for recovery timeout
    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(breaker.getState()).toBe(CircuitState.HALF_OPEN);
  });
});
