<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Project: Digital Market — Multi-Tenant eCommerce SaaS

Shopify-style SaaS: one codebase, many merchant storefronts. Each merchant gets their own store at a subdomain (or custom domain). Deployed on Vercel + Supabase.

## Stack

- **Next.js 16.2.4** + React 19 — has breaking changes vs 14/15, see rules below
- **TypeScript** throughout
- **Tailwind v4** — CSS-only config via `@import "tailwindcss"` in globals.css; no `tailwind.config.ts`
- **shadcn v4** — package is `shadcn` (not `@shadcn/ui`); style: radix-nova; uses unified `radix-ui` package; add components with `npx shadcn add <name>`
- **Supabase** (Postgres + RLS) + `@supabase/ssr` v0.10.2
- **TanStack Query v5** (dashboard), **Next.js fetch** (storefront)
- **Zustand v5**
- **Stripe v22** (API version: `2026-04-22.dahlia`)
- **Resend v6**
- `src/` directory layout — `@/*` maps to `./src/*`

## Next.js 16 Breaking Changes

- `middleware.ts` is **DEPRECATED** — use `src/proxy.ts` instead, export a `proxy` function (not `middleware`)
- Having both `middleware.ts` AND `proxy.ts` causes a build error — only `proxy.ts` must exist
- `params` and `searchParams` in pages/layouts are **Promises** — always `await params` and `await searchParams`
- Node.js runtime is the default for proxy (Edge runtime no longer required)

## Architecture

### Tenant Routing (`src/proxy.ts`)
- Reads incoming hostname → DB lookup → rewrites request to `/{tenantId}/path`
- Custom domain lookup first, then subdomain fallback
- Local dev: `?_tenant=subdomain` query param bypasses DNS requirement
- Sets cookie `x-storefront-tenant` so subsequent navigations without `?_tenant` still resolve

### Storefront (`src/app/[tenantId]/*`)
- Never navigated to directly — always reached via proxy rewrite
- `[tenantId]/page.tsx` IS the shop homepage (new arrivals, trending, best sellers, all products grid)
- There is NO separate `/products` page — `[tenantId]/products/page.tsx` redirects to `/?_tenant=subdomain`
- Product detail: `[tenantId]/products/[productId]/page.tsx`

### Dashboard (`src/app/(dashboard)/dashboard/*`)
- Auth-gated; route group doesn't affect URL

### Per-Merchant Branding
- CSS custom property overrides applied via inline `style` on the storefront root `<div>`
- All branding stored in `merchants.branding` JSONB column — see types below

### File Uploads
- API route: `src/app/api/upload/route.ts`
- Uploads to Supabase Storage **`banners` bucket** (must be set to PUBLIC in Supabase dashboard)
- Auth-checks that the user owns the merchant before uploading

## Database

- All tables scoped by `tenant_id` referencing `merchants.id`
- Prices stored in **cents** (integers), displayed as AUD
- Migration: `supabase/migrations/001_initial_schema.sql`
- Types: `src/types/supabase.ts` — run `npm run db:types` to regenerate from live schema
- `Database` type: use `{ [_ in never]: never }` for empty Views/Functions (NOT `Record<string, never>`)
- Each table row type must have a `Relationships` array

### Columns that may need manual migration if missing
```sql
ALTER TABLE products ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS custom_domain TEXT;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS stripe_connect_id TEXT;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS stripe_connect_onboarded BOOLEAN NOT NULL DEFAULT FALSE;
```

### MerchantBranding type (`src/types/index.ts`)
All stored in `merchants.branding` JSONB:
- `storeName`, `logoUrl`, `primaryColor`, `primaryForegroundColor`, `secondaryColor`
- `fontFamily`, `heroTagline` (shown in storefront nav as tagline below store name), `heroImage`
- `bannerImages: string[]` — URLs for the homepage banner carousel

## Key File Locations

