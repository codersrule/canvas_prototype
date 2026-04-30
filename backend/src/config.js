/**
 * config.js — single source of truth for environment variables.
 *
 * Rules:
 *  - Required vars must be present in all environments.
 *  - Production-only vars are enforced when NODE_ENV=production.
 *  - The process exits immediately (fail-fast) if a required var is missing,
 *    so misconfigured deployments surface at startup rather than at runtime.
 */

const IS_PRODUCTION = process.env.NODE_ENV === "production";

// ---------------------------------------------------------------------------
// Validators
// ---------------------------------------------------------------------------

function requireEnv(name) {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    console.error(
      `[config] FATAL: environment variable "${name}" is required but not set.`,
    );
    process.exit(1);
  }
  return value.trim();
}

function requireEnvInProduction(name, devFallback) {
  const value = process.env[name]?.trim();
  if (IS_PRODUCTION && (!value || value === "")) {
    console.error(
      `[config] FATAL: environment variable "${name}" must be set in production. ` +
        `Do not rely on the development fallback.`,
    );
    process.exit(1);
  }
  if (IS_PRODUCTION && value === devFallback) {
    console.error(
      `[config] FATAL: "${name}" is still set to the insecure development default ("${devFallback}"). ` +
        `Set a strong, unique secret in production.`,
    );
    process.exit(1);
  }
  return value || devFallback;
}

// ---------------------------------------------------------------------------
// Exported config — import this everywhere instead of reading process.env directly.
// ---------------------------------------------------------------------------

export const config = Object.freeze({
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction: IS_PRODUCTION,

  port: parseInt(process.env.PORT || "3001", 10),

  // JWT — weak/missing secret causes immediate startup failure in production.
  jwtSecret: requireEnvInProduction("JWT_SECRET", "dev-secret"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",

  // CORS — all allowed frontend origins (comma-separated).
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",

  // Database — always required.
  databaseUrl: requireEnv("DATABASE_URL"),
});
