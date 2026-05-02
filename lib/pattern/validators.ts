export function isEmail(value: string) {
  if (!value.includes("@")) return false;
  const parts = value.split("@");
  if (parts.length !== 2) return false;
  const domain = parts[1];
  if (!domain.includes(".")) return false;
  const tld = domain.split(".").pop();
  return !!tld && tld.length >= 2;
}

export function isUPI(value: string) {
  if (!value.includes("@")) return false;
  return !value.split("@")[1].includes(".");
}

export function isLikelyPassword(value: string) {
  return value.length >= 6 && /[a-zA-Z]/.test(value) && /\d/.test(value);
}

export function isLikelyBank(value: string) {
  return /^\d{11,17}$/.test(value);
}

export function isLikelyOTP(value: string) {
  return /^\d{4,6}$/.test(value);
}

export function isValidCard(number: string) {
  const digits = number.replace(/[\s-]/g, "");
  if (!/^\d{13,16}$/.test(digits)) return false;

  let sum = 0;
  let shouldDouble = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}