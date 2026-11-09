export const EMAIL_OTP_STANDARD_LENGTH = 6;
export const EMAIL_OTP_MIN_LENGTH = 6;
export const EMAIL_OTP_MAX_LENGTH = 8;

/**
 * Normalizes email OTP input by stripping non-digits and capping to max 8 digits.
 */
export function normalizeEmailOtp(value: string): string {
  return value.replace(/\D/g, '').slice(0, EMAIL_OTP_MAX_LENGTH);
}

/**
 * Validates if the OTP is complete (either 6 or 8 numeric digits).
 */
export function isCompleteEmailOtp(value: string): boolean {
  return /^(?:\d{6}|\d{8})$/.test(value);
}

export function isValidEmailOtp(value: string): boolean {
  return isCompleteEmailOtp(value);
}
