export const ROUTES = {
  SPLASH: '/',
  ONBOARDING: '/onboarding',
  LOGIN: '/login',
  OTP: '/otp',
  PROFILE: '/profile-setup',
  PAN: '/pan',
  ADDRESS: '/address',
  BANK: '/bank',
  CONSENT: '/consent',
  ELIGIBILITY: '/eligibility',
  CREDIT_APPROVED: '/credit-approved',

  DASHBOARD: '/app/home',
  CREDIT: '/app/credit',
  PAYMENTS: '/app/payments',
  PROFILE_HOME: '/app/profile',

  /** Tab listing every loan the customer holds. */
  MY_LOANS: '/app/my-loans',
  REWARDS: '/app/rewards',
  /** Product catalogue; `${LOAN_PRODUCTS}/:productId` opens the apply flow. */
  LOAN_PRODUCTS: '/app/loans/apply',
  LOAN_DETAILS_FORM: '/app/loans/details',
  LOAN_REVIEW: '/app/loan-review',
  LOAN_PROCESSING: '/app/loan-processing',
  LOAN_SUCCESS: '/app/loan-success',
  REPAYMENT_SCHEDULE: '/app/repayment-schedule',
  PAY_NOW: '/app/pay-now',
  TRANSACTIONS: '/app/transactions',
  CREDIT_DETAILS: '/app/credit-details',

  SUPPORT: '/app/support',
  CHAT: '/app/chat',

  PROFILE_APPEARANCE: '/app/profile/appearance',
  PROFILE_PERSONAL: '/app/profile/personal',
  PROFILE_BANK: '/app/profile/bank',
  PROFILE_DOCUMENTS: '/app/profile/documents',
  PROFILE_NOTIFICATIONS: '/app/profile/notifications',
  PROFILE_SECURITY: '/app/profile/security',
  PROFILE_HELP: '/app/profile/help',
  PROFILE_TERMS: '/app/profile/terms',
  PROFILE_PRIVACY: '/app/profile/privacy',

  ADMIN_LOGIN: '/admin/login',
  ADMIN_HOME: '/admin',
  ADMIN_SETTINGS: '/admin/settings',
  ADMIN_OPERATIONS: '/admin/operations',
  ADMIN_CUSTOMERS: '/admin/customers',
  ADMIN_LOANS: '/admin/loans',
  ADMIN_SUPPORT: '/admin/support',
  ADMIN_APPEARANCE: '/admin/appearance',
} as const

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES]

export function applyRoute(productId: string): string {
  return `${ROUTES.LOAN_PRODUCTS}/${productId}`
}
