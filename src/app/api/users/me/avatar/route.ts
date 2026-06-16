// src/app/api/users/me/avatar/route.ts
// POST /api/users/me/avatar
//   Receives a multipart/form-data image, compresses it server-side with sharp,
//   uploads to Supabase Storage (bucket: "avatars"), saves the public URL to
//   users.image, and returns { imageUrl }.
//
// DELETE /api/users/me/avatar
//   Removes the avatar from Supabase Storage and clears users.image.

import { NextResponse } from "next/server";
import sharp from "sharp";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BUCKET = "avatars";

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Upload a buffer to Supabase Storage via REST API. Returns the public URL. */
async function uploadToSupabase(
  buffer: Buffer,
  path: string,        // e.g. "user_abc123/avatar.webp"
  contentType: string
): Promise<string> {
  const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`;

  const res = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": contentType,
      "x-upsert": "true", // overwrite if exists
    },
    body: new Uint8Array(buffer),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase upload failed: ${err}`);
  }

  // Return the public URL
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
}

/** Delete a file from Supabase Storage via REST API. */
async function deleteFromSupabase(path: string): Promise<void> {
  const deleteUrl = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`;
  await fetch(deleteUrl, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${SERVICE_KEY}` },
  });
}

/** Extract the storage path from a Supabase public URL. */
function pathFromUrl(url: string): string | null {
  // URL format: https://<project>.supabase.co/storage/v1/object/public/avatars/<path>
  const marker = `/object/public/${BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.slice(idx + marker.length);
}

// ── POST — upload & compress ──────────────────────────────────────────────────
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("avatar") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  // Validate type
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowed.includes(file.type)) {
    return NextResponse.json(
      { error: "Only JPG, PNG, WebP, or GIF files are allowed." },
      { status: 400 }
    );
  }

  // Validate size — reject anything over 10 MB before processing
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json(
      { error: "File is too large. Maximum 10 MB." },
      { status: 400 }
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const inputBuffer = Buffer.from(arrayBuffer);

  // ── Compress with sharp ─────────────────────────────────────────────────────
  // • Resize to max 400×400 (profile pics don't need to be larger)
  // • Convert to WebP for best compression/quality ratio
  // • Quality 82 — visually lossless at a fraction of the original size
  const compressed = await sharp(inputBuffer)
    .resize(400, 400, {
      fit: "cover",        // crop to square, centred
      position: "center",
      withoutEnlargement: true, // never upscale small images
    })
    .webp({ quality: 82 })
    .toBuffer();

  // ── Upload to Supabase Storage ──────────────────────────────────────────────
  const storagePath = `${session.user.id}/avatar.webp`;

  // Delete old avatar first (upsert handles overwrite but this keeps storage clean)
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { image: true },
  });
  if (currentUser?.image && currentUser.image.includes(SUPABASE_URL)) {
    const oldPath = pathFromUrl(currentUser.image);
    if (oldPath) await deleteFromSupabase(oldPath);
  }

  const imageUrl = await uploadToSupabase(compressed, storagePath, "image/webp");

  // ── Save URL to users.image ─────────────────────────────────────────────────
  await prisma.user.update({
    where: { id: session.user.id },
    data: { image: imageUrl },
  });

  return NextResponse.json({ imageUrl });
}

// ── DELETE — remove avatar ────────────────────────────────────────────────────
export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { image: true },
  });

  if (user?.image && user.image.includes(SUPABASE_URL)) {
    const path = pathFromUrl(user.image);
    if (path) await deleteFromSupabase(path);
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { image: null },
  });

  return NextResponse.json({ ok: true });
}
