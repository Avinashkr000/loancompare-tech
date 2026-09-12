# Testing checklist

- Frontend build: `npm run build`
- Backend checks: `cd server && npm run check`
- Full stack: `docker compose up --build`
- Health: `GET http://localhost:8080/api/health`
- Register/login → compare → create application → select offer → dashboard detail
