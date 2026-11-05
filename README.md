# Natural Oil

Online store for unrefined, wooden-kolhu-pressed oils, with a live Postgres database (Neon) and a shop admin panel.

**Shop:** live prices and stock, a slide-in cart with coupons and a free-shipping bar, checkout, payment (demo mode), order confirmation, an order page that updates itself as the order moves, order tracking, verified-buyer reviews, "someone in Chennai just bought…" notices from real orders, and a newsletter signup.

**Admin (`/admin`):** live dashboard (revenue, daily chart, best sellers, low stock), orders (filter, search, one-click *packed → shipped → delivered*, cancel with automatic restock), prices & stock editing that goes live instantly, review moderation, subscriber list.

## Set up on your computer

You need [Node.js](https://nodejs.org) 20 or newer.

```bash
npm install
```

```bash
npm run setup
```

`npm run setup` asks you to paste your database connection string. In Neon: open the project → **Connect** → turn on **Show password** → **Copy snippet**, then paste it. The command then:

- writes `.env` (your password stays on your computer; `.env` is in `.gitignore` and is never pushed),
- creates an admin password and prints it,
- creates all tables and puts opening stock on every size.

Then start the shop:

```bash
npm run dev
```

- Shop: http://localhost:3002
- Admin: http://localhost:3002/admin (password: `ADMIN_PASSWORD` in `.env`)

Prefer to do it by hand? Copy `.env.example` to `.env` and fill in `DATABASE_URL` and `ADMIN_PASSWORD`. Tables are also created automatically the first time the shop talks to the database.

## Try the whole flow

1. Buy something in the shop (pay with any UPI ID like `name@okbank`, or cash on delivery).
2. In `/admin/orders`, click **Mark packed**, then open the order and mark it **shipped** and **delivered**. The customer's order page updates by itself.
3. On the customer's order page a review form appears after delivery. The review shows on the product page with a *Verified buyer* badge.
4. In `/admin/products`, set a size's stock to 0: it shows *Sold out* in the shop and the server refuses to sell it.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Run the shop locally on port 3002 |
| `npm run setup` | Create `.env`, an admin password, and the database tables |
| `npm test` | Pricing tests; database tests too when `TEST_DATABASE_URL` points at a throwaway database |
| `npm run build && npm start` | Production build |

## How it works

- **Catalogue content** (names, descriptions, sizes) is in `src/lib/products.ts`. **Prices, MRP and stock** live in the database and are edited in `/admin/products`. The prices in code are only the opening defaults.
- **Opening prices** are set near the middle of what Indian wood-pressed (kachi ghani / marachekku) brands such as Anveshan, Gramiyaa, Oor Kinaru, Vasara and Adya Organics listed online in Nov 2026. Per litre: groundnut ₹449, sesame ₹549, coconut ₹749, mustard ₹449.
- **Pricing** (`src/lib/pricing.ts`) is recomputed on the server from database prices for every order, so a tampered browser price is never trusted. Coupons: `KOLHU10`, `WELCOME5`. Free shipping above ₹999, else ₹60.
- **Stock** is reserved when payment is taken, inside a database transaction with row locks, so two people can never buy the last bottle. A failed payment or a cancelled order puts the stock back.
- **Reviews** can only be written for an order that was marked delivered, once per oil, and show the first name + last initial and city.
- **Database code**: `src/lib/db.ts` (connection pool), `src/lib/schema.ts` (tables), `src/lib/orders.ts`, `src/lib/reviews.ts`, `src/lib/stats.ts`, `src/lib/inventory.ts`. It works with any Postgres; Neon's pooled connection string is recommended.
- If the database is missing or not answering, the shop still opens with default prices and checkout shows a clear message.

## Payments

`src/lib/payment.ts` is a **demo gateway**: no real money moves, and a card number ending in `0000` is declined so you can test failures. Replace `charge()` with Razorpay / PhonePe / Stripe once you have merchant keys. Cash on delivery works as it is.

## Before going live

- Connect a real payment gateway (above).
- Replace the placeholder contact details on `/contact` and check the MRPs and opening prices in `/admin/products`.
- Product photos: the bottles are illustrations.
- Order emails/SMS aren't sent yet. The admin order page has call, WhatsApp and email buttons.
