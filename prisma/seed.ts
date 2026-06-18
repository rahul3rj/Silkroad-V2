// prisma/seed.ts
// Seeds the catalogue (brands, categories, products, variants) from the existing
// mock data in src/lib/data.ts + stock levels from src/lib/adminData.ts.
//
// Run with:  npx prisma db seed   (configured in prisma.config.ts)
//
// NOTE on super-admins: super-admin accounts are NOT seeded. Sign up normally
// with an email listed in SUPER_ADMIN_EMAILS — you'll be elevated on first login.
// Brand-admin accounts are created later via the super-admin "Brand Manage" panel.
//
// Prices in the mock data are whole dollars; we store cents (×100).

import { PrismaPg } from "@prisma/adapter-pg";
import PrismaClient from "@prisma/client";

// ── Inline seed data (no longer depends on src/lib/data.ts) ──────────────────

interface SeedColor { name: string; hex: string }
interface SeedProduct {
  id: string; slug: string; name: string; brandSlug: string;
  category: string; subcategory: string; price: number;
  salePrice?: number; imageSrc: string; images: string[];
  colors: SeedColor[]; sizes: string[]; isNew: boolean; isSale: boolean;
  description: string; tags: string[];
}
interface SeedBrand { name: string; slug: string; tagline: string; logoUrl: string }
interface SeedStock { productId: string; size: string; quantity: number }

const brandsData: SeedBrand[] = [
  { name: "Louis Vuitton", slug: "louis-vuitton", tagline: "The art of travel & savoir-faire", logoUrl: "https://cdn.brandfetch.io/idQH6e1xMu/theme/dark/logo.svg?c=1bxid64Mup7aczewSAYMX&t=1676549441690" },
  { name: "Chanel", slug: "chanel", tagline: "Elegance is refusal", logoUrl: "https://cdn.brandfetch.io/idBUm3gJdJ/theme/dark/logo.svg?c=1bxid64Mup7aczewSAYMX&t=1741582517692" },
  { name: "Gucci", slug: "gucci", tagline: "Quality is remembered long after price is forgotten", logoUrl: "https://cdn.brandfetch.io/idsVLhORjl/theme/dark/logo.svg?c=1bxid64Mup7aczewSAYMX&t=1731307368249" },
  { name: "Dior", slug: "dior", tagline: "Haute couture redefined", logoUrl: "https://cdn.brandfetch.io/id26xlFDgU/theme/dark/logo.svg?c=1bxid64Mup7aczewSAYMX&t=1675924242165" },
  { name: "Saint Laurent", slug: "saint-laurent", tagline: "Fashions fade, style is eternal", logoUrl: "https://cdn.brandfetch.io/id46TZWBZw/theme/dark/logo.svg?c=1bxid64Mup7aczewSAYMX&t=1776143091418" },
  { name: "Prada", slug: "prada", tagline: "Intellectual simplicity", logoUrl: "https://cdn.brandfetch.io/idxHSB9cRy/theme/dark/logo.svg?c=1bxid64Mup7aczewSAYMX&t=1676977841307" },
  { name: "Bottega Veneta", slug: "bottega-veneta", tagline: "When your own initials are enough", logoUrl: "https://cdn.brandfetch.io/idHr7TJ--U/theme/dark/logo.svg?c=1bxid64Mup7aczewSAYMX&t=1772357501918" },
  { name: "Valentino", slug: "valentino", tagline: "Passion, creativity, craftsmanship", logoUrl: "https://cdn.brandfetch.io/idR3D929sw/theme/dark/symbol.svg?c=1bxid64Mup7aczewSAYMX&t=1668076778639" },
  { name: "Tom Ford", slug: "tom-ford", tagline: "Precision tailoring, modern luxury", logoUrl: "https://cdn.brandfetch.io/ideeVavu1a/theme/dark/logo.svg?c=1bxid64Mup7aczewSAYMX&t=1772377725229" },
  { name: "Zegna", slug: "zegna", tagline: "The finest Italian tailoring", logoUrl: "https://cdn.brandfetch.io/idQ9jQhxY8/theme/dark/logo.svg?c=1bxid64Mup7aczewSAYMX&t=1773646166336" },
  { name: "Balenciaga", slug: "balenciaga", tagline: "Couture with an edge", logoUrl: "https://cdn.brandfetch.io/idb2q0I-4r/w/820/h/96/theme/dark/logo.png?c=1bxid64Mup7aczewSAYMX&t=1772406483781" },
  { name: "Burberry", slug: "burberry", tagline: "British heritage, global vision", logoUrl: "https://cdn.brandfetch.io/id3krW0AT0/theme/dark/logo.svg?c=1bxid64Mup7aczewSAYMX&t=1675840242033" },
  { name: "Off-White", slug: "off-white", tagline: "Defining the grey area between black and white", logoUrl: "https://images.seeklogo.com/logo-png/36/1/off-white-logo-png_seeklogo-361774.png" },
  { name: "Loro Piana", slug: "loro-piana", tagline: "The gift of kings", logoUrl: "https://cdn.brandfetch.io/idCKS1PInO/theme/dark/logo.svg?c=1bxid64Mup7aczewSAYMX&t=1773224149882" },
];

