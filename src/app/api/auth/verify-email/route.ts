// src/app/api/auth/verify-email/route.ts
// GET /api/auth/verify-email?token=...&email=...
// Validates the magic link token. On success:
//   - Marks the token as used (deletes it)
//   - Redirects to /signup?verified=<email> so the form knows the email is confirmed

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  if (!token || !email) {
    return NextResponse.redirect(`${APP_URL}/signup?verifyError=invalid`);
  }

  // Look up the token
  const record = await prisma.verificationToken.findFirst({
    where: { identifier: email, token },
  });

  if (!record) {
    return NextResponse.redirect(`${APP_URL}/signup?verifyError=invalid`);
  }

  // Check expiry
  if (record.expires < new Date()) {
    await prisma.verificationToken.delete({ where: { identifier_token: { identifier: email, token } } });
    return NextResponse.redirect(`${APP_URL}/signup?verifyError=expired&email=${encodeURIComponent(email)}`);
  }

  // Token is valid — DON'T delete it yet.
  // It will be deleted by the register API when the account is actually created.
  // This allows the user to close the tab and come back, fill in the form, and submit.

  return NextResponse.redirect(
    `${APP_URL}/signup?verified=${encodeURIComponent(email)}&token=${token}`
  );
}
