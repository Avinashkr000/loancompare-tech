# LoanCompare API

Express + Prisma backend for authentication, lender comparison, applications and admin operations.

## Endpoints

`/api/health`, `/api/auth/*`, `/api/lenders/*`, `/api/applications/*`, `/api/profile`, `/api/admin/overview`.

The API expects PostgreSQL through `DATABASE_URL` and signs access tokens with `JWT_SECRET`.

Do not use the seeded admin credentials outside local development.