| What | Where |
|------|-------|
| Tenant routing (proxy) | `src/proxy.ts` |
| Supabase clients | `src/lib/supabase/{client,server,admin}.ts` |
| File upload API | `src/app/api/upload/route.ts` |
| Types | `src/types/{supabase,index}.ts` |
| Storefront pages | `src/app/[tenantId]/` |
| Storefront components | `src/components/storefront/` |
| Dashboard components | `src/components/dashboard/` |
| Server actions | `src/app/actions/` |
| Cart store | `src/store/cart-store.ts` |
| Migration | `supabase/migrations/001_initial_schema.sql` |

## What's Built (as of May 2026)

**Dashboard:**
- Auth (login / signup / logout)
- Product CRUD with image upload to Supabase Storage
- Orders list
- Revenue chart: blue `BarChart` (recharts), smart granularity — daily when ≤30 total orders, monthly when >30
- Settings: store name, primary color, logo file upload, tagline, banner carousel image upload, custom domain field

**Storefront:**
- Multi-tenant routing via `proxy.ts`
- Homepage = shop page: banner carousel (embla-carousel-react + autoplay), search/sort bar, category sidebar, new arrivals, trending (last 30 days), best sellers sidebar, all products grid
- Product detail page with `router.back()` back button (client component)
- Cart (Zustand store + `CartSheet` drawer)
- Category filtering (`CategoryNav` client component)
- Search (debounced 350ms, `NavSearch` client component)
- Sort (newest / price asc / price desc / name asc)
- Theme toggle (dark/light)

**What's NOT done yet:**
- Stripe billing (merchant subscriptions) — Stripe Connect partially wired, subscriptions not built
- Custom domain mapping UI (DB column exists, no UI)
- Email flows (Resend installed, not wired to anything)
- Order confirmation emails

## Critical Non-Obvious Rules

### 1. Always preserve `?_tenant=` in storefront client navigation

The storefront runs at `/?_tenant=subdomain` in dev and on Vercel custom domains. Any client navigation that doesn't carry this param drops the user to `/` with no tenant context.

**Rule:** In every storefront client component that navigates, use `new URLSearchParams(searchParams.toString())` as the base, then modify only the key you need.

```typescript
const router = useRouter()
const pathname = usePathname()
const searchParams = useSearchParams()

function navigate(key: string, value: string) {
  const params = new URLSearchParams(searchParams.toString()) // preserves _tenant
  if (value) params.set(key, value)
  else params.delete(key)
  router.replace(`${pathname}?${params.toString()}`, { scroll: false })
}
```

- NEVER use `<Link href="?category=X">` — strips all existing params including `_tenant`
- Back navigation: use `router.back()` in a client component, not `<Link href="../">`
- Redirecting to shop root: use `/?_tenant=${merchant.subdomain}`, NOT `/${tenantId}` (proxy double-prepends)

### 2. Dynamic pages on Vercel need both `force-dynamic` AND `noStore()`

`force-dynamic` prevents the full-route HTML cache. `noStore()` prevents the data-fetch cache (Vercel caches Supabase `fetch` calls separately). Without both, URL params update correctly in the browser but the page renders stale data.

```typescript
export const dynamic = 'force-dynamic'

import { unstable_noStore as noStore } from 'next/cache'

export default async function MyPage({ searchParams }) {
  noStore() // must be called, not just imported
  // ...
}
```

Apply to any storefront page where output depends on URL params (search, category, sort).

### 3. Always spread existing branding when updating `merchants.branding`

The branding column is one JSONB object. Any server action that updates it must read the existing value first and spread it — otherwise it overwrites fields saved by other actions (e.g. saving store name wipes `bannerImages`).

```typescript
const { data: merchant } = await supabase.from('merchants').select('branding').eq('user_id', user.id).single()
const existing = (merchant?.branding ?? {}) as MerchantBranding
const branding: MerchantBranding = {
  ...existing,       // always spread first
  storeName,         // then override only what changed
  primaryColor,
}
await supabase.from('merchants').update({ branding }).eq('user_id', user.id)
```

### 4. Product image state in edit dialog

`useState` initial value only runs on first mount. When the edit dialog opens for a different product, state holds the previous product's image. Fix with a `useEffect` that syncs on `open` and `product?.id`:

```typescript
useEffect(() => {
  if (open) setImageUrl(product?.images[0] ?? '')
}, [open, product?.id])
```
