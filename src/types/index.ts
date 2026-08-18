export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say'
export type EmploymentType = 'salaried' | 'self_employed' | 'student' | 'other'
export type ResidentialStatus = 'owned' | 'rented' | 'family_property'
export type PaymentMethod = 'upi' | 'debit_card' | 'net_banking'
export type TransactionType = 'credit' | 'payment' | 'charge'
export type TransactionStatus = 'success' | 'pending' | 'failed'
export type EmiStatus = 'paid' | 'upcoming' | 'overdue'
export type PermissionStatus = 'granted' | 'not_now' | 'pending'
export type ToastType = 'success' | 'error' | 'info'

export type OnboardingStep =
  | 'splash'
  | 'onboarding'
  | 'login'
  | 'otp'
  | 'profile'
  | 'pan'
  | 'address'
  | 'bank'
  | 'consent'
  | 'eligibility'
  | 'credit_approved'
  | 'complete'

export interface UserProfile {
  fullName: string
  dateOfBirth: string
  gender: Gender | ''
  email: string
  employmentType: EmploymentType | ''
  monthlyIncome: number | ''
}

export interface PanDetails {
  panNumber: string
  verified: boolean
  holderName: string
}

export interface AddressDetails {
  pinCode: string
  houseNumber: string
  street: string
  city: string
  state: string
  residentialStatus: ResidentialStatus | ''
}

export interface BankDetails {
  accountHolderName: string
  bankName: string
  accountNumber: string
  ifscCode: string
  verified: boolean
}

export interface ConsentState {
  notifications: PermissionStatus
  location: PermissionStatus
  camera: PermissionStatus
  termsAccepted: boolean
}

export interface CreditAccount {
  limit: number
  used: number
  available: number
  interestRate: number
}

export interface LoanQuote {
  amount: number
  tenure: number
  processingFee: number
  gst: number
  netAmount: number
  interestRate: number
  monthlyEmi: number
  totalRepayment: number
}

export interface EmiInstallment {
  id: string
  number: number
  dueDate: string
  amount: number
  status: EmiStatus
}

export interface Transaction {
  id: string
  title: string
  date: string
  amount: number
  type: TransactionType
  status: TransactionStatus
}

export interface ActiveLoan {
  id: string
  amount: number
  netAmount: number
  tenure: number
  interestRate: number
  monthlyEmi: number
  totalRepayment: number
  processingFee: number
  gst: number
  firstDueDate: string
  startDate: string
  emis: EmiInstallment[]
}

export interface ProcessingStep {
  id: string
  label: string
  status: 'pending' | 'active' | 'done'
}

export interface ToastMessage {
  id: string
  message: string
  type: ToastType
}

export interface AppPersistedState {
  onboardingSeen: boolean
  isAuthenticated: boolean
  mobileNumber: string
  currentStep: OnboardingStep
  profile: UserProfile
  pan: PanDetails
  address: AddressDetails
  bank: BankDetails
  consent: ConsentState
  credit: CreditAccount
  activeLoan: ActiveLoan | null
  pendingQuote: LoanQuote | null
  transactions: Transaction[]
}

export interface ProductConfig {
  creditLimit: number
  minAmount: number
  maxAmount: number
  defaultAmount: number
  amountStep: number
  interestRate: number
  processingFeePercent: number
  minProcessingFee: number
  gstPercent: number
  tenures: number[]
  defaultTenure: number
  firstDueDate: string
}

export type OperationActor = 'customer' | 'admin'
export type OperationType =
  | 'login'
  | 'kyc'
  | 'eligibility'
  | 'loan'
  | 'payment'
  | 'settings'
  | 'admin'

export interface Operation {
  id: string
  at: string
  actor: OperationActor
  type: OperationType
  title: string
  detail: string
  amount?: number
  status: TransactionStatus
}
