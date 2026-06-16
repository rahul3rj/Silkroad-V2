// data.ts — Static product data for Silkroad v2 (placeholder until backend is live)

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
  price: number;
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
  name: string;        // Display name
  slug: string;        // URL slug
  tagline: string;     // Short descriptor
  logoUrl: string;     // Horizontal wordmark logo URL
}

// ─── WOMEN'S PRODUCTS ──────────────────────────────────────────────────────────
export const womenProducts: ProductData[] = [
  {
    id: "w-001",
    slug: "silk-draped-maxi-dress",
    name: "Silk Draped Maxi Dress",
    brand: "Louis Vuitton",
    brandSlug: "louis-vuitton",
    category: "women",
    subcategory: "Dresses",
    price: 499,
    imageSrc: "/images/cc1.png",
    images: ["/images/cc1.png"],
    colors: [
      { name: "Noir", hex: "#1a1a1a" },
      { name: "Ivory", hex: "#f5f0e8" },
      { name: "Sage", hex: "#8a9e7a" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    isNew: true,
    isSale: false,
    description:
      "An ethereal silk maxi dress with artful draping — designed for the woman who commands every room she enters.",
    tags: ["silk", "maxi", "dress", "evening"],
  },
  {
    id: "w-002",
    slug: "ivory-wrap-co-ord-set",
    name: "Ivory Wrap Co-Ord Set",
    brand: "Chanel",
    brandSlug: "chanel",
    category: "women",
    subcategory: "Co-Ords",
    price: 490,
    imageSrc: "/images/cc2.png",
    images: ["/images/cc2.png"],
    colors: [
      { name: "Ivory", hex: "#f5f0e8" },
      { name: "Champagne", hex: "#d4af7a" },
      { name: "Slate", hex: "#2e3a4a" },
    ],
    sizes: ["XS", "S", "M", "L"],
    isNew: true,
    isSale: false,
    description:
      "A fluid ivory wrap set that transitions seamlessly from day to dusk. Minimalism elevated.",
    tags: ["wrap", "set", "co-ord", "minimalist"],
  },
  {
    id: "w-003",
    slug: "fur-trim-oversized-coat",
    name: "Fur Trim Oversized Coat",
    brand: "Gucci",
    brandSlug: "gucci",
    category: "women",
    subcategory: "Outerwear",
    price: 499,
    imageSrc: "/images/cc3.png",
    images: ["/images/cc3.png"],
    colors: [
      { name: "Camel", hex: "#c19a6b" },
      { name: "Noir", hex: "#1a1a1a" },
      { name: "Stone", hex: "#b5a99a" },
    ],
    sizes: ["S", "M", "L", "XL"],
    isNew: false,
    isSale: false,
    description:
      "Opulent fur-trimmed overcoat with a statement silhouette. A masterpiece in cold-weather luxury.",
    tags: ["coat", "fur", "outerwear", "luxury"],
  },
  {
    id: "w-004",
    slug: "pleated-sculptural-gown",
    name: "Pleated Sculptural Gown",
    brand: "Dior",
    brandSlug: "dior",
    category: "women",
    subcategory: "Gowns",
    price: 499,
    imageSrc: "/images/pp3.png",
    images: ["/images/pp3.png"],
    colors: [
      { name: "Sand", hex: "#d4c5a9" },
      { name: "Blush", hex: "#e8b4b8" },
      { name: "Taupe", hex: "#8b7d6b" },
    ],
    sizes: ["XS", "S", "M", "L"],
    isNew: true,
    isSale: false,
    description:
      "Architecturally inspired pleated gown — a wearable sculpture for the modern woman.",
    tags: ["gown", "pleated", "evening", "sculptural"],
  },
  {
    id: "w-005",
    slug: "black-silk-slip-dress",
    name: "Black Silk Slip Dress",
    brand: "Saint Laurent",
    brandSlug: "saint-laurent",
    category: "women",
    subcategory: "Dresses",
    price: 390,
    imageSrc: "/images/pp2.png",
    images: ["/images/pp2.png"],
    colors: [
      { name: "Noir", hex: "#1a1a1a" },
      { name: "Burgundy", hex: "#7a1a2e" },
      { name: "Forest", hex: "#2d4a3e" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    isNew: false,
    isSale: true,
    salePrice: 299,
    description:
      "The quintessential silk slip. Effortless, sensual, and timeless.",
    tags: ["slip", "dress", "silk", "minimal"],
  },
  {
    id: "w-006",
    slug: "textured-knit-column-dress",
    name: "Textured Knit Column Dress",
    brand: "Bottega Veneta",
    brandSlug: "bottega-veneta",
    category: "women",
    subcategory: "Dresses",
    price: 450,
    imageSrc: "/images/pp4.png",
    images: ["/images/pp4.png"],
    colors: [
      { name: "Ecru", hex: "#f2ede4" },
      { name: "Slate Blue", hex: "#4a6887" },
      { name: "Mink", hex: "#9e8a7a" },
    ],
    sizes: ["XS", "S", "M", "L"],
    isNew: true,
    isSale: false,
    description:
      "A richly textured knit column dress that sculpts and flows with every step.",
    tags: ["knit", "column", "dress", "textured"],
  },
  {
    id: "w-007",
    slug: "asymmetric-blazer-dress",
    name: "Asymmetric Blazer Dress",
    brand: "Prada",
    brandSlug: "prada",
    category: "women",
    subcategory: "Dresses",
    price: 520,
    imageSrc: "/images/pp5.png",
    images: ["/images/pp5.png"],
    colors: [
      { name: "Chalk", hex: "#f0ede8" },
      { name: "Charcoal", hex: "#3a3a3a" },
      { name: "Caramel", hex: "#c8956c" },
    ],
    sizes: ["S", "M", "L", "XL"],
    isNew: false,
    isSale: false,
    description:
      "Where tailoring meets drama. An asymmetric blazer dress for the boardroom and beyond.",
    tags: ["blazer", "dress", "tailored", "power"],
  },
  {
    id: "w-008",
    slug: "bias-cut-satin-skirt",
    name: "Bias Cut Satin Skirt",
    brand: "Valentino",
    brandSlug: "valentino",
    category: "women",
    subcategory: "Skirts",
    price: 310,
    imageSrc: "/images/pp6.png",
    images: ["/images/pp6.png"],
    colors: [
      { name: "Champagne", hex: "#d4af7a" },
      { name: "Midnight", hex: "#1a1a2e" },
      { name: "Rose", hex: "#e8b4b8" },
    ],
    sizes: ["XS", "S", "M", "L"],
    isNew: true,
    isSale: false,
    description:
      "A fluid bias-cut satin skirt that catches the light with every movement.",
    tags: ["satin", "skirt", "bias-cut", "fluid"],
  },
];

// ─── MEN'S PRODUCTS ────────────────────────────────────────────────────────────
export const menProducts: ProductData[] = [
  {
    id: "m-001",
    slug: "cream-linen-suit",
    name: "Cream Linen Suit",
    brand: "Tom Ford",
    brandSlug: "tom-ford",
    category: "men",
    subcategory: "Suits",
    price: 899,
    imageSrc: "/images/pp5.png",
    images: ["/images/pp5.png"],
    colors: [
      { name: "Cream", hex: "#f5f0e0" },
      { name: "Navy", hex: "#1a2a4a" },
      { name: "Sage", hex: "#8a9e7a" },
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    isNew: true,
    isSale: false,
    description:
      "Impeccably tailored cream linen suit. Languid luxury for the modern gentleman.",
    tags: ["suit", "linen", "tailored", "formal"],
  },
  {
    id: "m-002",
    slug: "olive-structured-blazer",
    name: "Olive Structured Blazer",
    brand: "Zegna",
    brandSlug: "zegna",
    category: "men",
    subcategory: "Blazers",
    price: 599,
    imageSrc: "/images/pp6.png",
    images: ["/images/pp6.png"],
    colors: [
      { name: "Olive", hex: "#4a5240" },
      { name: "Charcoal", hex: "#3a3a3a" },
      { name: "Navy", hex: "#1a2a4a" },
    ],
    sizes: ["S", "M", "L", "XL"],
    isNew: true,
    isSale: false,
    description:
      "A militarily structured olive blazer. Authority wears this silhouette.",
    tags: ["blazer", "structured", "olive", "military"],
  },
  {
    id: "m-003",
    slug: "all-black-wide-leg-trousers",
    name: "All Black Wide-Leg Trousers",
    brand: "Balenciaga",
    brandSlug: "balenciaga",
    category: "men",
    subcategory: "Trousers",
    price: 399,
    imageSrc: "/images/pp7.png",
    images: ["/images/pp7.png"],
    colors: [
      { name: "Noir", hex: "#1a1a1a" },
      { name: "Slate", hex: "#5a6472" },
      { name: "Camel", hex: "#c19a6b" },
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    isNew: false,
    isSale: false,
    description:
      "Wide-leg silhouette in all-black — draped over the body with commanding ease.",
    tags: ["trousers", "wide-leg", "black", "minimal"],
  },
  {
    id: "m-004",
    slug: "ivory-linen-overshirt",
    name: "Ivory Linen Overshirt",
    brand: "Louis Vuitton",
    brandSlug: "louis-vuitton",
    category: "men",
    subcategory: "Shirts",
    price: 289,
    imageSrc: "/images/pp8.png",
    images: ["/images/pp8.png"],
    colors: [
      { name: "Ivory", hex: "#f5f0e8" },
      { name: "Sky", hex: "#9ab8c8" },
      { name: "Stone", hex: "#b5a99a" },
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    isNew: true,
    isSale: false,
    description:
      "A relaxed ivory linen overshirt with a worn-in yet pristine quality. Weekend luxury.",
    tags: ["shirt", "linen", "overshirt", "relaxed"],
  },
  {
    id: "m-006",
    slug: "silk-cargo-trousers",
    name: "Silk Cargo Trousers",
    brand: "Off-White",
    brandSlug: "off-white",
    category: "men",
    subcategory: "Trousers",
    price: 450,
    imageSrc: "/images/cc2.png",
    images: ["/images/cc2.png"],
    colors: [
      { name: "Sand", hex: "#d4c5a9" },
      { name: "Forest", hex: "#2d4a3e" },
      { name: "Noir", hex: "#1a1a1a" },
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    isNew: true,
    isSale: false,
    description:
      "Reimagined cargo trousers in lustrous silk. Utility meets high fashion.",
    tags: ["cargo", "silk", "trousers", "utility"],
  },
  {
    id: "m-007",
    slug: "merino-turtleneck",
    name: "Merino Turtleneck",
    brand: "Loro Piana",
    brandSlug: "loro-piana",
    category: "men",
    subcategory: "Knitwear",
    price: 320,
    imageSrc: "/images/cc3.png",
    images: ["/images/cc3.png"],
    colors: [
      { name: "Ecru", hex: "#f2ede4" },
      { name: "Bordeaux", hex: "#8b1a2e" },
      { name: "Slate", hex: "#5a6472" },
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    isNew: false,
    isSale: true,
    salePrice: 249,
    description:
      "Supremely soft merino turtleneck. The cornerstone of a discerning wardrobe.",
    tags: ["merino", "turtleneck", "knitwear", "essential"],
  },
  {
    id: "m-008",
    slug: "cropped-leather-jacket",
    name: "Cropped Leather Jacket",
    brand: "Saint Laurent",
    brandSlug: "saint-laurent",
    category: "men",
    subcategory: "Outerwear",
    price: 799,
    imageSrc: "/images/cc1.png",
    images: ["/images/cc1.png"],
    colors: [
      { name: "Noir", hex: "#1a1a1a" },
      { name: "Cognac", hex: "#9e5a2a" },
      { name: "Slate", hex: "#5a6472" },
    ],
    sizes: ["S", "M", "L", "XL"],
    isNew: true,
    isSale: false,
    description:
      "A cropped leather jacket with a razor-sharp edge. Rebel meets Maison.",
    tags: ["leather", "jacket", "cropped", "outerwear"],
  },
];

// ─── BAGS ───────────────────────────────────────────────────────────────────────
export const bagsProducts: ProductData[] = [
  {
    id: "b-001",
    slug: "silk-tote-grande",
    name: "Silk Tote Grande",
    brand: "Louis Vuitton",
    brandSlug: "louis-vuitton",
    category: "bags",
    subcategory: "Totes",
    price: 750,
    imageSrc: "/images/pp2.png",
    images: ["/images/pp2.png"],
    colors: [
      { name: "Ivory", hex: "#f5f0e8" },
      { name: "Camel", hex: "#c19a6b" },
      { name: "Noir", hex: "#1a1a1a" },
    ],
    sizes: ["One Size"],
    isNew: true,
    isSale: false,
    description:
      "The Silk Tote Grande — generous proportions, uncompromising craftsmanship. Your daily companion in luxury.",
    tags: ["tote", "bag", "silk", "everyday"],
  },
  {
    id: "b-002",
    slug: "structured-mini-handbag",
    name: "Structured Mini Handbag",
    brand: "Chanel",
    brandSlug: "chanel",
    category: "bags",
    subcategory: "Handbags",
    price: 590,
    imageSrc: "/images/pp3.png",
    images: ["/images/pp3.png"],
    colors: [
      { name: "Blush", hex: "#e8b4b8" },
      { name: "Noir", hex: "#1a1a1a" },
      { name: "Cognac", hex: "#9e5a2a" },
    ],
    sizes: ["One Size"],
    isNew: true,
    isSale: false,
    description:
      "A flawlessly structured mini handbag — architectural form with a luxurious finish.",
    tags: ["handbag", "mini", "structured", "evening"],
  },
  {
    id: "b-003",
    slug: "leather-crossbody-chain",
    name: "Leather Crossbody Chain Bag",
    brand: "Gucci",
    brandSlug: "gucci",
    category: "bags",
    subcategory: "Crossbody",
    price: 680,
    imageSrc: "/images/pp4.png",
    images: ["/images/pp4.png"],
    colors: [
      { name: "Noir", hex: "#1a1a1a" },
      { name: "Gold-Tan", hex: "#c8956c" },
      { name: "Stone", hex: "#b5a99a" },
    ],
    sizes: ["One Size"],
    isNew: false,
    isSale: false,
    description:
      "A sleek leather crossbody with gold chain hardware. Minimal exterior, maximum statement.",
    tags: ["crossbody", "chain", "leather", "evening"],
  },
  {
    id: "b-004",
    slug: "suede-slouch-shoulder-bag",
    name: "Suede Slouch Shoulder Bag",
    brand: "Bottega Veneta",
    brandSlug: "bottega-veneta",
    category: "bags",
    subcategory: "Shoulder Bags",
    price: 820,
    imageSrc: "/images/pp5.png",
    images: ["/images/pp5.png"],
    colors: [
      { name: "Caramel", hex: "#c8956c" },
      { name: "Bordeaux", hex: "#8b1a2e" },
      { name: "Charcoal", hex: "#3a3a3a" },
    ],
    sizes: ["One Size"],
    isNew: true,
    isSale: false,
    description:
      "Buttery suede shoulder bag with an effortless slouch. The art of nonchalant luxury.",
    tags: ["suede", "shoulder", "bag", "slouch"],
  },
  {
    id: "b-005",
    slug: "boxy-leather-clutch",
    name: "Boxy Leather Clutch",
    brand: "Dior",
    brandSlug: "dior",
    category: "bags",
    subcategory: "Clutches",
    price: 420,
    imageSrc: "/images/pp6.png",
    images: ["/images/pp6.png"],
    colors: [
      { name: "Ivory", hex: "#f5f0e8" },
      { name: "Noir", hex: "#1a1a1a" },
      { name: "Rose Gold", hex: "#c49a7b" },
    ],
    sizes: ["One Size"],
    isNew: false,
    isSale: true,
    salePrice: 320,
    description:
      "A clean-lined boxy clutch in hand-stitched leather. Precision in every detail.",
    tags: ["clutch", "leather", "evening", "boxy"],
  },
  {
    id: "b-006",
    slug: "woven-raffia-basket-bag",
    name: "Woven Raffia Basket Bag",
    brand: "Prada",
    brandSlug: "prada",
    category: "bags",
    subcategory: "Totes",
    price: 380,
    imageSrc: "/images/pp7.png",
    images: ["/images/pp7.png"],
    colors: [
      { name: "Natural", hex: "#d4b896" },
      { name: "Noir", hex: "#1a1a1a" },
      { name: "Terracotta", hex: "#c4622d" },
    ],
    sizes: ["One Size"],
    isNew: true,
    isSale: false,
    description:
      "Hand-woven raffia basket bag — artisanal craft meets resort-ready chic.",
    tags: ["raffia", "basket", "woven", "resort"],
  },
  {
    id: "b-007",
    slug: "quilted-lambskin-flap",
    name: "Quilted Lambskin Flap Bag",
    brand: "Chanel",
    brandSlug: "chanel",
    category: "bags",
    subcategory: "Handbags",
    price: 1250,
    imageSrc: "/images/pp8.png",
    images: ["/images/pp8.png"],
    colors: [
      { name: "Noir", hex: "#1a1a1a" },
      { name: "Cream", hex: "#f5f0e0" },
      { name: "Sage", hex: "#8a9e7a" },
    ],
    sizes: ["One Size"],
    isNew: true,
    isSale: false,
    description:
      "Quilted lambskin flap bag with signature gold clasp. Heritage craftsmanship, contemporary soul.",
    tags: ["quilted", "lambskin", "flap", "heritage"],
  },
  {
    id: "b-008",
    slug: "leather-backpack-mini",
    name: "Leather Mini Backpack",
    brand: "Valentino",
    brandSlug: "valentino",
    category: "bags",
    subcategory: "Backpacks",
    price: 690,
    imageSrc: "/images/cc3.png",
    images: ["/images/cc3.png"],
    colors: [
      { name: "Cognac", hex: "#9e5a2a" },
      { name: "Noir", hex: "#1a1a1a" },
      { name: "Stone", hex: "#b5a99a" },
    ],
    sizes: ["One Size"],
    isNew: false,
    isSale: false,
    description:
      "A compact leather mini backpack that redefines urban elegance. Minimalist utility.",
    tags: ["backpack", "mini", "leather", "urban"],
  },
];

// ─── ALL PRODUCTS ───────────────────────────────────────────────────────────────
export const allProducts: ProductData[] = [
  ...womenProducts,
  ...menProducts,
  ...bagsProducts,
];

// ─── SUBCATEGORY LISTS ──────────────────────────────────────────────────────────
export const womenSubcategories = [
  "View All",
  "Dresses",
  "Co-Ords",
  "Outerwear",
  "Gowns",
  "Skirts",
  "Knitwear",
  "Tops",
  "Trousers",
];

export const menSubcategories = [
  "View All",
  "Suits",
  "Blazers",
  "Trousers",
  "Shirts",
  "Knitwear",
  "Outerwear",
  "Denim",
  "Accessories",
];

export const bagsSubcategories = [
  "View All",
  "Totes",
  "Handbags",
  "Crossbody",
  "Shoulder Bags",
  "Clutches",
  "Backpacks",
];

// ─── NEW IN ─────────────────────────────────────────────────────────────────────
export const newInProducts: ProductData[] = allProducts.filter((p) => p.isNew);

export const newInSubcategories = [
  "View All",
  "Women",
  "Men",
  "Bags",
  "Dresses",
  "Co-Ords",
  "Suits",
  "Blazers",
  "Shirts",
  "Totes",
  "Handbags",
];

// ─── BRANDS ──────────────────────────────────────────────────────────────────────
// TODO: Add brand logo URLs below.
//       logoUrl should be a horizontal wordmark image (PNG/SVG, transparent bg, black text).
//       Recommended source: https://www.brandsoftheworld.com  — search the brand name,
//       pick a horizontal variant, open the logo page, right-click the image → Copy image address,
//       then paste it as the logoUrl value for the matching brand below.
export const brandsData: BrandData[] = [
  {
    name: "Louis Vuitton",
    slug: "louis-vuitton",
    tagline: "The art of travel & savoir-faire",
    logoUrl:
      "https://cdn.brandfetch.io/idQH6e1xMu/theme/dark/logo.svg?c=1bxid64Mup7aczewSAYMX&t=1676549441690",
  },
  {
    name: "Chanel",
    slug: "chanel",
    tagline: "Elegance is refusal",
    logoUrl:
      "https://cdn.brandfetch.io/idBUm3gJdJ/theme/dark/logo.svg?c=1bxid64Mup7aczewSAYMX&t=1741582517692",
  },
  {
    name: "Gucci",
    slug: "gucci",
    tagline: "Quality is remembered long after price is forgotten",
    logoUrl:
      "https://cdn.brandfetch.io/idsVLhORjl/theme/dark/logo.svg?c=1bxid64Mup7aczewSAYMX&t=1731307368249",
  },
  {
    name: "Dior",
    slug: "dior",
    tagline: "Haute couture redefined",
    logoUrl:
      "https://cdn.brandfetch.io/id26xlFDgU/theme/dark/logo.svg?c=1bxid64Mup7aczewSAYMX&t=1675924242165",
  },
  {
    name: "Saint Laurent",
    slug: "saint-laurent",
    tagline: "Fashions fade, style is eternal",
    logoUrl:
      "https://cdn.brandfetch.io/id46TZWBZw/theme/dark/logo.svg?c=1bxid64Mup7aczewSAYMX&t=1776143091418",
  },
  {
    name: "Prada",
    slug: "prada",
    tagline: "Intellectual simplicity",
    logoUrl:
      "https://cdn.brandfetch.io/idxHSB9cRy/theme/dark/logo.svg?c=1bxid64Mup7aczewSAYMX&t=1676977841307",
  },
  {
    name: "Bottega Veneta",
    slug: "bottega-veneta",
    tagline: "When your own initials are enough",
    logoUrl:
      "https://cdn.brandfetch.io/idHr7TJ--U/theme/dark/logo.svg?c=1bxid64Mup7aczewSAYMX&t=1772357501918",
  },
  {
    name: "Valentino",
    slug: "valentino",
    tagline: "Passion, creativity, craftsmanship",
    logoUrl:
      "https://cdn.brandfetch.io/idR3D929sw/theme/dark/symbol.svg?c=1bxid64Mup7aczewSAYMX&t=1668076778639",
  },
  {
    name: "Tom Ford",
    slug: "tom-ford",
    tagline: "Precision tailoring, modern luxury",
    logoUrl:
      "https://cdn.brandfetch.io/ideeVavu1a/theme/dark/logo.svg?c=1bxid64Mup7aczewSAYMX&t=1772377725229",
  },
  {
    name: "Zegna",
    slug: "zegna",
    tagline: "The finest Italian tailoring",
    logoUrl:
      "https://cdn.brandfetch.io/idQ9jQhxY8/theme/dark/logo.svg?c=1bxid64Mup7aczewSAYMX&t=1773646166336",
  },
  {
    name: "Balenciaga",
    slug: "balenciaga",
    tagline: "Couture with an edge",
    logoUrl:
      "https://cdn.brandfetch.io/idb2q0I-4r/w/820/h/96/theme/dark/logo.png?c=1bxid64Mup7aczewSAYMX&t=1772406483781",
  },
  {
    name: "Burberry",
    slug: "burberry",
    tagline: "British heritage, global vision",
    logoUrl:
      "https://cdn.brandfetch.io/id3krW0AT0/theme/dark/logo.svg?c=1bxid64Mup7aczewSAYMX&t=1675840242033",
  },
  {
    name: "Off-White",
    slug: "off-white",
    tagline: "Defining the grey area between black and white",
    logoUrl:
      "https://images.seeklogo.com/logo-png/36/1/off-white-logo-png_seeklogo-361774.png",
  },
  {
    name: "Loro Piana",
    slug: "loro-piana",
    tagline: "The gift of kings",
    logoUrl:
      "https://cdn.brandfetch.io/idCKS1PInO/theme/dark/logo.svg?c=1bxid64Mup7aczewSAYMX&t=1773224149882",
  },
];

// Brand names for the filter pill row
export const brandSubcategories: string[] = [
  "View All",
  ...brandsData.map((b) => b.name),
];

