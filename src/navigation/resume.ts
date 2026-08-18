import { ROUTES } from './routes'
import type { OnboardingStep } from '../types'

export function routeForStep(step: OnboardingStep): string {
  switch (step) {
    case 'onboarding':
      return ROUTES.ONBOARDING
    case 'login':
      return ROUTES.LOGIN
    case 'otp':
      return ROUTES.OTP
    case 'profile':
      return ROUTES.PROFILE
    case 'pan':
      return ROUTES.PAN
    case 'address':
      return ROUTES.ADDRESS
    case 'bank':
      return ROUTES.BANK
    case 'consent':
      return ROUTES.CONSENT
    case 'eligibility':
      return ROUTES.ELIGIBILITY
    case 'credit_approved':
      return ROUTES.CREDIT_APPROVED
    case 'complete':
      return ROUTES.DASHBOARD
    default:
      return ROUTES.ONBOARDING
  }
}
