# Natural Oil

Online store for unrefined, wooden-kolhu-pressed oils. Complete purchase flow:
browse, product page, cart (with coupons), checkout, payment, order confirmation, order tracking.

## Run

```bash
npm install
npm run dev      # http://localhost:3002
npm test         # pricing tests
npm run build && npm start
```

## How it works

- **Catalogue:** `src/lib/products.ts` (edit prices, sizes and oils here).
- **Prices** are set near the middle of what Indian wood-pressed (kachi ghani / marachekku) brands such as Anveshan, Gramiyaa, Oor Kinaru, Vasara and Adya Organics listed online in Nov 2026. Per litre: groundnut ₹449, sesame ₹549, coconut ₹749, mustard ₹449. Re-check before launch; market prices change often.
- **Pricing:** `src/lib/pricing.ts` is the single source of truth, re-run on the server for every order so tampered client prices are ignored. Coupons: `KOLHU10`, `WELCOME5`. Free shipping above ₹999, else ₹60.
- **Cart:** browser localStorage (`src/lib/cart.tsx`).
- **Orders:** JSON file at `data/orders.json` (override with `ORDERS_FILE`). All access goes through `src/lib/orders.ts`, so moving to a real database later means rewriting only that file.
- **Payment:** `src/lib/payment.ts` is a **demo gateway** (no real money moves; a card ending `0000` is declined to test failures). Replace `charge()` with Razorpay/Stripe/PhonePe once you have merchant keys. Cash on delivery works as-is.
- **Tracking:** `/track` looks up an order by order ID + phone number.

## Not built yet

Admin panel to update order status (statuses are changed in the data file for now), user accounts, emails/SMS, product photos (bottle illustrations are placeholders), real payment gateway, database.
