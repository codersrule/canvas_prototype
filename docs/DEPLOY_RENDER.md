# Deploying to Render (fix “Failed to fetch” and blank routes)

## “Cannot GET /” on the Web Service URL

The **Web Service** (`https://your-api.onrender.com`) is the **API only**. It is normal that there was no page at `/` until the backend defines a root handler. After updating the backend, `GET /` shows a short HTML page pointing to `/api/health`.

**The React app** is a separate **Static Site** on Render. Users should open the **static site URL** in the browser, not the API URL. Set `VITE_API_URL` on the static site to this API URL so the frontend can call `/api/...`.

### Build commands (Root Directory = `backend`)

Use **only** the command, not a shell prompt:

| Field | Correct |
|-------|---------|
| Build Command | `npm install` |
| Start Command | `npm start` |

Do **not** put `backend/ $` in the command field; **Root Directory** already scopes to `backend/`.

### Static Site (Root Directory = `frontend`)

[Render’s monorepo docs](https://render.com/docs/monorepo-support) state that the **Publish directory** is relative to the **service root directory**, same as the build command.

| Field | Use |
|-------|-----|
| Root Directory | `frontend` |
| Build Command | `npm install && npm run build` (or `npm run build` if you rely on Render’s default `npm install`) |
| Publish Directory | **`dist`** (Vite output under `frontend/`) |

Use **`dist`**, not `frontend/dist`. With root `frontend`, `frontend/dist` would point at a non-existent `frontend/frontend/dist`.

Put **`VITE_API_URL`** = your Web Service URL (e.g. `https://canvas-prototype-9voc.onrender.com`, no trailing slash) under **Environment** for the static site, then redeploy so Vite embeds it.

---

## Why you see “Failed to fetch” on login

The React app only calls the backend when **`VITE_API_URL`** was set **when the static site was built**. If it is missing or wrong:

- The bundle may still try `http://localhost:3001` (not reachable from users’ browsers) → **Failed to fetch**.
- Or it points to a sleeping / wrong API URL.

**Vite bakes `VITE_API_URL` into the JS at build time.** Changing env vars on Render **without** a new build does not update old `dist/` files.

### Fix (static site on Render)

1. Open your **Static Site** service on Render.
2. **Environment** → add:
   - `VITE_API_URL` = `https://<your-web-service-name>.onrender.com`  
     (exact URL of your **Web Service** API, **no** trailing slash)
3. **Manual Deploy** → **Clear build cache & deploy** (or push a commit) so the site **rebuilds**.

### Fix (API Web Service)

1. Web Service must be **live** (check `/api/health` in the browser: should return JSON).
2. Use **HTTPS** URL in `VITE_API_URL` (same as Render gives you).
3. Free tier APIs **sleep**; first request after idle can take ~30–60s (looks like a hang, not always “Failed to fetch”).

### Optional: frontend-only (no API)

Do **not** set `VITE_API_URL` on the static site. Rebuild. Login then uses the **mock** user (no network call).

---

## Why direct URLs like `/teacher` show a blank page

Client-side routers need the server to serve `index.html` for unknown paths.

This repo includes `frontend/public/_redirects` so hosts that honor it (including many static setups) rewrite `/*` → `/index.html`.

If your host ignores `_redirects`, configure **SPA / rewrite** in the dashboard so all routes serve `index.html` with status 200.

---

## Quick checklist

| Step | Action |
|------|--------|
| 1 | Deploy **backend** as Web Service (`backend/`, `npm start`) |
| 2 | Set backend `DATABASE_URL` (e.g. Render Postgres), `JWT_SECRET`, run `prisma db push` / migrate if needed |
| 3 | Deploy **frontend** as Static Site (`frontend/`, build `npm run build`, publish `dist`) |
| 4 | Set **`VITE_API_URL`** on the **static site** to the backend **https** URL |
| 5 | **Redeploy** the static site after changing `VITE_API_URL` |
| 6 | Confirm `https://your-api.onrender.com/api/health` works in the browser |

---

## CORS

The backend uses `cors({ origin: true })`, which should allow browser requests from your static site origin. If you lock CORS down later, add your static site URL explicitly.
