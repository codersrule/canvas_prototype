# Classroom API

Node.js + Express backend with Prisma (SQLite) and JWT auth.

## Setup

```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma db push
npm run db:seed
```

## Run

```bash
npm run dev
```

API runs at `http://localhost:3001`

## Endpoints

- `POST /api/auth/login` – Login (email, password) → `{ token, user }`
- `GET /api/auth/me` – Current user (requires `Authorization: Bearer <token>`)
- `GET /api/courses` – List enrolled courses (auth required)
- `GET /api/courses/:id` – Course detail (auth required)

## Seed users

| Email | Password | Role |
|-------|----------|------|
| prof.chen@classroom.edu | password123 | teacher |
| sadiq@classroom.edu | password123 | student |

## Frontend

Set `VITE_API_URL=http://localhost:3001` in frontend `.env` to use the API.
