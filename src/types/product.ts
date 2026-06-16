// src/types/product.ts
// Shared TypeScript interfaces for product and brand data.
// These match the DTO shape returned by /api/products and /api/brands.

export interface ProductColor {
  name: string;
  hex: string;
}

export interface ProductData {
  id: string;
  slug: string;
  name: string;
  brand: string;       // Display name e.g. "Louis Vuitton"
  brandSlug: string;   // URL slug e.g. "louis-vuitton"
  category: string;    // "men" | "women" | "bags"
  subcategory: string;
  price: number;       // Whole dollars (converted from cents by the API)
  salePrice?: number;
  imageSrc: string;
  images: string[];
  colors: ProductColor[];
  sizes: string[];
  isNew: boolean;
  isSale: boolean;
  description: string;
  tags: string[];
}

export interface BrandData {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  logoUrl: string | null;
}
