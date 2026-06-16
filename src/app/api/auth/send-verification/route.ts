// src/app/api/auth/send-verification/route.ts
// POST /api/auth/send-verification
// Generates a one-time magic link token, stores it in VerificationToken,
// and sends a verification email via Resend.
// No account is created here — just confirms the email is real.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import crypto from "crypto";
import { Resend } from "resend";
import { z } from "zod";

const resend = new Resend(process.env.RESEND_API_KEY);
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "Silkroad <noreply@silkroad.com>";
const TOKEN_TTL_MINUTES = 15;

const BodySchema = z.object({
  email: z.string().email("Please enter a valid email address."),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid email." }, { status: 400 });
  }

  const { email } = parsed.data;

  // Block if this email already has a verified account
  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true, emailVerified: true } });
  if (existing) {
    // Return a generic message — don't leak whether the account exists
    return NextResponse.json({ ok: true });
  }

  // Generate a cryptographically secure token
  const rawToken = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + TOKEN_TTL_MINUTES * 60 * 1000);

  // Upsert into VerificationToken (replace any previous token for this email)
  await prisma.verificationToken.deleteMany({ where: { identifier: email } });
  await prisma.verificationToken.create({
    data: { identifier: email, token: rawToken, expires },
  });

  // Build the magic link
  const verifyUrl = `${APP_URL}/api/auth/verify-email?token=${rawToken}&email=${encodeURIComponent(email)}`;

  // Send the email via Resend
  const result = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Verify your email — Silkroad",
    html: `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8" /></head>
        <body style="margin:0;padding:0;background:#ffffff;font-family:Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;">
            <tr><td align="center" style="padding:48px 24px;">
              <table width="480" cellpadding="0" cellspacing="0" style="border:1px solid #e5e5e5;">
                <tr><td style="padding:40px 40px 32px;">
                  <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#999;">Silkroad</p>
                  <h1 style="margin:0 0 28px;font-size:22px;font-weight:400;color:#000;letter-spacing:-0.01em;">Verify your email</h1>
                  <p style="margin:0 0 24px;font-size:13px;color:#555;line-height:1.6;">
                    Click the button below to verify <strong>${email}</strong> and continue creating your Silkroad account.
                    This link expires in ${TOKEN_TTL_MINUTES} minutes.
                  </p>
                  <a href="${verifyUrl}"
                     style="display:inline-block;background:#000;color:#fff;text-decoration:none;padding:14px 32px;font-size:10px;letter-spacing:0.22em;text-transform:uppercase;font-weight:600;">
                    Verify Email
                  </a>
                  <p style="margin:28px 0 0;font-size:11px;color:#999;line-height:1.6;">
                    If you didn't request this, you can safely ignore this email. No account will be created.
                  </p>
                  <p style="margin:16px 0 0;font-size:10px;color:#bbb;">
                    Or copy this link: <a href="${verifyUrl}" style="color:#bbb;">${verifyUrl}</a>
                  </p>
                </td></tr>
              </table>
            </td></tr>
          </table>
        </body>
      </html>
    `,
  });

  if (result.error) {
    console.error("[send-verification]", result.error);
    return NextResponse.json(
      { error: `Failed to send verification email: ${result.error.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
