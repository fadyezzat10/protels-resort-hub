import bcrypt from "bcryptjs";
import { storage } from "./storage";

export async function seedAdmin() {
  const existing = await storage.getUserByUsername("Fezzat");
  if (!existing) {
    const hashed = await bcrypt.hash("Fezzat246810", 12);
    await storage.createUser({
      username: "Fezzat",
      password: hashed,
      role: "super_admin",
    });
    console.log("Default admin user 'Fezzat' created.");
  }
}

export async function verifyPassword(plain: string, hashed: string) {
  return bcrypt.compare(plain, hashed);
}

export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, 12);
}
