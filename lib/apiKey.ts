import { randomBytes, createHash } from "crypto";

export function generateApiKey() {
  const raw = `pk_live_${randomBytes(24).toString("hex")}`;
  const hash = createHash("sha256").update(raw).digest("hex");

  return { raw, hash };
}