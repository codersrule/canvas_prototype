/**
 * rateLimiter.js — express-rate-limit configuration.
 *
 * Two limiters are exported:
 *
 *  loginLimiter  — tight window applied only to POST /api/auth/login.
 *                  Blocks brute-force and credential-stuffing attacks.
 *
 *  apiLimiter    — broad safety-net applied to all /api/* routes.
 *                  Prevents general abuse / scraping.
 *
 * Counts are keyed by IP address by default.  Behind a trusted reverse proxy
 * (nginx, Render, Railway, etc.) set trust proxy in Express so the real
 * client IP is read from X-Forwarded-For instead of the proxy address.
 * In index.js: app.set('trust proxy', 1)
 *
 * Window sizes and max counts are tunable via environment variables so you
 * can tighten or relax limits per environment without a code change.
 */

import rateLimit from "express-rate-limit";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function envInt(name, fallback) {
  const val = parseInt(process.env[name], 10);
  return Number.isFinite(val) ? val : fallback;
}

// ---------------------------------------------------------------------------
// Login limiter — 10 attempts per 15 minutes per IP.
// After the window expires the counter resets automatically.
// ---------------------------------------------------------------------------
export const loginLimiter = rateLimit({
  windowMs: envInt("LOGIN_RATE_WINDOW_MS", 15 * 60 * 1000), // 15 min default
  max: envInt("LOGIN_RATE_MAX", 10),
  standardHeaders: "draft-7", // Emit RateLimit-* headers (RFC 9110 draft)
  legacyHeaders: false, // Disable X-RateLimit-* legacy headers
  skipSuccessfulRequests: true, // Only count failed/error responses toward the limit
  message: {
    error: "Too many login attempts. Please try again later.",
  },
  // Log rate-limit hits server-side so you can monitor attack patterns.
  handler(req, res, next, options) {
    console.warn(
      `[rateLimiter] Login rate limit exceeded — IP: ${req.ip} ` +
        `at ${new Date().toISOString()}`,
    );
    res.status(options.statusCode).json(options.message);
  },
});

// ---------------------------------------------------------------------------
// General API limiter — 300 requests per 15 minutes per IP.
// A loose catch-all to prevent scraping and general abuse.
// ---------------------------------------------------------------------------
export const apiLimiter = rateLimit({
  windowMs: envInt("API_RATE_WINDOW_MS", 15 * 60 * 1000), // 15 min default
  max: envInt("API_RATE_MAX", 300),
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    error: "Too many requests. Please slow down and try again later.",
  },
});
