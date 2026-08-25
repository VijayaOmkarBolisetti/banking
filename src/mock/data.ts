import type {
  AddressDetails,
  BankDetails,
  CreditScoreState,
  ConsentState,
  CreditAccount,
  LoanApplication,
  PanDetails,
  Transaction,
  UserProfile,
} from '../types'
import { ENTRY_LIMIT } from '../lib/creditScore'

export const APP_NAME = 'CreditFlow'
export const APP_TAGLINE = 'Every loan you need, one app'
/** Ceiling an excellent bureau score unlocks; everyone starts far below it. */
export const MAX_CREDIT_LIMIT = 500000

export const SUPPORT_PHONE = '1800-200-4567'
export const SUPPORT_EMAIL = 'support@creditflow.app'
export const SUPPORT_HOURS = 'Mon–Sat, 9:00am – 7:00pm IST'

export const DEFAULT_PROFILE: UserProfile = {
  fullName: '',
  dateOfBirth: '',
  gender: '',
  email: '',
  employmentType: '',
  monthlyIncome: '',
}

export const DEFAULT_PAN: PanDetails = {
  panNumber: '',
  verified: false,
  holderName: '',
}

export const DEFAULT_ADDRESS: AddressDetails = {
  pinCode: '',
  houseNumber: '',
  street: '',
  city: '',
  state: '',
  residentialStatus: '',
}

export const DEFAULT_BANK: BankDetails = {
  accountHolderName: '',
  bankName: '',
  accountNumber: '',
  ifscCode: '',
  verified: false,
}

export const DEFAULT_CONSENT: ConsentState = {
  notifications: 'pending',
  location: 'pending',
  camera: 'pending',
  termsAccepted: false,
}

export const DEFAULT_CREDIT: CreditAccount = {
  limit: ENTRY_LIMIT,
  used: 0,
  available: ENTRY_LIMIT,
  interestRate: 14.5,
}

export const DEFAULT_CREDIT_SCORE: CreditScoreState = { score: 0, checkedAt: null }

export const DEFAULT_APPLICATION: LoanApplication = {
  productId: null,
  property: {
    propertyType: '',
    propertyValue: '',
    downPayment: '',
    city: '',
    builderName: '',
  },
  business: {
    businessName: '',
    businessType: '',
    gstNumber: '',
    annualTurnover: '',
    yearsInOperation: '',
  },
  collateral: {
    collateralType: '',
    description: '',
    estimatedValue: '',
    purity: '',
    registrationNumber: '',
  },
}

export const DEMO_USER_NAME = 'Vijay Sharma'
export const DEMO_MOBILE = '9876543210'

/**
 * Realistic stand-in data. Used to seed demo routes and, via `lib/demoFill`,
 * to fill any field a presenter leaves blank so no form ever blocks.
 */
export const DEMO_PROFILE: UserProfile = {
  fullName: DEMO_USER_NAME,
  dateOfBirth: '1996-04-12',
  gender: 'male',
  email: 'vijay.sharma@email.com',
  employmentType: 'salaried',
  monthlyIncome: 85000,
}

export const DEMO_PAN: PanDetails = {
  panNumber: 'ABCDE1234F',
  verified: true,
  holderName: DEMO_USER_NAME.toUpperCase(),
}

export const DEMO_ADDRESS: AddressDetails = {
  pinCode: '560038',
  houseNumber: '12A',
  street: 'Indiranagar 100 Feet Road',
  city: 'Bengaluru',
  state: 'Karnataka',
  residentialStatus: 'rented',
}

export const DEMO_BANK: BankDetails = {
  accountHolderName: DEMO_USER_NAME,
  bankName: 'HDFC Bank',
  accountNumber: '501001234567',
  ifscCode: 'HDFC0001234',
  verified: true,
}

export const DEMO_CONSENT: ConsentState = {
  notifications: 'granted',
  location: 'granted',
  camera: 'granted',
  termsAccepted: true,
}

export const ONBOARDING_SLIDES = [
  {
    id: 'instant',
    title: 'Money in 60 seconds',
    description:
      'Instant, personal, home, business or gold — five loans, one application, no paperwork.',
  },
  {
    id: 'transparent',
    title: 'Simple and transparent',
    description: 'See your exact EMI, interest and charges before you commit to anything.',
  },
  {
    id: 'manage',
    title: 'Manage everything in one place',
    description: 'Track every loan, repayment and transaction, and get answers instantly from Flow.',
  },
] as const

export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
] as const

export const EMPLOYMENT_OPTIONS = [
  { value: 'salaried', label: 'Salaried' },
  { value: 'self_employed', label: 'Self-employed' },
  { value: 'student', label: 'Student' },
  { value: 'other', label: 'Other' },
] as const