const allProducts: SeedProduct[] = [
  { id:"w-001", slug:"silk-draped-maxi-dress", name:"Silk Draped Maxi Dress", brandSlug:"louis-vuitton", category:"women", subcategory:"Dresses", price:499, imageSrc:"/images/cc1.png", images:["/images/cc1.png"], colors:[{name:"Noir",hex:"#1a1a1a"},{name:"Ivory",hex:"#f5f0e8"},{name:"Sage",hex:"#8a9e7a"}], sizes:["XS","S","M","L","XL"], isNew:true, isSale:false, description:"An ethereal silk maxi dress with artful draping.", tags:["silk","maxi","dress","evening"] },
  { id:"w-002", slug:"ivory-wrap-co-ord-set", name:"Ivory Wrap Co-Ord Set", brandSlug:"chanel", category:"women", subcategory:"Co-Ords", price:490, imageSrc:"/images/cc2.png", images:["/images/cc2.png"], colors:[{name:"Ivory",hex:"#f5f0e8"},{name:"Champagne",hex:"#d4af7a"},{name:"Slate",hex:"#2e3a4a"}], sizes:["XS","S","M","L"], isNew:true, isSale:false, description:"A fluid ivory wrap set.", tags:["wrap","set","co-ord","minimalist"] },
  { id:"w-003", slug:"fur-trim-oversized-coat", name:"Fur Trim Oversized Coat", brandSlug:"gucci", category:"women", subcategory:"Outerwear", price:499, imageSrc:"/images/cc3.png", images:["/images/cc3.png"], colors:[{name:"Camel",hex:"#c19a6b"},{name:"Noir",hex:"#1a1a1a"},{name:"Stone",hex:"#b5a99a"}], sizes:["S","M","L","XL"], isNew:false, isSale:false, description:"Opulent fur-trimmed overcoat.", tags:["coat","fur","outerwear","luxury"] },
  { id:"w-004", slug:"pleated-sculptural-gown", name:"Pleated Sculptural Gown", brandSlug:"dior", category:"women", subcategory:"Gowns", price:499, imageSrc:"/images/pp3.png", images:["/images/pp3.png"], colors:[{name:"Sand",hex:"#d4c5a9"},{name:"Blush",hex:"#e8b4b8"},{name:"Taupe",hex:"#8b7d6b"}], sizes:["XS","S","M","L"], isNew:true, isSale:false, description:"Architecturally inspired pleated gown.", tags:["gown","pleated","evening","sculptural"] },
  { id:"w-005", slug:"black-silk-slip-dress", name:"Black Silk Slip Dress", brandSlug:"saint-laurent", category:"women", subcategory:"Dresses", price:390, salePrice:299, imageSrc:"/images/pp2.png", images:["/images/pp2.png"], colors:[{name:"Noir",hex:"#1a1a1a"},{name:"Burgundy",hex:"#7a1a2e"},{name:"Forest",hex:"#2d4a3e"}], sizes:["XS","S","M","L","XL"], isNew:false, isSale:true, description:"The quintessential silk slip.", tags:["slip","dress","silk","minimal"] },
  { id:"w-006", slug:"textured-knit-column-dress", name:"Textured Knit Column Dress", brandSlug:"bottega-veneta", category:"women", subcategory:"Dresses", price:450, imageSrc:"/images/pp4.png", images:["/images/pp4.png"], colors:[{name:"Ecru",hex:"#f2ede4"},{name:"Slate Blue",hex:"#4a6887"},{name:"Mink",hex:"#9e8a7a"}], sizes:["XS","S","M","L"], isNew:true, isSale:false, description:"A richly textured knit column dress.", tags:["knit","column","dress","textured"] },
  { id:"w-007", slug:"asymmetric-blazer-dress", name:"Asymmetric Blazer Dress", brandSlug:"prada", category:"women", subcategory:"Dresses", price:520, imageSrc:"/images/pp5.png", images:["/images/pp5.png"], colors:[{name:"Chalk",hex:"#f0ede8"},{name:"Charcoal",hex:"#3a3a3a"},{name:"Caramel",hex:"#c8956c"}], sizes:["S","M","L","XL"], isNew:false, isSale:false, description:"Where tailoring meets drama.", tags:["blazer","dress","tailored","power"] },
  { id:"w-008", slug:"bias-cut-satin-skirt", name:"Bias Cut Satin Skirt", brandSlug:"valentino", category:"women", subcategory:"Skirts", price:310, imageSrc:"/images/pp6.png", images:["/images/pp6.png"], colors:[{name:"Champagne",hex:"#d4af7a"},{name:"Midnight",hex:"#1a1a2e"},{name:"Rose",hex:"#e8b4b8"}], sizes:["XS","S","M","L"], isNew:true, isSale:false, description:"A fluid bias-cut satin skirt.", tags:["satin","skirt","bias-cut","fluid"] },
  { id:"m-001", slug:"cream-linen-suit", name:"Cream Linen Suit", brandSlug:"tom-ford", category:"men", subcategory:"Suits", price:899, imageSrc:"/images/pp5.png", images:["/images/pp5.png"], colors:[{name:"Cream",hex:"#f5f0e0"},{name:"Navy",hex:"#1a2a4a"},{name:"Sage",hex:"#8a9e7a"}], sizes:["S","M","L","XL","XXL"], isNew:true, isSale:false, description:"Impeccably tailored cream linen suit.", tags:["suit","linen","tailored","formal"] },
  { id:"m-002", slug:"olive-structured-blazer", name:"Olive Structured Blazer", brandSlug:"zegna", category:"men", subcategory:"Blazers", price:599, imageSrc:"/images/pp6.png", images:["/images/pp6.png"], colors:[{name:"Olive",hex:"#4a5240"},{name:"Charcoal",hex:"#3a3a3a"},{name:"Navy",hex:"#1a2a4a"}], sizes:["S","M","L","XL"], isNew:true, isSale:false, description:"A militarily structured olive blazer.", tags:["blazer","structured","olive","military"] },
  { id:"m-003", slug:"all-black-wide-leg-trousers", name:"All Black Wide-Leg Trousers", brandSlug:"balenciaga", category:"men", subcategory:"Trousers", price:399, imageSrc:"/images/pp7.png", images:["/images/pp7.png"], colors:[{name:"Noir",hex:"#1a1a1a"},{name:"Slate",hex:"#5a6472"},{name:"Camel",hex:"#c19a6b"}], sizes:["S","M","L","XL","XXL"], isNew:false, isSale:false, description:"Wide-leg silhouette in all-black.", tags:["trousers","wide-leg","black","minimal"] },
  { id:"m-004", slug:"ivory-linen-overshirt", name:"Ivory Linen Overshirt", brandSlug:"louis-vuitton", category:"men", subcategory:"Shirts", price:289, imageSrc:"/images/pp8.png", images:["/images/pp8.png"], colors:[{name:"Ivory",hex:"#f5f0e8"},{name:"Sky",hex:"#9ab8c8"},{name:"Stone",hex:"#b5a99a"}], sizes:["S","M","L","XL","XXL"], isNew:true, isSale:false, description:"A relaxed ivory linen overshirt.", tags:["shirt","linen","overshirt","relaxed"] },
  { id:"m-006", slug:"silk-cargo-trousers", name:"Silk Cargo Trousers", brandSlug:"off-white", category:"men", subcategory:"Trousers", price:450, imageSrc:"/images/cc2.png", images:["/images/cc2.png"], colors:[{name:"Sand",hex:"#d4c5a9"},{name:"Forest",hex:"#2d4a3e"},{name:"Noir",hex:"#1a1a1a"}], sizes:["S","M","L","XL","XXL"], isNew:true, isSale:false, description:"Reimagined cargo trousers in lustrous silk.", tags:["cargo","silk","trousers","utility"] },
  { id:"m-007", slug:"merino-turtleneck", name:"Merino Turtleneck", brandSlug:"loro-piana", category:"men", subcategory:"Knitwear", price:320, salePrice:249, imageSrc:"/images/cc3.png", images:["/images/cc3.png"], colors:[{name:"Ecru",hex:"#f2ede4"},{name:"Bordeaux",hex:"#8b1a2e"},{name:"Slate",hex:"#5a6472"}], sizes:["S","M","L","XL","XXL"], isNew:false, isSale:true, description:"Supremely soft merino turtleneck.", tags:["merino","turtleneck","knitwear","essential"] },
  { id:"m-008", slug:"cropped-leather-jacket", name:"Cropped Leather Jacket", brandSlug:"saint-laurent", category:"men", subcategory:"Outerwear", price:799, imageSrc:"/images/cc1.png", images:["/images/cc1.png"], colors:[{name:"Noir",hex:"#1a1a1a"},{name:"Cognac",hex:"#9e5a2a"},{name:"Slate",hex:"#5a6472"}], sizes:["S","M","L","XL"], isNew:true, isSale:false, description:"A cropped leather jacket with a razor-sharp edge.", tags:["leather","jacket","cropped","outerwear"] },
  { id:"b-001", slug:"silk-tote-grande", name:"Silk Tote Grande", brandSlug:"louis-vuitton", category:"bags", subcategory:"Totes", price:750, imageSrc:"/images/pp2.png", images:["/images/pp2.png"], colors:[{name:"Ivory",hex:"#f5f0e8"},{name:"Camel",hex:"#c19a6b"},{name:"Noir",hex:"#1a1a1a"}], sizes:["One Size"], isNew:true, isSale:false, description:"The Silk Tote Grande.", tags:["tote","bag","silk","everyday"] },
  { id:"b-002", slug:"structured-mini-handbag", name:"Structured Mini Handbag", brandSlug:"chanel", category:"bags", subcategory:"Handbags", price:590, imageSrc:"/images/pp3.png", images:["/images/pp3.png"], colors:[{name:"Blush",hex:"#e8b4b8"},{name:"Noir",hex:"#1a1a1a"},{name:"Cognac",hex:"#9e5a2a"}], sizes:["One Size"], isNew:true, isSale:false, description:"A flawlessly structured mini handbag.", tags:["handbag","mini","structured","evening"] },
  { id:"b-003", slug:"leather-crossbody-chain", name:"Leather Crossbody Chain Bag", brandSlug:"gucci", category:"bags", subcategory:"Crossbody", price:680, imageSrc:"/images/pp4.png", images:["/images/pp4.png"], colors:[{name:"Noir",hex:"#1a1a1a"},{name:"Gold-Tan",hex:"#c8956c"},{name:"Stone",hex:"#b5a99a"}], sizes:["One Size"], isNew:false, isSale:false, description:"A sleek leather crossbody with gold chain hardware.", tags:["crossbody","chain","leather","evening"] },
  { id:"b-004", slug:"suede-slouch-shoulder-bag", name:"Suede Slouch Shoulder Bag", brandSlug:"bottega-veneta", category:"bags", subcategory:"Shoulder Bags", price:820, imageSrc:"/images/pp5.png", images:["/images/pp5.png"], colors:[{name:"Caramel",hex:"#c8956c"},{name:"Bordeaux",hex:"#8b1a2e"},{name:"Charcoal",hex:"#3a3a3a"}], sizes:["One Size"], isNew:true, isSale:false, description:"Buttery suede shoulder bag.", tags:["suede","shoulder","bag","slouch"] },
  { id:"b-005", slug:"boxy-leather-clutch", name:"Boxy Leather Clutch", brandSlug:"dior", category:"bags", subcategory:"Clutches", price:420, salePrice:320, imageSrc:"/images/pp6.png", images:["/images/pp6.png"], colors:[{name:"Ivory",hex:"#f5f0e8"},{name:"Noir",hex:"#1a1a1a"},{name:"Rose Gold",hex:"#c49a7b"}], sizes:["One Size"], isNew:false, isSale:true, description:"A clean-lined boxy clutch.", tags:["clutch","leather","evening","boxy"] },
  { id:"b-006", slug:"woven-raffia-basket-bag", name:"Woven Raffia Basket Bag", brandSlug:"prada", category:"bags", subcategory:"Totes", price:380, imageSrc:"/images/pp7.png", images:["/images/pp7.png"], colors:[{name:"Natural",hex:"#d4b896"},{name:"Noir",hex:"#1a1a1a"},{name:"Terracotta",hex:"#c4622d"}], sizes:["One Size"], isNew:true, isSale:false, description:"Hand-woven raffia basket bag.", tags:["raffia","basket","woven","resort"] },
  { id:"b-007", slug:"quilted-lambskin-flap", name:"Quilted Lambskin Flap Bag", brandSlug:"chanel", category:"bags", subcategory:"Handbags", price:1250, imageSrc:"/images/pp8.png", images:["/images/pp8.png"], colors:[{name:"Noir",hex:"#1a1a1a"},{name:"Cream",hex:"#f5f0e0"},{name:"Sage",hex:"#8a9e7a"}], sizes:["One Size"], isNew:true, isSale:false, description:"Quilted lambskin flap bag.", tags:["quilted","lambskin","flap","heritage"] },
  { id:"b-008", slug:"leather-backpack-mini", name:"Leather Mini Backpack", brandSlug:"valentino", category:"bags", subcategory:"Backpacks", price:690, imageSrc:"/images/cc3.png", images:["/images/cc3.png"], colors:[{name:"Cognac",hex:"#9e5a2a"},{name:"Noir",hex:"#1a1a1a"},{name:"Stone",hex:"#b5a99a"}], sizes:["One Size"], isNew:false, isSale:false, description:"A compact leather mini backpack.", tags:["backpack","mini","leather","urban"] },
];

