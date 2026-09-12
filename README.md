# LoanCompare

A responsive fintech frontend for comparing personal loan offers by interest rate, EMI, processing fee, total interest and total payable amount.

## Current MVP

- Interactive loan amount, tenure and credit score controls
- Dynamic EMI calculation
- Mock lender comparison cards
- Best-value offer highlighting
- Estimated savings between offers
- Responsive desktop and mobile layout
- Clear separation between frontend demo data and future backend integrations

## Tech stack

- React
- Vite
- CSS

## Run locally

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

## Next backend phase

The next implementation phase should introduce lender pricing APIs, bureau/eligibility checks, consent logging, authentication, application tracking and persistent storage.

> Note: Lender rates in the current frontend are illustrative mock data and are not live offers.
