# Architecture

## Frontend

React 19 + Vite + React Router. Public and authenticated routes live behind a shared product shell. `/dashboard` is a nested route with overview, applications, application detail, profile and admin pages.

## Backend

Express 5 with Helmet, CORS, Morgan and Zod. JWT bearer authentication protects user and admin endpoints. The loan domain service calculates EMI and lender-fit economics.

## Persistence

PostgreSQL stores users, lenders, applications, offers and audit logs. Prisma provides the data-access layer and migration history.

## Runtime

Docker Compose runs three services: PostgreSQL, Express API and Nginx-served Vite frontend. Nginx proxies `/api/*` to the API service and serves SPA routes through `index.html`.
