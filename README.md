<div align="center">

# 🪡 SILKROAD v2

**A premium, high-performance luxury e-commerce platform.**

<br />

<p align="center" style="max-width: 800px; margin: 0 auto; font-size: 1.1em; line-height: 1.6; color: #555;">
  Inspired by the legendary ancient trade routes that connected the East to the West, Silkroad v2 serves as a modern digital conduit for global luxury. Just as intrepid merchants once traversed endless deserts and mountains to bring the world's most exquisite silks, spices, and treasures to new frontiers, this platform is engineered to deliver a seamless, borderless, and breathtaking shopping experience for the modern connoisseur.
</p>

<br />

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Stripe-626CD9?style=for-the-badge&logo=Stripe&logoColor=white" alt="Stripe" />
</p>

<br />
</div>

---

## ✨ The Modern Merchant's Features

- **Immersive User Experience:** Smooth scrolling (Lenis), meticulously crafted micro-interactions (Framer Motion), and a pristine, luxury-focused UI.
- **Robust Catalogue Management:** Deep taxonomy with categories, nested subcategories, brands, and variant-level inventory tracking.
- **Hybrid Cart System:** Seamless transition from guest browsing (local Zustand store) to authenticated shopping (server-synced database cart).
- **Secure Authentication:** Powered by Auth.js (NextAuth), supporting both credential and OAuth workflows with a robust four-tier role system (`GUEST`, `USER`, `ADMIN`, `SUPER_ADMIN`).
- **Enterprise Checkout:** Fully integrated Stripe payment processing with server-side price validation, atomic inventory decrements, and snapshot-based order histories.
- **Admin & Brand Portal:** Dedicated administration dashboards for brand managers and platform owners, complete with immutable audit logging.
- **Customer Engagement:** Wishlists, recently viewed tracking, and dynamic product recommendations.

---

## 🛠 Architecture & Stack

### Frontend
- **Framework:** Next.js 16 (App Router) & React 19
- **Styling:** Tailwind CSS v4
- **State Management:** Zustand
- **Animations:** Framer Motion & Lenis (Smooth Scroll)
- **Icons & UI:** Lucide React

### Backend & Infrastructure
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** Auth.js (`next-auth@beta`)
- **Payments:** Stripe API
- **Email Delivery:** Resend
- **Caching:** Redis (`ioredis`)

---

## 🏗 Project Structure

The repository is structured around the Next.js App Router paradigm, cleanly separating public storefronts from authenticated customer portals and secure administrative zones.

```text
src/
├── app/
│   ├── (shop)/         # Public storefront (catalogue, product details, brands)
│   ├── (auth)/         # Login, registration, password recovery
│   ├── (checkout)/     # Secure checkout flow and order confirmation
│   ├── (account)/      # Customer portal (orders, addresses, wishlist)
│   ├── (admin)/        # Secure dashboards for Brand Admins & Super Admins
│   └── api/            # RESTful API endpoints for client-side hydration
├── components/         # Reusable UI components (Product Cards, Sliders, Modals)
├── lib/                # Core utilities (Prisma client, Stripe, Auth guards)
├── store/              # Zustand stores (Cart, UI state)
└── types/              # TypeScript definitions
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v20+ recommended)
- **PostgreSQL** database
- **Redis** instance
- **Stripe Account** (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd silkroad
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Copy `.env.example` to `.env.local` and configure your keys:
   ```bash
   cp .env.example .env.local
   ```
   *Ensure you set up your `DATABASE_URL`, `STRIPE_SECRET_KEY`, `AUTH_SECRET`, and `SUPER_ADMIN_EMAILS`.*

4. **Database Initialization**
   Run the Prisma migrations and seed the database with initial categories/brands:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   npm run seed
   ```

5. **Run the Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🔒 Security & Data Integrity

- **Atomic Transactions:** Order placements utilize Prisma `$transaction` blocks to ensure stock is decremented atomically, preventing overselling even under high concurrency.
- **Server-Side Pricing:** The client never dictates prices. All cart totals and checkout amounts are strictly recalculated on the server using the database source of truth.
- **Immutable Orders:** Once placed, `OrderItem`s snapshot the product name, brand, image, and price. Historical orders remain perfectly accurate even if the original product is deleted or updated.

---

## 📄 License

<div align="center">
  <p>This project is licensed under the <strong>Silkroad Non-Commercial Open Source License (SNCOSL) v1.0</strong> - see the <a href="LICENSE">LICENSE</a> file for details.</p>
</div>
