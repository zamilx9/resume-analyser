import { jwtVerify, SignJWT } from "jose";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-should-be-longer-than-32"
);

export async function createJWT(payload) {
  try {
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(process.env.JWT_EXPIRY || "7d")
      .sign(SECRET_KEY);
    return token;
  } catch (error) {
    console.error("JWT Creation Error:", error);
    throw new Error("Failed to create JWT token");
  }
}

export async function verifyJWT(token) {
  try {
    const verified = await jwtVerify(token, SECRET_KEY);
    return verified.payload;
  } catch (error) {
    console.error("JWT Verification Error:", error);
    return null;
  }
}

export function extractTokenFromHeader(authHeader) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.slice(7);
}
