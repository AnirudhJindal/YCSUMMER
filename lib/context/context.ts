import {
  isLikelyPassword,
  isLikelyBank,
  isLikelyOTP,
  isEmail,
  isUPI,
} from "../pattern/validators";
import { matchKeyword } from "./fuzzy";
import { v4 as uuidv4 } from "uuid";

type Range = { start: number; end: number };

function isOverlapping(start: number, end: number, ranges: Range[]) {
  return ranges.some((r) => !(end < r.start || start > r.end));
}

function extractValue(window: string, type: string): string | null {
  if (type === "EMAIL") {
    const match = window.match(/\b[\w.-]+@[\w.-]+\b/);
    if (!match) return null;
    return isEmail(match[0]) ? match[0] : null;
  }

  if (type === "UPI") {
    const match = window.match(/\b[\w.-]+@[\w.-]+\b/);
    if (!match) return null;
    return isUPI(match[0]) ? match[0] : null;
  }

  if (type === "PASSWORD") {
    const match = window.match(/\b([^\s]{6,})\b/);
    return match ? match[1] : null;
  }

  if (type === "BANK") {
    const match = window.match(/\b\d{11,17}\b/);
    return match ? match[0] : null;
  }

  if (type === "OTP") {
    const match = window.match(/\b\d{4,6}\b/);
    return match ? match[0] : null;
  }

  return null;
}

function escapeRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function maskWithContext(text: string, map: Record<string, string>) {
  const original = text;
  let masked = text;

  const usedRanges: Range[] = [];
  const wordRegex = /\S+/g;
  let match: RegExpExecArray | null;

  while ((match = wordRegex.exec(original)) !== null) {
    const word = match[0];
    const wordStart = match.index;
    const type = matchKeyword(word.toLowerCase());
    if (!type) continue;

    const windowStart = wordStart + word.length;
    const window = original.slice(windowStart, windowStart + 80);

    if (masked.slice(windowStart, windowStart + 80).includes("__")) continue;

    // EMAIL: extract all in window
    if (type === "EMAIL") {
      const emailsInWindow = window.match(/\b[\w.-]+@[\w.-]+\b/g) ?? [];
      for (const email of emailsInWindow) {
        if (!isEmail(email)) continue;
        const emailStart = original.indexOf(email, windowStart);
        if (emailStart === -1) continue;
        if (isOverlapping(emailStart, emailStart + email.length, usedRanges)) continue;

        const token = `__EMAIL_${uuidv4()}__`;
        map[token] = email;
        masked = masked.replace(new RegExp(`\\b${escapeRegex(email)}\\b`), token);
        usedRanges.push({ start: emailStart, end: emailStart + email.length });
      }
      continue;
    }

    // UPI: extract all in window
    if (type === "UPI") {
      const upiInWindow = window.match(/\b[\w.-]+@[\w.-]+\b/g) ?? [];
      for (const upi of upiInWindow) {
        if (!isUPI(upi)) continue;
        const upiStart = original.indexOf(upi, windowStart);
        if (upiStart === -1) continue;
        if (isOverlapping(upiStart, upiStart + upi.length, usedRanges)) continue;

        const token = `__UPI_${uuidv4()}__`;
        map[token] = upi;
        masked = masked.replace(new RegExp(`\\b${escapeRegex(upi)}\\b`), token);
        usedRanges.push({ start: upiStart, end: upiStart + upi.length });
      }
      continue;
    }

    // all other types: single value
    const value = extractValue(window, type);
    if (!value) continue;

    if (
      (type === "PASSWORD" && (!isLikelyPassword(value) || isEmail(value) || isUPI(value))) ||
      (type === "BANK" && !isLikelyBank(value)) ||
      (type === "OTP" && !isLikelyOTP(value))
    ) continue;

    const valueStart = original.indexOf(value, windowStart);
    if (valueStart === -1) continue;
    if (isOverlapping(valueStart, valueStart + value.length, usedRanges)) continue;

    const token = `__${type}_${uuidv4()}__`;
    map[token] = value;
    masked = masked.replace(new RegExp(`\\b${escapeRegex(value)}\\b`), token);
    usedRanges.push({ start: valueStart, end: valueStart + value.length });
  }

  return masked;
}