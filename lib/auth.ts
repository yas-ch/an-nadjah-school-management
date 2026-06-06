import * as jose from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "super-secret-key-change-in-production"
);

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return new jose.SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyToken(
  token: string
): Promise<JWTPayload | null> {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch (err) {
    if (err instanceof jose.errors.JWTExpired) {
      console.warn("[auth] Token expired");
    } else if (err instanceof jose.errors.JWSSignatureVerificationFailed) {
      console.warn("[auth] Token signature invalid");
    } else {
      console.warn("[auth] Token verification failed:", err);
    }
    return null;
  }
}
