// src/lib/validations/auth.ts
// Zod schemas for auth — shared between API routes and client-side form validation.

import { z } from "zod";

export const RegisterSchema = z.object({
  email: z.email({ error: "Please enter a valid email address." }),
  password: z
    .string()
    .min(8, { error: "Password must be at least 8 characters." })
    .max(72, { error: "Password is too long." }),
  firstName: z
    .string()
    .min(1, { error: "First name is required." })
    .max(50, { error: "First name is too long." }),
  lastName: z
    .string()
    .min(1, { error: "Last name is required." })
    .max(50, { error: "Last name is too long." }),
  phone: z.string().max(20).optional(),
  dob: z.string().optional(), // "YYYY-MM-DD" date string, optional
});

export const LoginSchema = z.object({
  email: z.email({ error: "Please enter a valid email address." }),
  password: z.string().min(1, { error: "Password is required." }),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
