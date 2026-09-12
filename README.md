# LoanCompare

LoanCompare is a full-stack fintech prototype for comparing personal-loan economics, creating applications and carrying a selected offer into an application workflow.

## Product surfaces

- `/` — product landing experience
- `/compare` — live loan comparison workspace
- `/login` and `/register` — authentication
- `/dashboard` — authenticated decision workspace
- `/dashboard/applications` — application list
- `/dashboard/applications/:id` — offer selection and application detail
- `/dashboard/profile` — user profile
- `/dashboard/admin` — admin metrics and recent applications
- `/how-it-works` — product flow

## Architecture

```text
Browser
  │
  ▼
React + Vite + React Router
  │  /api/*
  ▼
Nginx reverse proxy
  │
  ▼
Express API ── JWT auth ── Zod validation ── Prisma
  │                                      │
  ▼                                      ▼
Loan domain services                    PostgreSQL
(offers, EMI, eligibility fit)          (persistent data)
```

### Backend modules

- `server/src/routes/auth.js` — registration, login, session lookup
- `server/src/routes/lenders.js` — lender catalog and comparison engine
- `server/src/routes/applications.js` — create applications, persist offers, select offers
- `server/src/routes/profile.js` — profile updates and password change
- `server/src/routes/admin.js` — role-protected operational overview
- `server/prisma/schema.prisma` — relational domain model
- `server/prisma/migrations/` — PostgreSQL migration history
- `server/prisma/seed.js` — lender fixtures and local admin

## Database model

`User` → `LoanApplication` → `LoanOffer` → `Lender`

`AuditLog` records login, application creation and offer-selection events.

## Run everything with Docker

```bash
cp server/.env.example server/.env
# change JWT_SECRET before any shared/prod deployment

docker compose up --build
```

Open `http://localhost:8080`.

The stack includes:

- PostgreSQL 17
- Express API on port 4000 (internal to Compose)
- Nginx + Vite production frontend on port 8080
- Persistent Postgres volume
- Prisma migrations + seed on API startup

### Demo admin

Email: `admin@loancompare.local`
Password: `Admin@12345`

Change/remove these credentials before any real deployment.

## Run services separately

Frontend:

```bash
npm install
npm run dev
```

Backend:

```bash
cd server
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

In frontend development, Vite proxies `/api` to `http://localhost:4000`.

## API surface

### Public

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/lenders`
- `POST /api/lenders/compare`

### Authenticated

- `GET /api/auth/me`
- `GET /api/profile`
- `PUT /api/profile`
- `GET /api/applications`
- `GET /api/applications/:id`
- `POST /api/applications`
- `POST /api/applications/:id/select-offer/:offerId`

### Admin

- `GET /api/admin/overview`

## Production integration points

The current lender values are deliberately illustrative. Production integrations should replace the seeded lender catalog with authenticated lender APIs and add bureau/eligibility providers, consent records, KYC/document workflows, rate versioning, webhook processing, secrets management and observability.
