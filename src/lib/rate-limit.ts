type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const attempts = new Map<
  string,
  RateLimitEntry
>();

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export function checkRateLimit(
  key: string
) {
  const now = Date.now();

  const existing =
    attempts.get(key);

  if (
    !existing ||
    existing.resetAt <= now
  ) {
    attempts.set(key, {
      count: 1,
      resetAt:
        now + WINDOW_MS,
    });

    return {
      allowed: true,
      retryAfter: 0,
    };
  }

  if (
    existing.count >=
    MAX_ATTEMPTS
  ) {
    return {
      allowed: false,
      retryAfter: Math.ceil(
        (existing.resetAt - now) /
          1000
      ),
    };
  }

  existing.count += 1;

  return {
    allowed: true,
    retryAfter: 0,
  };
}