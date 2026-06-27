import { randomBytes } from "crypto";

/** Generates a URL-safe random token (raw value returned to client once). */
export function generateSecureToken(prefix = ""): string {
  const random = randomBytes(24).toString("base64url");
  return prefix ? `${prefix}_${random}` : random;
}

/** SHA-256 hash of a share/participant token for storage. */
export async function hashToken(token: string): Promise<string> {
  const data = new TextEncoder().encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
