import type {
  AddressDetails,
  BankDetails,
  ConsentState,
  CreditAccount,
  PanDetails,
  Transaction,
  UserProfile,
} from '../types'

export const APP_NAME = 'CreditFlow'
export const APP_TAGLINE = 'Smart credit, when you need it'
export const CREDIT_LIMIT = 50000

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
  limit: CREDIT_LIMIT,
  used: 0,
  available: CREDIT_LIMIT,
  interestRate: 18,
}

export const DEMO_USER_NAME = 'Vijay Sharma'
export const DEMO_MOBILE = '9876543210'

export const ONBOARDING_SLIDES = [
  {
    id: 'credit',
    title: 'Credit when you need it',
    description: 'Get access to flexible credit in just a few steps.',
    accent: 'from-indigo-500 to-blue-500',
  },
  {
    id: 'transparent',
    title: 'Simple and transparent',
    description: 'Know your repayment amount before you proceed.',
    accent: 'from-violet-500 to-indigo-500',
  },
  {
    id: 'manage',
    title: 'Manage everything in one place',
    description: 'Track credit, repayments and transactions easily.',
    accent: 'from-blue-500 to-cyan-500',
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

export const BANK_NAMES = [
  'HDFC Bank',
  'State Bank of India',
  'ICICI Bank',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'Bank of Baroda',
  'Punjab National Bank',
]

export const SAMPLE_TRANSACTIONS: Transaction[] = [
  {
    id: 'txn-disbursal',
    title: 'Credit Disbursal',
    date: '2026-08-18',
    amount: 19412,
    type: 'credit',
    status: 'success',
  },
  {
    id: 'txn-fee',
    title: 'Processing Fee',
    date: '2026-08-18',
    amount: -499,
    type: 'charge',
    status: 'success',
  },
  {
    id: 'txn-emi-1',
    title: 'EMI Payment',
    date: '2026-09-05',
    amount: -3650,
    type: 'payment',
    status: 'pending',
  },
]

export const HELP_TOPICS = [
  { id: 'limit', title: 'How is my credit limit decided?', body: 'Your limit is based on the profile, income and verification details you shared during onboarding.' },
  { id: 'emi', title: 'When is my EMI due?', body: 'The first EMI is due on 5 September 2026. Later EMIs follow on the 5th of each month.' },
  { id: 'prepay', title: 'Can I pay early?', body: 'Yes. Use Pay Now to clear the next upcoming EMI any time before the due date.' },
  { id: 'support', title: 'Need help?', body: 'For account help, write to support@creditflow.app. We typically reply within one business day.' },
]

export const TERMS_TEXT = `CreditFlow is a UI/UX demonstration product. It does not issue real credit, collect KYC, or move money.

By continuing you acknowledge that all PAN, bank, OTP and eligibility steps are simulated with mock data for client presentation only.`

export const PRIVACY_TEXT = `This demo stores onboarding progress in your browser's localStorage so the presentation can be resumed after refresh.

No data is sent to a server. You can clear demo data from the profile screen at any time.`
