export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/
export const MOBILE_REGEX = /^[6-9]\d{9}$/
export const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/
export const PIN_REGEX = /^\d{6}$/
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const ACCOUNT_REGEX = /^\d{9,18}$/

export interface FieldError {
  field: string
  message: string
}

export function validateMobile(mobile: string): string | null {
  const digits = mobile.replace(/\D/g, '')
  if (!digits) return 'Enter your mobile number'
  if (!MOBILE_REGEX.test(digits)) return 'Enter a valid 10-digit Indian mobile number'
  return null
}

export function validateOtp(otp: string): string | null {
  if (!/^\d{6}$/.test(otp)) return 'Enter the 6-digit OTP'
  return null
}

export function validatePan(pan: string): string | null {
  const value = pan.toUpperCase().trim()
  if (!value) return 'Enter your PAN number'
  if (!PAN_REGEX.test(value)) return 'PAN should look like ABCDE1234F'
  return null
}

export function validateEmail(email: string): string | null {
  if (!email.trim()) return 'Enter your email address'
  if (!EMAIL_REGEX.test(email.trim())) return 'Enter a valid email address'
  return null
}

export function validateIfsc(ifsc: string): string | null {
  const value = ifsc.toUpperCase().trim()
  if (!value) return 'Enter IFSC code'
  if (!IFSC_REGEX.test(value)) return 'IFSC should look like HDFC0001234'
  return null
}

export function validatePinCode(pin: string): string | null {
  if (!PIN_REGEX.test(pin.trim())) return 'Enter a valid 6-digit PIN code'
  return null
}

export function validateAccountNumber(account: string): string | null {
  if (!account.trim()) return 'Enter your account number'
  if (!ACCOUNT_REGEX.test(account.trim())) return 'Enter a valid 9–18 digit account number'
  return null
}

export function isAdult(dateOfBirth: string, asOf = new Date()): boolean {
  const dob = new Date(`${dateOfBirth}T00:00:00`)
  if (Number.isNaN(dob.getTime())) return false
  const cutoff = new Date(asOf)
  cutoff.setFullYear(cutoff.getFullYear() - 18)
  return dob <= cutoff
}

export function required(value: string, label: string): string | null {
  if (!value.trim()) return `${label} is required`
  return null
}
