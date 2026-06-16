// adminData.ts — Mock brand-scoped data for the admin dashboard
// Each admin (brand) sees only their own products, orders, and revenue.

import { allProducts, ProductData, brandsData } from "./data";

// ─── TYPES ────────────────────────────────────────────────────────────────────

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface MockOrder {
  id: string;
  productId: string;
  productName: string;
  customerName: string;
  customerEmail: string;
  size: string;
  color: string;
  quantity: number;
  amount: number;
  status: OrderStatus;
  date: string; // ISO string
}

export interface StockEntry {
  productId: string;
  size: string;
  quantity: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  orders: number;
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

export function getBrandProducts(brandSlug: string): ProductData[] {
  return allProducts.filter((p) => p.brandSlug === brandSlug);
}

export function getBrandData(brandSlug: string) {
  return brandsData.find((b) => b.slug === brandSlug) ?? brandsData[0];
}

// ─── MOCK ORDERS ──────────────────────────────────────────────────────────────

const allMockOrders: MockOrder[] = [
  // Louis Vuitton orders
  {
    id: "ORD-10421",
    productId: "w-001",
    productName: "Silk Draped Maxi Dress",
    customerName: "Isabelle Monet",
    customerEmail: "isabelle@example.com",
    size: "S",
    color: "Noir",
    quantity: 1,
    amount: 499,
    status: "delivered",
    date: "2025-12-01T10:30:00Z",
  },
  {
    id: "ORD-10438",
    productId: "m-004",
    productName: "Ivory Linen Overshirt",
    customerName: "Raphael Stern",
    customerEmail: "raphael@example.com",
    size: "M",
    color: "Ivory",
    quantity: 1,
    amount: 289,
    status: "shipped",
    date: "2025-12-05T14:20:00Z",
  },
  {
    id: "ORD-10461",
    productId: "b-001",
    productName: "Silk Tote Grande",
    customerName: "Aria Chen",
    customerEmail: "aria@example.com",
    size: "One Size",
    color: "Camel",
    quantity: 1,
    amount: 750,
    status: "delivered",
    date: "2025-12-08T09:15:00Z",
  },
  {
    id: "ORD-10490",
    productId: "w-001",
    productName: "Silk Draped Maxi Dress",
    customerName: "Priya Nair",
    customerEmail: "priya@example.com",
    size: "XS",
    color: "Ivory",
    quantity: 1,
    amount: 499,
    status: "processing",
    date: "2025-12-12T16:45:00Z",
  },
  {
    id: "ORD-10512",
    productId: "b-001",
    productName: "Silk Tote Grande",
    customerName: "Sofia Marcello",
    customerEmail: "sofia@example.com",
    size: "One Size",
    color: "Noir",
    quantity: 2,
    amount: 1500,
    status: "delivered",
    date: "2025-12-15T11:00:00Z",
  },
  {
    id: "ORD-10534",
    productId: "m-004",
    productName: "Ivory Linen Overshirt",
    customerName: "James Whitfield",
    customerEmail: "james@example.com",
    size: "L",
    color: "Sky",
    quantity: 1,
    amount: 289,
    status: "pending",
    date: "2025-12-18T08:30:00Z",
  },
  {
    id: "ORD-10556",
    productId: "w-001",
    productName: "Silk Draped Maxi Dress",
    customerName: "Elena Vasquez",
    customerEmail: "elena@example.com",
    size: "M",
    color: "Sage",
    quantity: 1,
    amount: 499,
    status: "shipped",
    date: "2025-12-20T13:10:00Z",
  },
  {
    id: "ORD-10578",
    productId: "b-001",
    productName: "Silk Tote Grande",
    customerName: "Hana Watanabe",
    customerEmail: "hana@example.com",
    size: "One Size",
    color: "Ivory",
    quantity: 1,
    amount: 750,
    status: "cancelled",
    date: "2025-12-22T17:00:00Z",
  },
  {
    id: "ORD-10601",
    productId: "m-004",
    productName: "Ivory Linen Overshirt",
    customerName: "Nicolás Reyes",
    customerEmail: "nicolas@example.com",
    size: "XL",
    color: "Stone",
    quantity: 1,
    amount: 289,
    status: "delivered",
    date: "2025-12-26T10:00:00Z",
  },
  {
    id: "ORD-10623",
    productId: "w-001",
    productName: "Silk Draped Maxi Dress",
    customerName: "Amara Osei",
    customerEmail: "amara@example.com",
    size: "L",
    color: "Noir",
    quantity: 1,
    amount: 499,
    status: "processing",
    date: "2025-12-29T14:50:00Z",
  },
];

// Map orders to brand slug via product
export function getMockOrders(brandSlug: string): MockOrder[] {
  const brandProductIds = getBrandProducts(brandSlug).map((p) => p.id);
  return allMockOrders.filter((o) => brandProductIds.includes(o.productId));
}

// ─── MOCK INVENTORY (stock per product per size) ──────────────────────────────

const allStockData: StockEntry[] = [
  // w-001 — Silk Draped Maxi Dress (LV)
  { productId: "w-001", size: "XS", quantity: 3 },
  { productId: "w-001", size: "S", quantity: 8 },
  { productId: "w-001", size: "M", quantity: 12 },
  { productId: "w-001", size: "L", quantity: 5 },
  { productId: "w-001", size: "XL", quantity: 2 },
  // m-004 — Ivory Linen Overshirt (LV)
  { productId: "m-004", size: "S", quantity: 6 },
  { productId: "m-004", size: "M", quantity: 14 },
  { productId: "m-004", size: "L", quantity: 9 },
  { productId: "m-004", size: "XL", quantity: 3 },
  { productId: "m-004", size: "XXL", quantity: 1 },
  // b-001 — Silk Tote Grande (LV)
  { productId: "b-001", size: "One Size", quantity: 7 },
  // Chanel
  { productId: "w-002", size: "XS", quantity: 4 },
  { productId: "w-002", size: "S", quantity: 11 },
  { productId: "w-002", size: "M", quantity: 7 },
  { productId: "w-002", size: "L", quantity: 2 },
  { productId: "b-002", size: "One Size", quantity: 5 },
  { productId: "b-007", size: "One Size", quantity: 9 },
  // Gucci
  { productId: "w-003", size: "S", quantity: 6 },
  { productId: "w-003", size: "M", quantity: 10 },
  { productId: "w-003", size: "L", quantity: 4 },
  { productId: "w-003", size: "XL", quantity: 1 },
  { productId: "b-003", size: "One Size", quantity: 8 },
  // Dior
  { productId: "w-004", size: "XS", quantity: 3 },
  { productId: "w-004", size: "S", quantity: 8 },
  { productId: "w-004", size: "M", quantity: 6 },
  { productId: "w-004", size: "L", quantity: 2 },
  { productId: "b-005", size: "One Size", quantity: 4 },
  // Saint Laurent
  { productId: "w-005", size: "XS", quantity: 5 },
  { productId: "w-005", size: "S", quantity: 9 },
  { productId: "w-005", size: "M", quantity: 13 },
  { productId: "w-005", size: "L", quantity: 6 },
  { productId: "w-005", size: "XL", quantity: 0 },
  { productId: "m-008", size: "S", quantity: 3 },
  { productId: "m-008", size: "M", quantity: 7 },
  { productId: "m-008", size: "L", quantity: 5 },
  { productId: "m-008", size: "XL", quantity: 2 },
  // Bottega Veneta
  { productId: "w-006", size: "XS", quantity: 2 },
  { productId: "w-006", size: "S", quantity: 6 },
  { productId: "w-006", size: "M", quantity: 8 },
  { productId: "w-006", size: "L", quantity: 3 },
  { productId: "b-004", size: "One Size", quantity: 5 },
  // Prada
  { productId: "w-007", size: "S", quantity: 4 },
  { productId: "w-007", size: "M", quantity: 9 },
  { productId: "w-007", size: "L", quantity: 6 },
  { productId: "w-007", size: "XL", quantity: 1 },
  { productId: "b-006", size: "One Size", quantity: 11 },
  // Valentino
  { productId: "w-008", size: "XS", quantity: 7 },
  { productId: "w-008", size: "S", quantity: 12 },
  { productId: "w-008", size: "M", quantity: 9 },
  { productId: "w-008", size: "L", quantity: 4 },
  { productId: "b-008", size: "One Size", quantity: 6 },
  // Tom Ford
  { productId: "m-001", size: "S", quantity: 3 },
  { productId: "m-001", size: "M", quantity: 8 },
  { productId: "m-001", size: "L", quantity: 5 },
  { productId: "m-001", size: "XL", quantity: 2 },
  { productId: "m-001", size: "XXL", quantity: 1 },
  // Zegna
  { productId: "m-002", size: "S", quantity: 5 },
  { productId: "m-002", size: "M", quantity: 10 },
  { productId: "m-002", size: "L", quantity: 7 },
  { productId: "m-002", size: "XL", quantity: 3 },
  // Balenciaga
  { productId: "m-003", size: "S", quantity: 6 },
  { productId: "m-003", size: "M", quantity: 14 },
  { productId: "m-003", size: "L", quantity: 9 },
  { productId: "m-003", size: "XL", quantity: 4 },
  { productId: "m-003", size: "XXL", quantity: 2 },
  // Off-White
  { productId: "m-006", size: "S", quantity: 4 },
  { productId: "m-006", size: "M", quantity: 8 },
  { productId: "m-006", size: "L", quantity: 6 },
  { productId: "m-006", size: "XL", quantity: 2 },
  { productId: "m-006", size: "XXL", quantity: 0 },
  // Loro Piana
  { productId: "m-007", size: "S", quantity: 7 },
  { productId: "m-007", size: "M", quantity: 11 },
  { productId: "m-007", size: "L", quantity: 8 },
  { productId: "m-007", size: "XL", quantity: 3 },
  { productId: "m-007", size: "XXL", quantity: 1 },
];

export function getStockForBrand(brandSlug: string): StockEntry[] {
  const brandProductIds = getBrandProducts(brandSlug).map((p) => p.id);
  return allStockData.filter((s) => brandProductIds.includes(s.productId));
}

export function getTotalStockForProduct(productId: string): number {
  return allStockData
    .filter((s) => s.productId === productId)
    .reduce((sum, s) => sum + s.quantity, 0);
}

// ─── MOCK REVENUE (6 months) ──────────────────────────────────────────────────

const revenueMultipliers: Record<string, number> = {
  "louis-vuitton": 1.0,
  chanel: 0.82,
  gucci: 0.74,
  dior: 0.69,
  "saint-laurent": 0.58,
  prada: 0.63,
  "bottega-veneta": 0.52,
  valentino: 0.48,
  "tom-ford": 0.41,
  zegna: 0.38,
  balenciaga: 0.55,
  "off-white": 0.44,
  "loro-piana": 0.37,
  burberry: 0.46,
};

const baseRevenue: MonthlyRevenue[] = [
  { month: "Jul", revenue: 42800, orders: 74 },
  { month: "Aug", revenue: 51200, orders: 89 },
  { month: "Sep", revenue: 48600, orders: 84 },
  { month: "Oct", revenue: 63400, orders: 112 },
  { month: "Nov", revenue: 79200, orders: 138 },
  { month: "Dec", revenue: 94800, orders: 164 },
];

export function getMonthlyRevenue(brandSlug: string): MonthlyRevenue[] {
  const mult = revenueMultipliers[brandSlug] ?? 0.5;
  return baseRevenue.map((r) => ({
    month: r.month,
    revenue: Math.round(r.revenue * mult),
    orders: Math.round(r.orders * mult),
  }));
}

// ─── AGGREGATED STATS ─────────────────────────────────────────────────────────

export function getBrandStats(brandSlug: string) {
  const orders = getMockOrders(brandSlug);
  const revenue = getMonthlyRevenue(brandSlug);
  const products = getBrandProducts(brandSlug);
  const stock = getStockForBrand(brandSlug);

  const totalRevenue = revenue.reduce((s, r) => s + r.revenue, 0);
  const totalOrders = orders.length;
  const totalStock = stock.reduce((s, e) => s + e.quantity, 0);
  const avgOrderValue =
    totalOrders > 0
      ? Math.round(orders.reduce((s, o) => s + o.amount, 0) / totalOrders)
      : 0;
  const lowStockItems = stock.filter((s) => s.quantity > 0 && s.quantity <= 3).length;
  const outOfStockItems = stock.filter((s) => s.quantity === 0).length;

  const statusCounts = {
    pending: orders.filter((o) => o.status === "pending").length,
    processing: orders.filter((o) => o.status === "processing").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  // Top products by revenue
  const productRevenue: Record<string, { name: string; revenue: number }> = {};
  orders.forEach((o) => {
    if (!productRevenue[o.productId]) {
      productRevenue[o.productId] = { name: o.productName, revenue: 0 };
    }
    productRevenue[o.productId].revenue += o.amount;
  });
  const topProducts = Object.values(productRevenue)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Category breakdown
  const categoryMap: Record<string, number> = {};
  orders.forEach((o) => {
    const product = products.find((p) => p.id === o.productId);
    if (product) {
      categoryMap[product.category] = (categoryMap[product.category] ?? 0) + 1;
    }
  });
  const categoryBreakdown = Object.entries(categoryMap).map(([cat, count]) => ({
    name: cat.charAt(0).toUpperCase() + cat.slice(1),
    value: count,
  }));

  const newProducts = products.filter((p) => p.isNew).length;
  const saleProducts = products.filter((p) => p.isSale).length;

  return {
    totalRevenue,
    totalOrders,
    totalProducts: products.length,
    totalStock,
    avgOrderValue,
    lowStockItems,
    outOfStockItems,
    statusCounts,
    topProducts,
    categoryBreakdown,
    newProducts,
    saleProducts,
    recentOrders: [...orders].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    ),
  };
}
