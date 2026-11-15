# ZAYRO: Clothing Store (Client)

Zayro is a modern, mobile-first online clothing store. This repository contains the **customer-facing storefront** built with Next.js.

**Live site:** [zayro-cloth.vercel.app](https://zayro-cloth.vercel.app)

---

## Features

### Storefront
- Home page with hero section, brand stats and featured products
- Category pages (Hoodies, Jeans, Shirts, Shorts, T-Shirts, Casual and more)
- Filters: category, maximum price, color, size and style
- Sorting: Most Popular, Newest, Price (low to high / high to low)
- Product details page with image gallery, ratings, sizes, colors and reviews
- Wishlist and shopping cart
- Product search
- Sale badges with discount percentage
- Light and dark mode

### Mobile experience
- Responsive layout tuned for 360px phones up to desktop
- Slide-in **Filters drawer** on mobile (with active filter count)
- Clean one-line breadcrumbs and equal-height product cards

### Reliability
- Custom `404` and global error pages that match the brand design

---

## Tech Stack

| Area | Technology |
| --- | --- |
| Framework | [Next.js](https://nextjs.org) (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS, shadcn/ui |
| Icons | lucide-react |
| Database | MongoDB Atlas |
| Image storage | Cloudflare R2 |
| Hosting | Vercel |

---

## Getting Started

### Prerequisites
- Node.js 20 or newer
- npm (or pnpm / yarn)

### Installation

```bash
git clone https://github.com/mdsolimansikder7/zayro-cloth-client.git
cd zayro-cloth-client
npm install
```

### Environment variables

Create a `.env.local` file in the project root:

```env
# Public URL used by the browser to call the API.
# Production: "/backend" (proxied by Next.js rewrites, hides the real API domain)
# Local dev:  your local API URL
NEXT_PUBLIC_API_URL=http://localhost:4000

# Server-only: real backend origin (no trailing slash, no trailing /api).
# Used by server components and by the /backend rewrite.
BACKEND_URL=http://localhost:4000
```

> Never commit `.env.local`. Never put secrets in variables that start with `NEXT_PUBLIC_`.

### Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production build

```bash
npm run build
npm run start
```

---

## Project Structure

```text
zayro-cloth-client
├── public/              # Static assets
├── src/
│   ├── app/             # App Router pages, layouts, API routes
│   │   ├── category/    # Category / shop pages
│   │   ├── product/     # Product details pages
│   │   ├── error.tsx
│   │   ├── global-error.tsx
│   │   └── not-found.tsx
│   ├── components/      # Reusable UI components
│   └── lib/             # API helpers and utilities
├── next.config.ts       # Rewrites (/backend proxy), image config
├── components.json      # shadcn/ui config
└── package.json
```

---

## API Proxy

To avoid cross-domain cookie problems and to keep the backend domain out of the browser's network tab, the app proxies API calls through the frontend domain:

```ts
// next.config.ts
async rewrites() {
  return [
    {
      source: "/backend/:path*",
      destination: `${process.env.BACKEND_URL}/:path*`,
    },
  ];
},
```

A browser request to `/backend/api/products` is forwarded to `<BACKEND_URL>/api/products`.

---

## Deployment (Vercel)

1. Push the repository to GitHub and import it in [Vercel](https://vercel.com/new).
2. Add the environment variables:
   - `NEXT_PUBLIC_API_URL=/backend`
   - `BACKEND_URL=https://<your-api-domain>`
3. Redeploy after changing any `NEXT_PUBLIC_` variable (they are baked in at build time).

---

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Run the production build |
| `npm run lint` | Run ESLint |

---

## Author

**Md Soliman Sikder**: [@mdsolimansikder7](https://github.com/mdsolimansikder7)
