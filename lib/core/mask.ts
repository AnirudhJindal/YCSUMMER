import { v4 as uuidv4 } from "uuid";

import { PATTERNS } from "../pattern/patterns";
import {
  isEmail,
  isUPI,
  isValidCard,
  isLikelyPassword,
  isLikelyOTP,
  isLikelyBank,
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

  const emailMatches = allAtMatches.filter(v => isEmail(v));
  const upiMatches = allAtMatches.filter(v => isUPI(v));

  const otherMatches: string[] = (
    text.match(/(?<!\d)\d{4,6}(?!\d)|(?<!\d)\d{8,17}(?!\d)|\b[a-zA-Z0-9]{6,}\b/g) ?? []
  ).filter((v) => !allAtMatches.includes(v));

  return [...emailMatches, ...upiMatches, ...otherMatches].filter((v) => {
    const blocked = [
      "email", "emails",
      "password", "passwords",
      "otp", "account",
      "number", "numbers",
      "another", "also",
      "call", "are", "kod",
    ];
    if (blocked.includes(v.toLowerCase())) return false;
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

/* ------------------ MAIN ------------------ */

export function mask(text: string) {
  const map: Record<string, string> = {};

  const segments = splitIntoSegments(text);
  let masked = text;

  for (const segment of segments) {
    const processed = processSegment(segment, map);
    masked = masked.replace(segment, processed);
  }

  // context fallback
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

  // PHONE (context-aware only)
  masked = masked.replace(PATTERNS.PHONE_GLOBAL, (match, offset) => {
    if (match.includes("__")) return match;

    const context = masked
      .slice(Math.max(0, offset - 20), offset)
      .toLowerCase();

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

  return { masked, map };
}