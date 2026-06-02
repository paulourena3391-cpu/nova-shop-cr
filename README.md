# Nova Shop CR — Shopify Storefront Custom App

A professional, conversion-optimized online store built with **Next.js 14**, **Tailwind CSS**, and the **Shopify Storefront API** (GraphQL). No Shopify theme editor — this is a fully custom frontend that consumes the API directly.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| API | Shopify Storefront API 2024-10 (GraphQL) |
| State | React Context API (cart + language) |
| Deployment | Vercel |
| Language | TypeScript (strict mode) |

---

## Project Structure

```
nova-shop-cr/
├── app/
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Homepage
│   ├── globals.css              # Global styles + Tailwind directives
│   ├── products/[handle]/       # Product detail page
│   ├── collections/[handle]/    # Collection page with filters
│   ├── cart/                    # Cart page
│   └── search/                  # Search with real-time debounce
├── components/
│   ├── AnnouncementBar.tsx      # Top promo bar
│   ├── Header.tsx               # Sticky header + search + cart icon
│   ├── CartDrawer.tsx           # Slide-in cart panel
│   ├── Footer.tsx               # Full footer
│   ├── Hero.tsx                 # Homepage hero section
│   ├── TrustBadges.tsx          # Shipping/payments/returns strip
│   ├── CategoryGrid.tsx         # Visual category grid
│   ├── CountdownTimer.tsx       # Live countdown timer
│   ├── ProductCard.tsx          # Reusable product card
│   ├── CollectionFilters.tsx    # Sort + price filters sidebar
│   └── Newsletter.tsx           # Email signup section
├── context/
│   ├── CartContext.tsx          # Cart state + Shopify cart mutations
│   └── LanguageContext.tsx      # EN/ES toggle with full translations
├── lib/
│   └── shopify.ts               # GraphQL client, all queries/mutations, helpers
├── .env.local.example           # Environment variable template
├── vercel.json                  # Vercel deployment config
└── package.json
```

---

## Quick Start

### 1. Clone and install

```bash
git clone <your-repo>
cd nova-shop-cr
npm install
```

### 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_public_storefront_token
NEXT_PUBLIC_SHOPIFY_API_VERSION=2024-10
```

> **Important**: Only the **Public Storefront Access Token** goes here.  
> Never expose the Admin API key or Private token in this file.

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Shopify Setup Checklist

1. **Enable Storefront API** — Shopify Admin → Apps → Develop apps → Create app → Storefront API
2. **Grant these scopes**:
   - `unauthenticated_read_product_listings`
   - `unauthenticated_read_collection_listings`
   - `unauthenticated_read_product_inventory`
   - `unauthenticated_write_checkouts` (for cart)
   - `unauthenticated_read_checkouts`
3. **Copy the Public Storefront Access Token** (not the Admin API key)
4. **Add your store domain** (`your-store.myshopify.com`) to `.env.local`

---

## Deployment to Vercel

### Option A — Vercel CLI

```bash
npm i -g vercel
vercel
```

### Option B — Vercel Dashboard

1. Push to GitHub
2. Import repo at [vercel.com/new](https://vercel.com/new)
3. Add these environment variables in Vercel Dashboard:
   - `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN`
   - `NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN`
   - `NEXT_PUBLIC_SHOPIFY_API_VERSION` = `2024-10`
4. Deploy

> The `vercel.json` references Vercel secrets (`@shopify_store_domain`, `@shopify_storefront_token`).  
> Add these via: `vercel secrets add shopify_store_domain "your-store.myshopify.com"`

---

## Features

- **Homepage** — Hero, trust badges, category grid, deals countdown, best sellers, newsletter
- **Collections** — Sidebar filters (sort, price range, rating), product grid, pagination-ready
- **Product Detail** — Image gallery, variant selectors, add-to-cart, related products, tabs
- **Cart** — Slide-in drawer + full cart page, line quantity edit, Shopify checkout redirect
- **Search** — Real-time results with 400ms debounce, URL-synced query
- **Bilingual** — Full EN/ES toggle via React Context (no external i18n library)
- **SEO** — Dynamic `metadata` per page with Open Graph tags
- **Performance** — `next/image` for CDN-optimized images, server components where possible

---

## Customization Notes

| What | Where |
|---|---|
| Brand colors | `tailwind.config.ts` → `theme.extend.colors` |
| Fonts | `tailwind.config.ts` + `app/globals.css` |
| Categories | `components/CategoryGrid.tsx` → `CATEGORIES` array |
| Nav links | `components/Header.tsx` → `navLinks` array |
| Translations | `context/LanguageContext.tsx` → `en` / `es` objects |
| API version | `.env.local` → `NEXT_PUBLIC_SHOPIFY_API_VERSION` |

---

## License

MIT
