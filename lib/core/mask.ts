import { v4 as uuidv4 } from "uuid";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";
import redis from "@/lib/redis";

import { PATTERNS } from "../pattern/patterns";
import {
  isEmail,
  isUPI,
  isValidCard,
  isLikelyPassword,
  isLikelyOTP,
  isLikelyBank,
  isIFSC,
  isAadhaar,
  isPAN,
  isAPIKey,
  isExpiry,
  isCVV,
} from "../pattern/validators";

import { buildKeywordQueue } from "../context/keywordQueue";
import { resolveTypeFromQueue } from "../context/resolver";
import { maskWithContext } from "../context/context";
import { resolveContextType } from "../context/contextResolver";
import { matchKeyword } from "../context/fuzzy";

import { splitIntoSegments } from "../privacy/utils/segment";

/* ------------------ VALUE EXTRACTION ------------------ */

function extractValues(text: string) {
  const allAtMatches: string[] = text.match(/\b[\w.-]+@[\w.-]+\b/g) ?? [];

  const emailMatches = allAtMatches.filter((v) => isEmail(v));
  const upiMatches = allAtMatches.filter((v) => isUPI(v));

  const otherMatches: string[] = (
    text.match(/(?<!\d)\d{4,6}(?!\d)|(?<!\d)\d{8,17}(?!\d)|\b[a-zA-Z0-9]{6,}\b/g) ?? []
  ).filter((v) => !allAtMatches.includes(v));

  const blocked = new Set([
    "email", "emails", "password", "passwords",
    "otp", "account", "number", "numbers",
    "another", "also", "call", "are", "kod",
  ]);

  return [...emailMatches, ...upiMatches, ...otherMatches].filter((v) => {
    if (blocked.has(v.toLowerCase())) return false;
    if (matchKeyword(v.toLowerCase()) !== null) return false;
    return true;
  });
}

function isValidForType(value: string, type: string) {
  if (type === "EMAIL") return isEmail(value);
  if (type === "UPI") return isUPI(value);
  if (type === "PASSWORD") return !isEmail(value) && !isUPI(value) && isLikelyPassword(value);
  if (type === "OTP") return isLikelyOTP(value);
  if (type === "BANK") return isLikelyBank(value);
  if (type === "IFSC") return isIFSC(value);
  if (type === "AADHAAR") return isAadhaar(value);
  if (type === "PAN") return isPAN(value);
  if (type === "APIKEY") return isAPIKey(value);
  if (type === "EXPIRY") return isExpiry(value);
  if (type === "CVV") return isCVV(value);
  return false;
}

/* ------------------ PROCESS ONE SEGMENT ------------------ */

function processSegment(segment: string, map: Record<string, string>) {
  let masked = segment;

  const queue = buildKeywordQueue(segment);
  if (queue.length === 0) return masked;

  const values = extractValues(segment);
  if (values.length === 0) return masked;

  for (const value of values) {
    const valueIndex = segment.indexOf(value);
    if (valueIndex === -1) continue;

    const type = resolveTypeFromQueue(queue, valueIndex);
    if (!type) continue;
    if (!isValidForType(value, type)) continue;

    const token = `__${type}_${uuidv4()}__`;
    map[token] = value;
    masked = masked.replace(value, token);
  }

  return masked;
}

/* ------------------ FORCED VALUES (CACHED) ------------------ */

type ForcedValueCacheEntry = {
  token: string;
  realValue: string; // already decrypted
};

async function getForcedValues(
  userId: string,
  keyId?: string
): Promise<ForcedValueCacheEntry[]> {
  const cacheKey = `forced:${userId}:${keyId ?? "global"}`;

  // Try Redis cache first
  try {
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached) as ForcedValueCacheEntry[];
  } catch {
    // Redis miss or error — fall through to DB
  }

  // Fetch from DB
  const forcedValues = await prisma.userForcedMaskValue.findMany({
    where: {
      userId,
      OR: [{ keyId: null }, { keyId: keyId ?? null }],
    },
    include: { vault: true },
  });

  const result: ForcedValueCacheEntry[] = forcedValues.map((fv) => ({
    token: fv.token,
    realValue: decrypt(fv.vault.realValue),
  }));

  // Cache for 5 minutes (fire and forget)
  redis
    .set(cacheKey, JSON.stringify(result), "EX", 300)
    .catch(() => {}); // don't block on cache write failure

  return result;
}

/* ------------------ MAIN ------------------ */

