import { fuzzy } from "fast-fuzzy";

const THRESHOLD = 0.7;

const IGNORE_WORDS = ["number", "numbers", "are", "is", "my", "also", "at", "and", "the", "a"];

function clean(word: string) {
  return word.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export const KEYWORD_GROUPS = {
  EMAIL: ["email", "mail", "emails"],
  UPI: ["upi", "gpay", "phonepe", "paytm"],
  OTP: ["otp", "code", "pin"],
  BANK: ["account", "acc", "acnt"],
  PASSWORD: ["password", "pwd", "pass", "passwrod"],
};

export function matchKeyword(word: string) {
  const cleaned = clean(word);

  if (IGNORE_WORDS.includes(cleaned)) return null;

  for (const type of ["EMAIL", "UPI", "OTP", "BANK", "PASSWORD"] as const) {
    const keywords = KEYWORD_GROUPS[type];
    for (const keyword of keywords) {
      if (cleaned === keyword) return type;
    }
  }

  for (const type of ["EMAIL", "UPI", "OTP", "BANK", "PASSWORD"] as const) {
    const keywords = KEYWORD_GROUPS[type];
    for (const keyword of keywords) {
      if (fuzzy(cleaned, keyword) >= THRESHOLD) return type;
    }
  }

  return null;
}