export const PATTERNS = {
  GENERIC_AT: /\b[\w.-]+@[\w.-]+\b/g,
  PHONE_GLOBAL: /\b(\+?\d{1,3}[\s-]?)?\d{10}\b/g,
  CARD: /\b(?:\d[ -]*?){13,16}\b/g,
  API_KEY: /\b(sk|pk)_[A-Za-z0-9]{20,}\b/g,
};