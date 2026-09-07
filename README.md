# Dannon Pay Checkout

The page a customer actually pays on. One app, three ways in:

| Route | Used by |
|-------|---------|
| `/c/:accessCode` | Hosted checkout — the merchant redirects here |
| `/embed/:accessCode` | The same screen inside the popup the inline SDK opens |
| `/l/:slug` | A payment link, which opens a session and hands over to `/c` |

It talks only to the public checkout API, scoped by the access code in the URL.
No secret ever reaches this app, and it never decides that a payment succeeded:
every outcome it shows came from the server, which verified it with the provider
first.

## Running it

```bash
npm install
npm run dev          # http://localhost:8083
```

`VITE_API_URL` points at the gateway (default `http://localhost:3000/v1/api`).

## The inline SDK

`npm run build` copies the built SDK from `../dannonpay_inline/dist` to
`public/dannon.js`, so merchants can load it from this origin with a single
script tag. Build the SDK package first.

## Headers

`public/_headers` carries the baseline policy. The hosted route refuses framing
outright; `/embed` allows it, and the edge narrows `frame-ancestors` to the
domains a merchant has registered.

## Accessibility

Every screen is reachable and operable from the keyboard, form controls carry
real labels with errors tied to them, status changes are announced through live
regions, and focus moves to each new step. Merchant colours are applied through
CSS custom properties, with button text chosen by measured contrast so a pale
brand colour cannot produce unreadable text.
