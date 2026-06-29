import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock environment variables before importing
const originalEnv = process.env;
beforeEach(() => {
  vi.resetModules();
  process.env = { ...originalEnv, RATE_LIMIT_WINDOW_MS: '1000', RATE_LIMIT_MAX_REQUESTS: '5' };
});

describe('getRateLimitKey', () => {
  it('should return the x-forwarded-for IP', async () => {
    const { getRateLimitKey } = await import('../lib/rate-limiter');
    const req = new Request('http://localhost', {
      headers: { 'x-forwarded-for': '203.0.113.42' },
    });
    expect(getRateLimitKey(req)).toBe('203.0.113.42');
  });

  it('should use first IP from comma-separated list', async () => {
    const { getRateLimitKey } = await import('../lib/rate-limiter');
    const req = new Request('http://localhost', {
      headers: { 'x-forwarded-for': '203.0.113.42, 10.0.0.1, 192.168.1.1' },
    });
    expect(getRateLimitKey(req)).toBe('203.0.113.42');
  });

  it('should fallback to 127.0.0.1 when no header present', async () => {
    const { getRateLimitKey } = await import('../lib/rate-limiter');
    const req = new Request('http://localhost');
    expect(getRateLimitKey(req)).toBe('127.0.0.1');
  });

  it('should validate IPv4 format', async () => {
    const { getRateLimitKey } = await import('../lib/rate-limiter');
    const req = new Request('http://localhost', {
      headers: { 'x-forwarded-for': 'not-an-ip' },
    });
    expect(getRateLimitKey(req)).toBe('127.0.0.1');
  });
});

describe('checkRateLimit (fallback)', () => {
  it('should allow requests under the limit', async () => {
    const { checkRateLimit } = await import('../lib/rate-limiter');
    const result = await checkRateLimit('test-ip-1');
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBeGreaterThanOrEqual(0);
  });

  it('should track remaining count', async () => {
    const { checkRateLimit } = await import('../lib/rate-limiter');
    const result1 = await checkRateLimit('test-ip-2');
    expect(result1.allowed).toBe(true);
    expect(result1.remaining).toBe(4);
  });
});
