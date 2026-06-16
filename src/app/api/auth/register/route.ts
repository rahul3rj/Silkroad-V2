// src/app/api/auth/register/route.ts
// POST /api/auth/register
// Creates a new user account.
// Requires a valid email verification token (issued by /api/auth/send-verification
// and confirmed via /api/auth/verify-email). The token is consumed on account creation.

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { RegisterSchema } from "@/lib/validations/auth";
import { z } from "zod";

const RegisterWithTokenSchema = RegisterSchema.extend({
  verifyToken: z.string().min(1, "Email verification is required."),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Validate input (including the verification token)
    const parsed = RegisterWithTokenSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input." },
        { status: 400 }
      );
    }

    const { email, password, firstName, lastName, phone, dob, verifyToken } = parsed.data;

    // 2. Validate the verification token
    const tokenRecord = await prisma.verificationToken.findFirst({
      where: { identifier: email, token: verifyToken },
    });

    if (!tokenRecord) {
      return NextResponse.json(
        { error: "Email verification is required. Please verify your email before creating an account." },
        { status: 400 }
      );
    }

    if (tokenRecord.expires < new Date()) {
      await prisma.verificationToken.delete({
        where: { identifier_token: { identifier: email, token: verifyToken } },
      });
      return NextResponse.json(
        { error: "Your verification link has expired. Please verify your email again." },
        { status: 400 }
      );
    }

    // 3. Check email availability
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    // 4. Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // 5. Create user and consume the token atomically
    await prisma.$transaction([
      prisma.user.create({
        data: {
          email,
          name: `${firstName} ${lastName}`.trim(),
          passwordHash,
          phone: phone ?? null,
          dob: dob ? new Date(`${dob}T00:00:00.000Z`) : null,
          role: "USER",
          isActive: true,
          emailVerified: new Date(), // mark as verified since they clicked the link
        },
      }),
      prisma.verificationToken.delete({
        where: { identifier_token: { identifier: email, token: verifyToken } },
      }),
    ]);

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("[register]", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
