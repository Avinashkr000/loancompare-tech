# LoanCompare Go API

The production API runtime for LoanCompare is implemented in Go using Gin, PostgreSQL, JWT and bcrypt.

## Runtime

- Go 1.24
- Gin HTTP API
- PostgreSQL via pgx
- JWT authentication
- bcrypt password hashing
- CORS
- Docker-ready

## API

Base path: `/api/v1`

- `GET /health`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `GET /api/v1/lenders`
- `POST /api/v1/lenders/compare`
- `GET /api/v1/applications`
- `POST /api/v1/applications`
- `GET /api/v1/applications/:id`
- `POST /api/v1/applications/:id/select-offer/:offerId`
- `GET /api/v1/profile`
- `PUT /api/v1/profile`
- `GET /api/v1/admin/overview`

The API keeps the existing PostgreSQL data model, avoiding a destructive database rewrite during the backend runtime migration.
