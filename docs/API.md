# LoanCompare API contract

Base path: `/api`

## Authentication

`POST /auth/register`

Body: `email`, `password`, `fullName`, optional `phone`.

`POST /auth/login`

Body: `email`, `password`.

Both return `{ token, user }`. Send `Authorization: Bearer <token>` for protected routes.

## Comparison

`POST /lenders/compare`

```json
{ "amount": 900000, "tenureMonths": 48, "creditScore": 770, "purpose": "PERSONAL" }
```

Response contains ranked lender offers with annual rate, EMI, total interest, processing fee, total payable and fit score.

## Applications

`POST /applications` creates an application and persists the eligible lender offers.

`GET /applications` lists the authenticated user's applications.

`GET /applications/:id` returns one application and its offers.

`POST /applications/:id/select-offer/:offerId` selects an offer and advances status to `OFFER_SELECTED`.
