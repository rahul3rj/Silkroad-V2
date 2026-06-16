// src/app/api/admin/products/upload-image/route.ts
// POST   /api/admin/products/upload-image  — upload & compress an image
// DELETE /api/admin/products/upload-image  — delete an image by URL

import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { requireAdmin } from "@/lib/guards";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BUCKET       = "products";

// ── Helpers ───────────────────────────────────────────────────────────────────

async function uploadToSupabase(buffer: Buffer, storagePath: string): Promise<string> {
  const endpoint = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${storagePath}`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "image/webp",
      "x-upsert": "true",
    },
    body: new Uint8Array(buffer),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Storage upload failed (${res.status}): ${body}`);
  }
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${storagePath}`;
}

/** Extract the storage path from a Supabase public URL. Returns null if not a products-bucket URL. */
function storagePathFromUrl(url: string): string | null {
  const marker = `/object/public/${BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.slice(idx + marker.length);
}

async function deleteFromSupabase(storagePath: string): Promise<void> {
  // Supabase Storage DELETE requires a JSON body with an `prefixes` or `paths` array
  const endpoint = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${storagePath}`;
  await fetch(endpoint, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${SERVICE_KEY}` },
  });
  // Fire-and-forget — we don't block the UI on a delete failure
}

// ── POST — upload ─────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const gate = await requireAdmin();
    if (gate.response) return gate.response;
    const { user } = gate;

    const formData = await request.formData();
    const file = formData.get("image") as File | null;

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No image file provided." }, { status: 400 });
    }

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowed.includes(file.type)) {
      return NextResponse.json(
        { error: "Only JPG, PNG, or WebP files are allowed." },
        { status: 400 }
      );
    }
    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Maximum 15 MB." }, { status: 400 });
    }

    const inputBuffer = Buffer.from(await file.arrayBuffer());
    const compressed = await sharp(inputBuffer)
      .resize(1400, 1900, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 88 })
      .toBuffer();

    const brandSegment = user.brandId ?? "global";
    const storagePath  = `${brandSegment}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;
    const url = await uploadToSupabase(compressed, storagePath);

    return NextResponse.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Image upload failed.";
    console.error("[upload-image POST]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ── DELETE — remove an image from storage ─────────────────────────────────────
export async function DELETE(request: NextRequest) {
  try {
    const gate = await requireAdmin();
    if (gate.response) return gate.response;

    const body = await request.json().catch(() => null);
    const url = body?.url as string | undefined;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "url is required." }, { status: 400 });
    }

    // Only delete images that belong to our Supabase products bucket.
    // Reject external URLs or /images/ local paths — nothing to delete there.
    if (!url.includes(SUPABASE_URL)) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const storagePath = storagePathFromUrl(url);
    if (!storagePath) {
      return NextResponse.json({ error: "URL does not point to the products bucket." }, { status: 400 });
    }

    await deleteFromSupabase(storagePath);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Delete failed.";
    console.error("[upload-image DELETE]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
