# Full Stack Roadmap – Classroom

What’s needed to turn the Classroom prototype into a full stack application.

---

## 0. Implementation Status

| Component | Status | Notes |
|-----------|--------|-------|
| **Backend** | Done | Express + Prisma (SQLite) |
| **Auth API** | Done | `POST /api/auth/login`, `GET /api/auth/me`, JWT |
| **Courses API** | Done | `GET /api/courses`, `GET /api/courses/:id` |
| **Frontend API client** | Done | `api/login`, `api.getCourses`, `api.getCourse` |
| **Courses page** | Done | Fetches from API when `VITE_API_URL` set |
| **Course detail** | Done | Fetches from API, merges with local grade/submission stores |
| Assignments (submit) | Pending | |
| Grades (submit/list) | Pending | |
| Announcements CRUD | Pending | |
| Discussions CRUD | Pending | |

**To run:** `cd backend && npm run dev`, set `VITE_API_URL=http://localhost:3001` in frontend `.env`, then `cd frontend && npm run dev`.

---

## 1. Current State

- **Frontend only** – React + Vite
- **Mock data** – Static data in `js/shared/`, `js/teacher/`, `frontend/src/data/`
- **Client-side storage** – `localStorage` for auth and settings; in-memory stores for submissions, grades, created announcements/assignments
- **No backend or database** – Data is lost on refresh except what’s stored in `localStorage`

---

## 2. Requirements for a Full Stack

### 2.1 Backend Server

- **Choose a runtime** – Node.js (Express, Fastify) or Python (FastAPI, Django)
- **Role** – Handle authentication, business logic, validation
- **Deployment** – Serve API and optionally the frontend

### 2.2 Database

- **Relational DB** – PostgreSQL for users, courses, assignments, submissions, grades, enrollments
- **Schema examples** – `users`, `courses`, `enrollments`, `assignments`, `submissions`, `grades`, `announcements`, `discussions`, `files`, etc.
- **Migrations** – Manage schema changes

### 2.3 API Layer

- **Style** – REST or GraphQL
- **Replace mocks** with real endpoints, e.g.:
  - Auth: `POST /login`, `POST /logout`, `GET /me`
  - Courses: `GET /courses`, `GET /courses/:id`
  - Assignments: `GET /courses/:id/assignments`, `POST /courses/:id/assignments/:id/submit`
  - Grades: `GET /grades`, `POST /courses/:id/assignments/:id/grade`
  - Announcements: `GET/POST /courses/:id/announcements`
  - Discussions: `GET/POST /courses/:id/discussions`, `GET/POST /courses/:id/discussions/:id/replies`
  - Files: upload and download endpoints

### 2.4 Authentication

- **Replace mock login** with real auth:
  - JWT (stateless) or session cookies (stateful)
  - Password hashing (bcrypt/argon2)
  - Optional: OAuth (Google, institutional SSO)
- **Auth middleware** for protected API routes
- **Refresh tokens** for longer-lived sessions (optional)

### 2.5 File Storage

- **For** – Assignment uploads, avatars, course materials
- **Options** – Local disk or cloud (S3, Cloud Storage)
- **Access** – Signed URLs or proxied routes

### 2.6 Frontend Changes

- **Swap mock data** for `fetch`/`axios` or a GraphQL client
- **Centralized API client** – Base URL, auth headers, error handling
- **Loading and error states** for async operations
- **Auth persistence** – Use tokens/session from backend instead of `localStorage` only

### 2.7 Optional / Later

- **Real-time** – WebSockets for notifications and live updates
- **Email** – Password reset, notifications
- **Caching** – Redis for sessions or frequently accessed data
- **Testing** – API tests (Jest/Supertest) and frontend integration tests
- **Deployment** – Docker, CI/CD, hosting (e.g. Vercel for frontend, Railway/Render for backend)

---

## 3. Suggested Tech Stack

| Layer       | Option 1             | Option 2                 |
|------------|----------------------|--------------------------|
| **Backend** | Node.js + Express    | Python + FastAPI         |
| **Database** | PostgreSQL + Prisma | PostgreSQL + SQLAlchemy |
| **Auth**    | JWT + bcrypt         | JWT + passlib            |
| **Files**   | Multer + S3          | Upload handling + S3     |
| **Deploy**  | Railway / Render     | Same                     |

---

## 4. Effort Estimate

| Scope  | Description                                              |
|--------|----------------------------------------------------------|
| **Minimal** | Auth and basic CRUD for core entities                  |
| **Full parity** | All prototype features backed by DB and APIs         |
| **Production-ready** | Security, email, tests, deployment, scaling      |

---

*Last updated: Feb 11, 2026*
