// User and Address TypeScript types
import type { Address } from "./order";

export type UserRole = "customer" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  addresses: Address[];
  createdAt: string;
}

export type { Address };
