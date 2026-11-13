import crypto from "crypto";
import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "storyland_session";
const LEGACY_COOKIE_NAME = "storyland_user_email";
const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 days

function getSigningSecret(): string {
  return (
    process.env.AUTH_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.STRIPE_SECRET_KEY ||
    process.env.ABACUS_API_KEY ||
    process.env.SMTP_PASS ||
    "storyland-default-signing-secret-change-in-prod"
  );
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${derivedKey}`;
}

export function verifyPassword(
  storedPassword: string | null | undefined,
  candidatePassword: string
): { valid: boolean; needsRehash: boolean } {
  if (!storedPassword || !candidatePassword) {
    return { valid: false, needsRehash: false };
  }

  if (storedPassword.startsWith("scrypt$")) {
    const parts = storedPassword.split("$");
    if (parts.length !== 3) {
      return { valid: false, needsRehash: false };
    }
    const [, salt, originalHash] = parts;
    const candidateHash = crypto.scryptSync(candidatePassword, salt, 64).toString("hex");
    const a = Buffer.from(originalHash, "hex");
    const b = Buffer.from(candidateHash, "hex");
    if (a.length !== b.length) {
      return { valid: false, needsRehash: false };
    }
    return {
      valid: crypto.timingSafeEqual(a, b),
      needsRehash: false,
    };
  }

  // Legacy plaintext fallback — automatically rehashed on successful login
  const a = Buffer.from(storedPassword, "utf8");
  const b = Buffer.from(candidatePassword, "utf8");
  const valid = a.length === b.length && crypto.timingSafeEqual(a, b);
  return { valid, needsRehash: valid };
}

export function signSessionToken(email: string): string {
  const payload = {
    email: email.toLowerCase().trim(),
    exp: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const signature = crypto
    .createHmac("sha256", getSigningSecret())
    .update(encodedPayload)
    .digest("base64url");
  return `${encodedPayload}.${signature}`;
}

export function verifySessionToken(token: string | undefined | null): string | null {
  if (!token || !token.includes(".")) return null;
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return null;

  const expectedSignature = crypto
    .createHmac("sha256", getSigningSecret())
    .update(encodedPayload)
    .digest("base64url");

  const sigBuf = Buffer.from(signature, "utf8");
  const expectedBuf = Buffer.from(expectedSignature, "utf8");
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
    if (!payload?.email || typeof payload.exp !== "number" || Date.now() > payload.exp) {
      return null;
    }
    return String(payload.email).toLowerCase().trim();
  } catch {
    return null;
  }
}

export async function setServerSessionCookie(email: string) {
  const cookieStore = await cookies();
  const token = signSessionToken(email);
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearServerSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  cookieStore.delete(LEGACY_COOKIE_NAME);
}

export async function getAuthenticatedEmail(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