export const RESIDENTIAL_OPTIONS = [
  { value: 'owned', label: 'Owned' },
  { value: 'rented', label: 'Rented' },
  { value: 'family_property', label: 'Family property' },
] as const

export const PROPERTY_TYPE_OPTIONS = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'independent_house', label: 'Independent house' },
  { value: 'plot', label: 'Plot / land' },
  { value: 'under_construction', label: 'Under construction' },
] as const

export const BUSINESS_TYPE_OPTIONS = [
  { value: 'proprietorship', label: 'Proprietorship' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'private_limited', label: 'Private limited' },
  { value: 'llp', label: 'LLP' },
] as const

export const COLLATERAL_TYPE_OPTIONS = [
  { value: 'gold', label: 'Gold jewellery' },
  { value: 'vehicle', label: 'Vehicle' },
] as const

export const SUPPORT_CATEGORIES = [
  'Loan application',
  'EMI & repayment',
  'KYC & documents',
  'Disbursal delay',
  'Something else',
] as const

export const PINCODE_DIRECTORY: Record<string, { city: string; state: string }> = {
  '560001': { city: 'Bengaluru', state: 'Karnataka' },
  '560038': { city: 'Bengaluru', state: 'Karnataka' },
  '400001': { city: 'Mumbai', state: 'Maharashtra' },
  '110001': { city: 'New Delhi', state: 'Delhi' },
  '600001': { city: 'Chennai', state: 'Tamil Nadu' },
  '500001': { city: 'Hyderabad', state: 'Telangana' },
  '700001': { city: 'Kolkata', state: 'West Bengal' },
  '380001': { city: 'Ahmedabad', state: 'Gujarat' },
  '411001': { city: 'Pune', state: 'Maharashtra' },
  '302001': { city: 'Jaipur', state: 'Rajasthan' },
}

export const IFSC_DIRECTORY: Record<string, { bankName: string; branch: string }> = {
  HDFC0001234: { bankName: 'HDFC Bank', branch: 'Koramangala' },
  HDFC0000001: { bankName: 'HDFC Bank', branch: 'Mumbai Fort' },
  SBIN0000456: { bankName: 'State Bank of India', branch: 'Connaught Place' },
  ICIC0000789: { bankName: 'ICICI Bank', branch: 'Bandra West' },
  UTIB0000321: { bankName: 'Axis Bank', branch: 'Indiranagar' },
  KKBK0000123: { bankName: 'Kotak Mahindra Bank', branch: 'Whitefield' },
}

export const SAMPLE_TRANSACTIONS: Transaction[] = [
  {
    id: 'txn-seed-disbursal',
    title: 'Personal Loan disbursal',
    date: '2026-06-18',
    amount: 97_640,
    type: 'credit',
    status: 'success',
  },
  {
    id: 'txn-seed-fee',
    title: 'Processing fee & GST',
    date: '2026-06-18',
    amount: -2_360,
    type: 'charge',
    status: 'success',
  },
  {
    id: 'txn-seed-emi-1',
    title: 'EMI Payment · UPI',
    date: '2026-07-05',
    amount: -8_992,
    type: 'payment',
    status: 'success',
  },
  {
    id: 'txn-seed-emi-2',
    title: 'EMI Payment · UPI',
    date: '2026-08-05',
    amount: -8_992,
    type: 'payment',
    status: 'success',
  },
]

export const HELP_TOPICS = [
  {
    id: 'products',
    title: 'Which loan should I pick?',
    body: 'Personal loans are unsecured and fastest. Home loans carry the lowest rate but need property papers. Business loans size to your GST turnover. Gold and vehicle loans are secured against an asset you already own.',
  },
  {
    id: 'limit',
    title: 'How is my credit limit decided?',
    body: 'Your limit is based on the profile, income and verification details you shared during onboarding.',
  },
  {
    id: 'emi',
    title: 'When is my EMI due?',
    body: 'The first EMI falls due on the 5th of the month after disbursal, and every EMI after that on the 5th.',
  },
  {
    id: 'prepay',
    title: 'Can I pay early?',
    body: 'Yes. Use Pay Now to clear the next upcoming EMI any time before the due date. Paying an instalment releases that principal back onto your credit limit.',
  },
  {
    id: 'support',
    title: 'Need a human?',
    body: `Call ${SUPPORT_PHONE} (${SUPPORT_HOURS}) or write to ${SUPPORT_EMAIL}. You can also raise a ticket from the Support screen.`,
  },
]

export const TERMS_TEXT = `CreditFlow is a UI/UX demonstration product. It does not issue real credit, collect KYC, or move money.

By continuing you acknowledge that all PAN, bank, OTP, valuation and eligibility steps are simulated with mock data for client presentation only.`

export const PRIVACY_TEXT = `This demo stores onboarding progress in your browser's localStorage so the presentation can be resumed after refresh.

No data is sent to a server. You can clear demo data from the profile screen at any time.`
