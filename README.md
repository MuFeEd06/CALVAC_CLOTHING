# CALVAC — Clothing Store

A full-stack clothing e-commerce website built with **Next.js 14**, **Supabase**, and deployed on **Vercel**.

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14 (App Router) + Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (admin only) |
| Storage | Supabase Storage (product images) |
| Checkout | WhatsApp-based |
| Deploy | Vercel |

---

## Setup Guide

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/calvac.git
cd calvac
npm install
```

### 2. Supabase Setup

1. Go to [supabase.com](https://supabase.com) → New Project
2. Go to **SQL Editor** → paste the contents of `supabase-schema.sql` → Run
3. Go to **Storage** → Create a new bucket called `product-images` → set it to **Public**
4. Go to **Authentication** → **Users** → **Add User** → create your admin account (email + password)
5. Copy your project URL and keys from **Settings → API**

### 3. Environment Variables

```bash
cp .env.local.example .env.local
```

Fill in `.env.local` with your Supabase credentials and WhatsApp number.

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — your store  
Open [http://localhost:3000/admin](http://localhost:3000/admin) — admin panel

---

## Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → **Import Project** → select your repo
3. Add all environment variables from `.env.local` in Vercel's project settings
4. Deploy 🚀

Every push to `main` auto-deploys.

---

## Admin Panel

URL: `yoursite.com/admin`

| Page | Path | Description |
|---|---|---|
| Dashboard | `/admin` | Stats overview |
| Products | `/admin/products` | List, add, edit, delete products |
| New Product | `/admin/products/new` | Add product with images |
| Orders | `/admin/orders` | View and manage orders |
| Settings | `/admin/settings` | WhatsApp number, hero text, branding |

---

## Pages

| Page | Path |
|---|---|
| Homepage | `/` |
| Shop | `/shop` |
| Product Detail | `/product/[slug]` |
| Admin Login | `/admin/login` |

---

## Checkout Flow

1. Customer browses → adds items to cart
2. Cart drawer opens → review items
3. Click "Checkout via WhatsApp" → fill name + phone + address
4. Order saved to Supabase → WhatsApp opens with pre-filled order message
5. Admin receives WhatsApp → confirms order manually
6. Admin updates order status in dashboard

---

## Adding Products

1. Go to `/admin/products/new`
2. Fill in name, price, description
3. Upload product images (stored in Supabase)
4. Add sizes (S, M, L, XL or custom)
5. Add colors with hex codes
6. Set category, stock, toggle active/featured
7. Save → product appears on site instantly

---

## Project Structure

```
calvac/
├── app/
│   ├── page.tsx              # Homepage
│   ├── shop/page.tsx         # Shop / catalog
│   ├── product/[slug]/       # Product detail
│   └── admin/                # Admin panel (protected)
├── components/
│   ├── layout/               # Navbar, Footer, Hero, CartDrawer
│   ├── shop/                 # ProductCard, ProductGrid, Filters
│   ├── admin/                # Sidebar, ProductForm, etc.
│   └── ui/                   # TickerBar, etc.
├── hooks/
│   └── useCart.tsx           # Cart state (localStorage)
├── lib/
│   ├── supabase.ts           # Supabase client
│   ├── db.ts                 # All DB queries
│   └── whatsapp.ts           # WhatsApp message builder
├── types/
│   └── index.ts              # TypeScript types
└── supabase-schema.sql       # Run this in Supabase SQL Editor
```
