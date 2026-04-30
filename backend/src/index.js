import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import courseRoutes from "./routes/courses.js";

const app = express();
const PORT = process.env.PORT || 3001;

// ---------------------------------------------------------------------------
// CORS — only allow requests from the configured frontend origin.
// In development, set FRONTEND_URL=http://localhost:5173 in your .env file.
// In production, set it to your deployed frontend domain (e.g. https://app.example.com).
// ---------------------------------------------------------------------------
const ALLOWED_ORIGINS = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow server-to-server / curl requests (no Origin header) only in dev
      if (!origin) {
        if (process.env.NODE_ENV === "production") {
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

app.get("/", (req, res) => {
  res.type("html").send(`<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Classroom API</title></head>
<body style="font-family:system-ui,sans-serif;max-width:40rem;margin:2rem auto;padding:0 1rem">
  <h1>Classroom API</h1>
  <p>This URL is the <strong>backend</strong> only. Open your <strong>static site</strong> URL to use the app.</p>
  <ul>
    <li><a href="/api/health">GET /api/health</a> — JSON health check</li>
  </ul>
</body></html>`);
});

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Classroom API" });
});

app.listen(PORT, () => {
  console.log(`Classroom API running on http://localhost:${PORT}`);
});
