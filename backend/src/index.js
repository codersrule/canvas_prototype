import "dotenv/config";
import express from "express";
import cors from "cors";
import { config } from "./config.js";
import { loginLimiter, apiLimiter } from "./middleware/rateLimiter.js";
import authRoutes from "./routes/auth.js";
import courseRoutes from "./routes/courses.js";

const app = express();

// ---------------------------------------------------------------------------
// Trust proxy -- required so express-rate-limit reads the real client IP
// from X-Forwarded-For when running behind nginx, Render, Railway, etc.
// Set to the number of trusted proxy hops in your infrastructure.
// ---------------------------------------------------------------------------
if (config.isProduction) {
  app.set("trust proxy", 1);
}

// ---------------------------------------------------------------------------
// CORS -- only allow requests from the configured frontend origin.
// ---------------------------------------------------------------------------
const ALLOWED_ORIGINS = config.frontendUrl
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        if (config.isProduction) {
          return callback(new Error("CORS: missing Origin header"), false);
        }
        return callback(null, true);
      }
      if (ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error(`CORS: origin '${origin}' not allowed`), false);
    },
    credentials: true,
  }),
);

app.use(express.json());

// ---------------------------------------------------------------------------
// Rate limiting
// loginLimiter  -- tight limit on the login endpoint only
// apiLimiter    -- broad safety-net on all /api/* routes
// ---------------------------------------------------------------------------
app.use("/api/auth/login", loginLimiter);
app.use("/api", apiLimiter);

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
app.get("/", (req, res) => {
  res.type("html").send(`<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Classroom API</title></head>
<body style="font-family:system-ui,sans-serif;max-width:40rem;margin:2rem auto;padding:0 1rem">
  <h1>Classroom API</h1>
  <p>This URL is the <strong>backend</strong> only. Open your <strong>static site</strong> URL to use the app.</p>
  <ul>
    <li><a href="/api/health">GET /api/health</a> -- JSON health check</li>
  </ul>
</body></html>`);
});

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Classroom API" });
});

app.listen(config.port, () => {
  console.log(`Classroom API running on http://localhost:${config.port}`);
});
