import { validateMobile, validateOtp } from '../lib/validation'
import { simulateDelay } from './delay'

export interface AuthResult {
  success: boolean
  message: string
}

export const authService = {
  async sendOtp(mobile: string): Promise<AuthResult> {
    const error = validateMobile(mobile)
    if (error) {
      return { success: false, message: error }
    }
    await simulateDelay(900)
    return {
      success: true,
      message: 'OTP sent to your mobile number',
    }
  },

  async verifyOtp(mobile: string, otp: string): Promise<AuthResult> {
    const mobileError = validateMobile(mobile)
    if (mobileError) return { success: false, message: mobileError }

    const otpError = validateOtp(otp)
    if (otpError) return { success: false, message: otpError }

    await simulateDelay(1100)
    return {
      success: true,
      message: 'Mobile number verified',
    }
  },
}