export async function mask(text: string, userId?: string, keyId?: string) {
  const map: Record<string, string> = {};

  // Pre-pass: scrub user forced values (cached)
  if (userId) {
    const forcedValues = await getForcedValues(userId, keyId);

    for (const { token, realValue } of forcedValues) {
      if (text.includes(realValue)) {
        map[token] = realValue;
        text = text.replaceAll(realValue, token);
      }
    }
  }

  const segments = splitIntoSegments(text);
  let masked = text;

  for (const segment of segments) {
    const processed = processSegment(segment, map);
    masked = masked.replace(segment, processed);
  }

  // Context fallback
  masked = maskWithContext(masked, map);

  // EMAIL / UPI fallback
  masked = masked.replace(PATTERNS.GENERIC_AT, (match, offset) => {
    if (match.includes("__")) return match;

    const contextType = resolveContextType(masked, offset);

    if (contextType === "UPI") {
      if (!isUPI(match)) return match;
      const token = `__UPI_${uuidv4()}__`;
      map[token] = match;
      return token;
    }

    if (contextType === "EMAIL") {
      if (!isEmail(match)) return match;
      const token = `__EMAIL_${uuidv4()}__`;
      map[token] = match;
      return token;
    }

    if (contextType === "PASSWORD") {
      const token = `__PASSWORD_${uuidv4()}__`;
      map[token] = match;
      return token;
    }

    if (isEmail(match)) {
      const token = `__EMAIL_${uuidv4()}__`;
      map[token] = match;
      return token;
    }

    if (isUPI(match)) {
      const token = `__UPI_${uuidv4()}__`;
      map[token] = match;
      return token;
    }

    return match;
  });

  // PHONE
  masked = masked.replace(PATTERNS.PHONE_GLOBAL, (match, offset) => {
    if (match.includes("__")) return match;

    const context = masked.slice(Math.max(0, offset - 20), offset).toLowerCase();
    if (!/(phone|call|mobile|contact)/.test(context)) return match;

    const token = `__PHONE_${uuidv4()}__`;
    map[token] = match;
    return token;
  });

  // CARD
  masked = masked.replace(PATTERNS.CARD, (match) => {
    if (match.includes("__")) return match;
    if (!isValidCard(match)) return match;

    const token = `__CARD_${uuidv4()}__`;
    map[token] = match;
    return token;
  });

  // IFSC
  masked = masked.replace(/\b[A-Z]{4}0[A-Z0-9]{6}\b/g, (match) => {
    if (match.includes("__")) return match;
    if (!isIFSC(match)) return match;

    const token = `__IFSC_${uuidv4()}__`;
    map[token] = match;
    return token;
  });

  // PAN
  masked = masked.replace(/\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/g, (match) => {
    if (match.includes("__")) return match;
    if (!isPAN(match)) return match;

    const token = `__PAN_${uuidv4()}__`;
    map[token] = match;
    return token;
  });

  // AADHAAR
  masked = masked.replace(/\b[2-9][0-9]{11}\b/g, (match, offset) => {
    if (match.includes("__")) return match;

    const context = masked.slice(Math.max(0, offset - 30), offset).toLowerCase();
    if (!/(aadhaar|aadhar|uid)/.test(context)) return match;
    if (!isAadhaar(match)) return match;

    const token = `__AADHAAR_${uuidv4()}__`;
    map[token] = match;
    return token;
  });

  // API KEYS
  masked = masked.replace(/\b(sk|pk|rk|key)[-_][A-Za-z0-9]{20,}\b/g, (match) => {
    if (match.includes("__")) return match;

    const token = `__APIKEY_${uuidv4()}__`;
    map[token] = match;
    return token;
  });

  // CVV
  masked = masked.replace(/\b\d{3,4}\b/g, (match, offset) => {
    if (match.includes("__")) return match;

    const context = masked.slice(Math.max(0, offset - 20), offset).toLowerCase();
    if (!/(cvv|cvc|csc)/.test(context)) return match;
    if (!isCVV(match)) return match;

    const token = `__CVV_${uuidv4()}__`;
    map[token] = match;
    return token;
  });

  // EXPIRY
  masked = masked.replace(
    /(^|[\s,])(0[1-9]|1[0-2])[\/\-]([0-9]{2}|[0-9]{4})([\s,]|$)/g,
    (match, pre, month, year, post, offset) => {
      if (match.includes("__")) return match;

      const actualValue = `${month}/${year}`;
      const context = masked.slice(Math.max(0, offset - 30), offset).toLowerCase();
      if (!/(expiry|expiration|expires|valid till|valid thru|exp)/.test(context)) return match;
      if (!isExpiry(actualValue)) return match;

      const token = `__EXPIRY_${uuidv4()}__`;
      map[token] = actualValue;
      return `${pre}${token}${post}`;
    }
  );

  return { masked, map };
}