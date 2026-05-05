import crypto from "crypto";

const KEY = Buffer.from(process.env.ENCRYPTION_KEY!, "hex");

export function encrypt(text: string) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", KEY, iv);

  const encrypted = Buffer.concat([
    cipher.update(text),
    cipher.final(),
  ]);

  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decrypt(data: string) {
  const [ivHex, encryptedHex] = data.split(":");

  const iv = Buffer.from(ivHex, "hex");
  const encrypted = Buffer.from(encryptedHex, "hex");

  const decipher = crypto.createDecipheriv("aes-256-cbc", KEY, iv);

  return Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]).toString();
}