const allStockData: SeedStock[] = [
  { productId:"w-001", size:"XS", quantity:3 }, { productId:"w-001", size:"S", quantity:8 }, { productId:"w-001", size:"M", quantity:12 }, { productId:"w-001", size:"L", quantity:5 }, { productId:"w-001", size:"XL", quantity:2 },
  { productId:"m-004", size:"S", quantity:6 }, { productId:"m-004", size:"M", quantity:14 }, { productId:"m-004", size:"L", quantity:9 }, { productId:"m-004", size:"XL", quantity:3 }, { productId:"m-004", size:"XXL", quantity:1 },
  { productId:"b-001", size:"One Size", quantity:7 },
  { productId:"w-002", size:"XS", quantity:4 }, { productId:"w-002", size:"S", quantity:11 }, { productId:"w-002", size:"M", quantity:7 }, { productId:"w-002", size:"L", quantity:2 },
  { productId:"b-002", size:"One Size", quantity:5 }, { productId:"b-007", size:"One Size", quantity:9 },
  { productId:"w-003", size:"S", quantity:6 }, { productId:"w-003", size:"M", quantity:10 }, { productId:"w-003", size:"L", quantity:4 }, { productId:"w-003", size:"XL", quantity:1 },
  { productId:"b-003", size:"One Size", quantity:8 },
  { productId:"w-004", size:"XS", quantity:3 }, { productId:"w-004", size:"S", quantity:8 }, { productId:"w-004", size:"M", quantity:6 }, { productId:"w-004", size:"L", quantity:2 },
  { productId:"b-005", size:"One Size", quantity:4 },
  { productId:"w-005", size:"XS", quantity:5 }, { productId:"w-005", size:"S", quantity:9 }, { productId:"w-005", size:"M", quantity:13 }, { productId:"w-005", size:"L", quantity:6 }, { productId:"w-005", size:"XL", quantity:0 },
  { productId:"m-008", size:"S", quantity:3 }, { productId:"m-008", size:"M", quantity:7 }, { productId:"m-008", size:"L", quantity:5 }, { productId:"m-008", size:"XL", quantity:2 },
  { productId:"w-006", size:"XS", quantity:2 }, { productId:"w-006", size:"S", quantity:6 }, { productId:"w-006", size:"M", quantity:8 }, { productId:"w-006", size:"L", quantity:3 },
  { productId:"b-004", size:"One Size", quantity:5 },
  { productId:"w-007", size:"S", quantity:4 }, { productId:"w-007", size:"M", quantity:9 }, { productId:"w-007", size:"L", quantity:6 }, { productId:"w-007", size:"XL", quantity:1 },
  { productId:"b-006", size:"One Size", quantity:11 },
  { productId:"w-008", size:"XS", quantity:7 }, { productId:"w-008", size:"S", quantity:12 }, { productId:"w-008", size:"M", quantity:9 }, { productId:"w-008", size:"L", quantity:4 },
  { productId:"b-008", size:"One Size", quantity:6 },
  { productId:"m-001", size:"S", quantity:3 }, { productId:"m-001", size:"M", quantity:8 }, { productId:"m-001", size:"L", quantity:5 }, { productId:"m-001", size:"XL", quantity:2 }, { productId:"m-001", size:"XXL", quantity:1 },
  { productId:"m-002", size:"S", quantity:5 }, { productId:"m-002", size:"M", quantity:10 }, { productId:"m-002", size:"L", quantity:7 }, { productId:"m-002", size:"XL", quantity:3 },
  { productId:"m-003", size:"S", quantity:6 }, { productId:"m-003", size:"M", quantity:14 }, { productId:"m-003", size:"L", quantity:9 }, { productId:"m-003", size:"XL", quantity:4 }, { productId:"m-003", size:"XXL", quantity:2 },
  { productId:"m-006", size:"S", quantity:4 }, { productId:"m-006", size:"M", quantity:8 }, { productId:"m-006", size:"L", quantity:6 }, { productId:"m-006", size:"XL", quantity:2 }, { productId:"m-006", size:"XXL", quantity:0 },
  { productId:"m-007", size:"S", quantity:7 }, { productId:"m-007", size:"M", quantity:11 }, { productId:"m-007", size:"L", quantity:8 }, { productId:"m-007", size:"XL", quantity:3 }, { productId:"m-007", size:"XXL", quantity:1 },
];


