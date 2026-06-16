// src/lib/validations/product.ts
// Zod schemas for admin product management.
// Prices are accepted in WHOLE DOLLARS from the form and converted to cents
// server-side — the client never sends cents.

import { z } from "zod";

const ColorSchema = z.object({
  name: z.string().min(1, "Color name is required.").max(50),
  hex: z
    .string()
    .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Invalid hex color."),
});

const VariantSchema = z.object({
  size: z.string().min(1, "Size is required.").max(20),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative.").max(100000),
});

export const CreateProductSchema = z
  .object({
    name: z.string().min(1, "Product name is required.").max(200),
    slug: z
      .string()
      .min(1, "Slug is required.")
      .max(200)
      .regex(/^[a-z0-9-]+$/, "Slug may only contain lowercase letters, numbers and hyphens."),
    category: z.enum(["women", "men", "bags"], {
      error: "Category must be women, men or bags.",
    }),
    subcategory: z.string().min(1, "Subcategory is required.").max(100),
    description: z.string().min(1, "Description is required.").max(5000),
    price: z.coerce.number().positive("Price must be greater than 0.").max(10_000_000),
    salePrice: z.coerce
      .number()
      .positive()
      .max(10_000_000)
      .optional()
      .nullable(),
    imageSrc: z.string().min(1, "A product image is required.").max(1000),
    images: z.array(z.string().max(1000)).max(12).optional().default([]),
    colors: z.array(ColorSchema).max(20).optional().default([]),
    tags: z.array(z.string().max(40)).max(30).optional().default([]),
    isNew: z.boolean().optional().default(false),
    isSale: z.boolean().optional().default(false),
    variants: z.array(VariantSchema).min(1, "Add at least one size with stock.").max(20),
  })
  .refine(
    (data) => data.salePrice == null || data.salePrice < data.price,
    { message: "Sale price must be lower than the regular price.", path: ["salePrice"] }
  );

export type CreateProductInput = z.infer<typeof CreateProductSchema>;

// Super-admin: assign or revoke a brand-admin role on a user.
export const AssignRoleSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("assign"), brandId: z.string().min(1, "Select a brand.") }),
  z.object({ action: z.literal("revoke") }),
]);

export type AssignRoleInput = z.infer<typeof AssignRoleSchema>;
