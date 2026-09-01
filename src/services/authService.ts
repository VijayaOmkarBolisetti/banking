import { DEMO_MOBILE } from '../mock/data'
import { simulateDelay } from './delay'

export interface AuthResult {
  success: boolean
  message: string
  /** Normalised 10-digit number — falls back to the demo number if blank. */
  mobile: string
}

function normalise(mobile: string): string {
  const digits = mobile.replace(/\D/g, '').slice(-10)
  return digits.length === 10 ? digits : DEMO_MOBILE
}

/** Walkthrough build: any number and any 6-digit code are accepted. */
export const authService = {
  async sendOtp(mobile: string): Promise<AuthResult> {
    await simulateDelay(800)
    return { success: true, message: 'OTP sent to your mobile number', mobile: normalise(mobile) }
  },

  async verifyOtp(mobile: string, _otp: string): Promise<AuthResult> {
    await simulateDelay(1000)
    return { success: true, message: 'Mobile number verified', mobile: normalise(mobile) }
  },
}
