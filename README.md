This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Supabase Order Storage Setup

This project stores submitted orders in Supabase via `src/app/api/orders/route.ts`.

1. Copy `.env.example` to `.env.local` and fill:
	- `SUPABASE_URL`
	- `SUPABASE_SERVICE_ROLE_KEY`

2. In Supabase SQL Editor, run:
	- `supabase/orders_table.sql`

After setup, submitted checkout orders are inserted into `public.orders`.

### First-time setup checklist

1. Open Supabase Project Dashboard.
2. Go to SQL Editor.
3. Paste and run the full script from `supabase/orders_table.sql`.
4. Confirm table exists in Table Editor: `public.orders`.
5. Submit an order from the app and verify a row appears in `public.orders`.

## Confirmation Notifications (Email + WhatsApp)

Order confirmations are triggered from [src/app/api/orders/route.ts](src/app/api/orders/route.ts) after a successful database insert.

### Email via Resend

Set these variables in .env.local:

- RESEND_API_KEY
- ORDER_FROM_EMAIL (or FROM_EMAIL) (verified sender, for example orders@yourdomain.com)
- Optional local fallback: RESEND_TLS_INSECURE=true (use only for local debugging when TLS interception breaks Node fetch)

### WhatsApp via Twilio

Set these variables in .env.local:

- TWILIO_ACCOUNT_SID
- TWILIO_AUTH_TOKEN
- TWILIO_WHATSAPP_FROM (for example whatsapp:+14155238886)

Customer phone numbers should include country code (for example +33...).

### Behavior

- Order is always saved first.
- Notification sending is attempted after save.
- If provider credentials are missing, order still succeeds and notification channel is marked not configured.
