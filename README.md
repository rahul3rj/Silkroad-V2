<div align="center">

# 🪡 SILKROAD v2

**A full-stack luxury fashion marketplace — multi-brand, multi-role, production-ready.**

<br />

<p align="center">
  <img src="https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Stripe-626CD9?style=for-the-badge&logo=Stripe&logoColor=white" alt="Stripe" />
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" />
</p>

<br />

> Inspired by the ancient trade routes connecting East to West, Silkroad v2 is a modern digital marketplace for global luxury — built with an emphasis on performance, correctness, and a genuinely premium user experience.

<br />

<img src="./public/ss.png" alt="Silkroad v2 Preview" width="100%" style="border-radius: 12px;" />

</div>

---

## 📋 Table of Contents

- [🌐 Overview](#-overview)
- [🛠️ Tech Stack](#️-tech-stack)
- [✨ Features](#-features)
- [🗂️ Project Structure](#️-project-structure)
- [🏛️ Architecture](#️-architecture)
- [🔌 API Reference](#-api-reference)
- [🔒 Role System & Access Control](#-role-system--access-control)
- [🚀 Getting Started](#-getting-started)
- [🛡️ Security & Data Integrity](#️-security--data-integrity)
- [📄 License](#-license)

---

## 🌐 Overview

Silkroad v2 is a **multi-brand luxury e-commerce platform** in the vein of Net-a-Porter or Farfetch. It supports three distinct user types operating on the same codebase:

- 🛍️ **Customers** — browse, wishlist, and purchase from multiple designer brands
- 🏷️ **Brand Admins** — manage their brand's products, inventory, and orders through a dedicated portal
- 👑 **Super Admins** — oversee the entire platform: all brands, all admins, all orders

The platform handles the full e-commerce lifecycle: product discovery → cart → Stripe checkout → order fulfilment → post-purchase account management.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| 🧱 **Framework** | Next.js 16.2 (App Router), React 19 |
| 🔤 **Language** | TypeScript 5 |
| 🎨 **Styling** | Tailwind CSS v4, Metropolis typeface (bundled) |
| 🎬 **Animations** | Framer Motion 12, Lenis (smooth scroll) |
| 🗄️ **Database** | PostgreSQL via Prisma ORM 7 (`@prisma/adapter-pg`) |
| 🔐 **Auth** | Auth.js v5 (NextAuth beta) — Credentials + Google + Apple OAuth |
| 💳 **Payments** | Stripe (PaymentIntents + Webhooks) |
| 🗃️ **State Management** | Zustand 5 (cart store) |
| ⚡ **Caching** | Redis (`ioredis`) |
| 🔍 **Search** | Fuse.js (client-side fuzzy search) |
| 📧 **Email** | Resend |
| 🖼️ **Image Storage** | Supabase Storage |
| 🖼️ **Image Processing** | Sharp |
| 📊 **Charts** | Recharts (admin dashboard) |
| ✅ **Validation** | Zod v4 |

---

## ✨ Features

### 🛍️ Storefront
- Product catalogue browsable by **gender** (Women / Men), **category**, **brand**, **new-in**, and **sale**
- Full-text fuzzy search via Fuse.js
- Product detail pages with **size variants**, **color swatches**, and image galleries
- **Recently viewed** tracking (last 20 products per user)
- **Wishlist** with persistent server-side storage

### 🛒 Cart & Checkout
- **Dual-mode cart** — Zustand for guests, PostgreSQL for authenticated users; guest cart merges seamlessly on login
- Stripe **PaymentIntents** with server-side price validation (client never sets amounts)
- Shipping method selection: Standard / Express / Overnight
- Saved address selection at checkout
- **Coupon codes** — flat-amount and percentage discounts with expiry, usage caps, and minimum order values
- **Atomic stock decrement** inside a Prisma transaction — no overselling

### 📦 Order Management
- Full lifecycle: `PENDING → PROCESSING → SHIPPED → DELIVERED → CANCELLED → REFUNDED`
- Shipping address **snapshotted** at purchase time — changing address book won't alter history
- Product details (name, image, brand, price) **snapshotted** on each `OrderItem` — catalogue edits/deletions don't corrupt past orders
- Tracking number and carrier fields

### 👤 Customer Account
- Profile management (name, phone, date of birth, avatar upload to Supabase)
- Multiple saved addresses with a default selection
- Full order history with per-order detail pages
- User preferences

### ⚙️ Admin Panel (`/admin`)
- **Dashboard** with key metrics and Recharts visualisations
- **Product management** — create/edit/delete products, bulk image upload to Supabase Storage
- **Order management** — update order status, add internal admin notes
- **Inventory management** — per-variant stock level editing
- **Brand settings** — logo, tagline, contact email, display preferences (reviews, sale badge, new badge, out-of-stock visibility)
- **Immutable audit log** — every admin action is recorded with actor, before/after values, and IP address

### 👑 Super Admin (`/admin/brand-manage`)
- Create and manage all brands on the platform
- Promote / demote brand admins (scoped per brand)
- Platform-wide visibility across all orders and products

### 🔑 Authentication
- Email + password (bcrypt, 12 rounds) with email verification and password reset
- Google OAuth and Apple OAuth
- Four-tier role system — see [Role System](#-role-system--access-control)
- Soft account suspension (`isActive` flag checked on every auth callback)

---

## 🗂️ Project Structure

```
silkroad/
├── prisma/
│   ├── schema.prisma         # Database schema
│   ├── seed.ts               # Catalogue seeder (14 brands, 22 products)
│   └── migrations/           # Applied migration history
├── public/
│   ├── fonts/metropolis/     # Full Metropolis typeface (18 weights, bundled)
│   └── images/               # Static product/background images
├── src/
│   ├── app/
│   │   ├── (shop)/           # Public storefront
│   │   │   ├── page.tsx      # Homepage
│   │   │   ├── product/[productSlug]/
│   │   │   ├── brands/[brandSlug]/
│   │   │   ├── women/  men/  new-in/  search/
│   │   │   └── sale/
│   │   ├── (auth)/           # Login, signup, verify, reset-password
│   │   ├── (checkout)/       # Cart, checkout, order-confirmation
│   │   ├── (account)/        # Orders, profile, addresses, wishlist, preferences
│   │   ├── (admin)/          # Admin dashboard, products, orders, inventory, brands
│   │   └── api/              # All REST API handlers
│   ├── components/
│   │   ├── admin/            # AdminSidebar and admin-specific UI
│   │   ├── auth/             # Login/signup forms
│   │   ├── cart/             # CartProvider, CartItem, CartDrawer
│   │   ├── account/          # AccountShell and account page components
│   │   ├── product/          # ProductCard, ProductGallery, etc.
│   │   ├── layout/           # Navbar, Footer, shell wrappers
│   │   └── ui/               # Base design-system primitives
│   ├── hooks/                # Custom React hooks (useProducts, etc.)
│   ├── lib/
│   │   ├── auth.ts           # Auth.js configuration
│   │   ├── guards.ts         # Route-level auth helpers
│   │   ├── cart/cartApi.ts   # Server cart CRUD
│   │   └── prisma.ts         # Prisma client singleton
│   ├── store/
│   │   └── cartStore.ts      # Zustand cart store (guest mode)
│   └── types/                # Shared TypeScript type definitions
├── middleware.ts              # Edge auth + route protection
├── next.config.ts
└── .env.example
```

---

## 🏛️ Architecture

Silkroad is a **monolithic Next.js application** using the App Router. All frontend, backend API, and middleware logic live in a single deployable unit.

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                             │
│         React 19 + Zustand + Framer Motion + Lenis          │
└───────────────────────────┬─────────────────────────────────┘
                            │  HTTPS
┌───────────────────────────▼─────────────────────────────────┐
│                    Next.js 16 (App Router)                   │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │  (shop)      │  │  (account)   │  │  (admin)          │  │
│  │  Storefront  │  │  Customer    │  │  Brand & Platform  │  │
│  │  RSC + pages │  │  Portal      │  │  Admin Portal     │  │
│  └──────────────┘  └──────────────┘  └───────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                   API Routes (/api/*)               │    │
│  │  products · cart · orders · addresses · admin · auth│    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌──────────────┐  Auth.js v5 middleware (Edge Runtime)     │
│  │ middleware.ts│  Route guards: GUEST / USER / ADMIN /     │
│  │              │  SUPER_ADMIN enforced before handlers     │
│  └──────────────┘                                           │
└──────┬──────────────────────┬──────────────────┬────────────┘
       │                      │                  │
┌──────▼──────┐  ┌────────────▼───────┐  ┌──────▼──────────┐
│  PostgreSQL  │  │       Redis        │  │  Stripe API     │
│  (Prisma 7)  │  │  (session cache /  │  │  PaymentIntents │
│              │  │   rate limiting)   │  │  + Webhooks     │
└──────────────┘  └────────────────────┘  └─────────────────┘
       │
┌──────▼──────────────────────────────────────────────────┐
│                  External Services                       │
│  Supabase Storage (images) · Resend (email) · OAuth     │
│  (Google / Apple)                                        │
└──────────────────────────────────────────────────────────┘
```

### 🔄 Key Data Flows

**Guest → Authenticated Cart Merge**
> Guest browses and adds items to a local Zustand store. On login, the client POSTs each local cart item to `/api/cart`, which upserts them into the server-side `CartItem` table. The local store is then cleared and replaced by the server state.

**Checkout & Payment**
> Client calls `/api/payments/create-intent` → server recomputes the total from the DB (never trusts client amounts) → creates a Stripe `PaymentIntent` → client renders the Stripe Elements form → on success Stripe fires a webhook to `/api/webhooks/stripe` → server creates the `Order`, decrements variant stock inside a single `prisma.$transaction`, and clears the cart.

**Admin Image Upload**
> Admin selects images in the product form → client POSTs files to `/api/admin/products/upload-image` → server uses Sharp to resize/optimise → uploads to Supabase Storage → returns public CDN URLs stored on the `Product` record.

**Super Admin Role Elevation**
> On every sign-in, the Auth.js callback checks `SUPER_ADMIN_EMAILS` (env var). If the user's email matches, their `role` in the DB is set to `SUPER_ADMIN`. This happens server-side on every login — the env var is always the source of truth, not the database value alone.

---

## 🔌 API Reference

All endpoints under `/api/admin/*` require `ADMIN` or `SUPER_ADMIN` role. All other `/api/*` endpoints require an authenticated session unless noted as public.

```
🌍 Public
  GET  /api/products                   List products (filter by brand, category, gender, sale, new)
  GET  /api/products/[slug]            Single product with variants
  GET  /api/brands                     All active brands

🔑 Auth (unauthenticated)
  POST /api/auth/register              Create credentials account
  POST /api/auth/send-verification     Trigger email verification
  POST /api/auth/verify-email          Verify email token
  POST /api/auth/[...nextauth]         Auth.js handler (OAuth + session)

🛒 Cart
  GET  /api/cart                       Fetch server cart
  POST /api/cart                       Add item to server cart
  PATCH/DELETE /api/cart/[productId]   Update or remove cart item
  GET  /api/cart/stock                 Validate stock for cart items

📦 Orders
  POST /api/orders                     Create order (clears cart, decrements stock)
  GET  /api/orders/[id]                Get order detail (owner only)

💳 Payments
  POST /api/payments/create-intent     Create Stripe PaymentIntent (server-side pricing)
  POST /api/webhooks/stripe            Handle Stripe webhook events

🏠 Addresses
  GET/POST /api/addresses              List or create saved addresses
  PATCH/DELETE /api/addresses/[id]     Update or delete address

❤️ Wishlist
  GET/POST/DELETE /api/wishlist        Manage wishlist items

👁️ Recently Viewed
  POST /api/recently-viewed            Record product view

👤 Profile
  GET/PATCH /api/users/me              View or update profile
  POST      /api/users/me/avatar       Upload avatar to Supabase Storage

⚙️ Admin — Products
  GET/POST              /api/admin/products
  PATCH/DELETE          /api/admin/products/[id]
  POST                  /api/admin/products/upload-image

⚙️ Admin — Orders
  PATCH                 /api/admin/orders/[id]   Update status / tracking / notes

⚙️ Admin — Brands
  GET/POST/PATCH/DELETE /api/admin/brands

⚙️ Admin — Users
  GET/PATCH             /api/admin/users         Manage roles and brand assignments

⚙️ Admin — Stats
  GET                   /api/admin/stats         Dashboard KPIs

⚙️ Admin — Settings
  GET/PATCH             /api/admin/settings      Brand or platform settings

🩺 Health
  GET /api/health
```

---

## 🔒 Role System & Access Control

Silkroad uses a four-tier role system enforced at both the middleware edge and API handler level.

| Role | Who | What they can do |
|---|---|---|
| 👤 `GUEST` | Unauthenticated visitor | Browse catalogue, view products |
| 🛍️ `USER` | Signed-in customer | + Cart, checkout, orders, wishlist, account |
| 🏷️ `ADMIN` | Brand staff (scoped to one brand) | + Admin panel for their brand's products/orders/inventory |
| 👑 `SUPER_ADMIN` | Platform owner | + Everything: all brands, user management, `/admin/brand-manage` |

**👑 Super Admin assignment** works differently from regular admin promotion — it is **never stored in the database UI**. Instead, the `SUPER_ADMIN_EMAILS` environment variable is the source of truth. Any account whose email appears in that list is elevated to `SUPER_ADMIN` automatically on every sign-in.

**🏷️ Brand Admin assignment** is done by a Super Admin through the Brand Manage panel. An admin is always scoped to a single brand via `User.brandId`.

Route protection is layered:
1. 🛡️ **`middleware.ts`** — Auth.js edge middleware guards all routes before they reach handlers
2. 🔐 **`lib/guards.ts`** — Server-side helpers used inside API route handlers for fine-grained checks

---

## 🚀 Getting Started

### 📋 Prerequisites

- **Node.js** 20+
- **PostgreSQL** database
- **Redis** instance
- **Stripe** account (for payment processing)
- **Supabase** project (for image storage)
- **Resend** account (for transactional email)

### 1️⃣ Clone and install

```bash
git clone <repository-url>
cd silkroad
npm install
```

### 2️⃣ Configure environment

```bash
cp .env.example .env.local
```

Fill in all required values from `.env.example`. At minimum you need `DATABASE_URL`, `AUTH_SECRET`, and `SUPER_ADMIN_EMAILS` to get the app running locally.

### 3️⃣ Set up the database

```bash
# Generate Prisma client
npx prisma generate

# Apply all migrations
npx prisma migrate dev

# Seed with 14 luxury brands, 3 categories, and 22 products
npx prisma db seed
```

### 4️⃣ Configure Stripe webhooks (local dev)

```bash
# Forward Stripe events to your local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the webhook signing secret printed by the CLI into `STRIPE_WEBHOOK_SECRET` in `.env.local`.

### 5️⃣ Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 6️⃣ Create your Super Admin account

Sign up at `/signup` using the email you set in `SUPER_ADMIN_EMAILS`. On first login the role is automatically elevated and you'll be redirected to `/admin`.

### 🧰 Available scripts

```bash
npm run dev      # Development server (Next.js with HMR)
npm run build    # Production build
npm run start    # Serve production build
npm run lint     # ESLint

# Prisma
npx prisma migrate dev    # Create and apply a new migration
npx prisma migrate reset  # Reset DB and re-run all migrations (destructive)
npx prisma db seed        # Re-seed the catalogue
npx prisma studio         # Open the Prisma database GUI
```

---

## 🛡️ Security & Data Integrity

💰 **Server-side pricing** — The client never sets a price. Every cart total and checkout amount is computed on the server from the database, making price tampering via modified requests impossible.

⚛️ **Atomic order placement** — Stock is decremented inside a `prisma.$transaction` block alongside order creation. Concurrent checkouts for the same last unit cannot both succeed.

🧾 **Immutable order history** — `OrderItem` snapshots the product name, brand, image, and unit price at purchase time. Editing or deleting a product from the catalogue never corrupts historical orders. `productId`/`variantId` are nullable with `SetNull` cascade for the same reason.

📍 **Address snapshots** — Shipping address fields are copied directly onto the `Order` row (not a foreign key). Updating the address book after a purchase doesn't alter delivery records.

👑 **SUPER_ADMIN from environment** — Super admin status is derived from `SUPER_ADMIN_EMAILS` on every sign-in, never from a UI action. This means it cannot be escalated through a compromised admin account.

🔑 **Password security** — Credentials passwords are hashed with bcrypt at 12 rounds. Password reset uses short-lived tokens stored in the database.

📝 **Audit logging** — Every admin mutation (product edits, status changes, role assignments) is written to the immutable `AuditLog` table with actor ID, IP address, and before/after JSON values.

---

## 📄 License

This project is licensed under the **Silkroad Non-Commercial Open Source License (SNCOSL) v1.0** — see the [LICENSE](LICENSE) file for full terms.