const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Default per-size stock when the mock data has no entry for a product+size.
const DEFAULT_STOCK = 10;

type Gender = "WOMEN" | "MEN" | "UNISEX";

const CATEGORIES: { slug: string; name: string; gender: Gender | null; sortOrder: number }[] = [
  { slug: "women", name: "Women", gender: "WOMEN", sortOrder: 0 },
  { slug: "men", name: "Men", gender: "MEN", sortOrder: 1 },
  { slug: "bags", name: "Bags", gender: null, sortOrder: 2 },
];

async function main() {
  console.log("🌱 Seeding Silkroad catalogue…");

  // ── 1. Clear existing catalogue (fresh DB assumed; safe order for FKs) ──────
  console.log("   Clearing existing catalogue…");
  await prisma.cartItem.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.recentlyViewed.deleteMany();
  await prisma.variant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();

  // ── 2. Brands ───────────────────────────────────────────────────────────────
  console.log(`   Creating ${brandsData.length} brands…`);
  const brandIdBySlug = new Map<string, string>();
  for (const b of brandsData) {
    const brand = await prisma.brand.create({
      data: {
        name: b.name,
        slug: b.slug,
        tagline: b.tagline ?? null,
        logoUrl: b.logoUrl ?? null,
        isActive: true,
      },
    });
    brandIdBySlug.set(b.slug, brand.id);
  }

  // ── 3. Categories ─────────────────────────────────────────────────────────
  console.log(`   Creating ${CATEGORIES.length} categories…`);
  const categoryIdBySlug = new Map<string, string>();
  for (const c of CATEGORIES) {
    const cat = await prisma.category.create({
      data: { name: c.name, slug: c.slug, gender: c.gender, sortOrder: c.sortOrder, isActive: true },
    });
    categoryIdBySlug.set(c.slug, cat.id);
  }

  // ── 4. Build a stock lookup: `${mockProductId}|${size}` → quantity ──────────
  const stockMap = new Map<string, number>();
  for (const entry of allStockData) {
    stockMap.set(`${entry.productId}|${entry.size}`, entry.quantity);
  }

  // ── 5. Products + variants ──────────────────────────────────────────────────
  console.log(`   Creating ${allProducts.length} products with variants…`);
  let productCount = 0;
  let variantCount = 0;

  for (const p of allProducts) {
    const brandId = brandIdBySlug.get(p.brandSlug);
    const categoryId = categoryIdBySlug.get(p.category);
    if (!brandId || !categoryId) {
      console.warn(`   ⚠ Skipping ${p.slug} — unknown brand/category (${p.brandSlug}/${p.category})`);
      continue;
    }

    await prisma.product.create({
      data: {
        slug: p.slug,
        name: p.name,
        description: p.description,
        brandId,
        categoryId,
        subcategory: p.subcategory,
        price: Math.round(p.price * 100),
        salePrice: p.salePrice != null ? Math.round(p.salePrice * 100) : null,
        imageSrc: p.imageSrc,
        images: p.images ?? [],
        colors: JSON.parse(JSON.stringify(p.colors ?? [])),
        tags: p.tags ?? [],
        isNew: p.isNew,
        isSale: p.isSale,
        isActive: true,
        variants: {
          create: p.sizes.map((size) => {
            const stock = stockMap.get(`${p.id}|${size}`) ?? DEFAULT_STOCK;
            variantCount++;
            return { size, stock };
          }),
        },
      },
    });
    productCount++;
  }

  console.log(`✅ Done. ${brandsData.length} brands, ${CATEGORIES.length} categories, ${productCount} products, ${variantCount} variants.`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
