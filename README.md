# Digital Market

A multi-tenant ecommerce SaaS I built so merchants can launch their own online store without touching any code. Think Shopify but you host it yourself — each merchant gets their own storefront at a subdomain, their own products, orders, and branding, all from one codebase.

## What it does

Merchants sign up, set up their store (logo, colours, banner images, tagline), add their products, and share their store link. Customers browse, search, filter by category, and checkout. Everything is isolated per merchant — one merchant can't see another's data.

**For merchants (dashboard):**
- Add and manage products with image uploads
- View incoming orders
- Customise their storefront — logo, brand colours, banner carousel, tagline
- Revenue chart with smart daily/monthly granularity

**For customers (storefront):**
- Clean shop page with banner carousel, new arrivals, trending products, and best sellers
- Search, category filtering, and sorting
- Cart with a slide-out drawer
- Works on any device, dark mode supported

## Tech stack

- **Next.js 16** + React 19 + TypeScript
- **Supabase** — Postgres database, Row Level Security, and Storage for images
- **Tailwind v4** + **shadcn v4**
- **Stripe** — payments and Stripe Connect for merchant payouts
- **Zustand** for cart state, **TanStack Query** for dashboard data
- Deployed on **Vercel**

## How multi-tenancy works

Each store lives at `yourstore.digitalmarket.com`. In local dev you don't need subdomains — just use `?_tenant=yourstore` on any URL. A proxy intercepts every request, looks up the merchant by hostname or subdomain, and rewrites internally to the right tenant route. The whole thing is invisible to the end user.

## Getting started

1. Clone the repo and install dependencies:
   ```bash
   npm install
   ```

2. Copy the environment file and fill in your keys:
   ```bash
   cp .env.example .env.local
   ```
   You'll need a Supabase project, Stripe account, and Resend account.

3. Run the database migration in your Supabase SQL editor:
   ```bash
   supabase/migrations/001_initial_schema.sql
   ```

4. Regenerate TypeScript types from your live schema:
   ```bash
   npm run db:types
   ```

5. Create a public `banners` bucket in Supabase Storage (used for product images, logos, and banner uploads).

6. Start the dev server:
   ```bash
   npm run dev
   ```

   Then visit `http://localhost:3000?_tenant=your-subdomain` to see a storefront.

## Project structure

```
src/
  app/
    [tenantId]/          # Storefront pages (reached via proxy, never directly)
    (dashboard)/         # Merchant dashboard
    api/upload/          # File upload endpoint → Supabase Storage
    actions/             # Server actions (settings, products, orders)
  components/
    storefront/          # Customer-facing components
    dashboard/           # Merchant dashboard components
    ui/                  # shadcn base components
  lib/supabase/          # Supabase client, server, and admin clients
  proxy.ts               # Multi-tenant routing logic
  store/                 # Zustand stores (cart)
  types/                 # TypeScript types including generated Supabase types
```

## What's still in progress

- Stripe billing for merchant subscriptions
- Custom domain mapping UI
- Order confirmation emails (Resend is wired in, just not used yet)
