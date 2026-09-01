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

/** Bureau score plus when it was last pulled. 0 means "not checked yet". */
export interface CreditScoreState {
  score: number
  checkedAt: string | null
}

/* ------------------------------------------------------------------ *
 * Loan products
 * ------------------------------------------------------------------ */

export type LoanProductId = 'instant' | 'personal' | 'home' | 'business' | 'gold'

/** Extra KYC step a product requires before the quote is finalised. */
export type LoanExtraStep = 'property' | 'business' | 'collateral' | null

export interface LoanProduct {
  id: LoanProductId
  name: string
  shortName: string
  tagline: string
  description: string
  /** Lucide icon key resolved in `components/loans/ProductIcon`. */
  icon: 'zap' | 'wallet' | 'home' | 'briefcase' | 'gem'
  /** Tailwind gradient stops for the product card / hero. */
  gradient: string
  accent: string
  /** Second stop for inline gradients built from the product colour. */
  accentTo: string
  photo: string
  minAmount: number
  maxAmount: number
  defaultAmount: number
  amountStep: number
  tenures: number[]
  defaultTenure: number
  interestRate: number
  processingFeePercent: number
  minProcessingFee: number
  extraStep: LoanExtraStep
  /** Marketing bullets shown on the product card and detail hero. */
  highlights: string[]
  /** Documents the customer is told to keep ready. */
  documents: string[]
  disbursalSla: string
  secured: boolean
  /**
   * Instant products fold the agreement into the apply screen and go straight
   * to disbursal, skipping the separate review step.
   */
  skipReview?: boolean
  /** Surfaced as the one-tap CTA on the dashboard. */
  featured?: boolean
}

export interface PropertyDetails {
  propertyType: 'apartment' | 'independent_house' | 'plot' | 'under_construction' | ''
  propertyValue: number | ''
  downPayment: number | ''
  city: string
  builderName: string
}

export interface BusinessDetails {
  businessName: string
  businessType: 'proprietorship' | 'partnership' | 'private_limited' | 'llp' | ''
  gstNumber: string
  annualTurnover: number | ''
  yearsInOperation: number | ''
}

export interface CollateralDetails {
  collateralType: 'gold' | 'vehicle' | ''
  description: string
  estimatedValue: number | ''
  purity: string
  registrationNumber: string
}

export interface LoanApplication {
  productId: LoanProductId | null
  property: PropertyDetails
  business: BusinessDetails
  collateral: CollateralDetails
}

export interface LoanQuote {
  productId: LoanProductId
  amount: number
  tenure: number
  processingFee: number
  gst: number
  netAmount: number
  interestRate: number
  monthlyEmi: number
  totalInterest: number
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
  loanId?: string
}

export interface ActiveLoan {
  id: string
  productId: LoanProductId
  productName: string
  amount: number
  netAmount: number
  tenure: number
  interestRate: number
  monthlyEmi: number
  totalRepayment: number
  totalInterest: number
  processingFee: number
  gst: number
  firstDueDate: string
  startDate: string
  emis: EmiInstallment[]
  closed: boolean
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

/* ------------------------------------------------------------------ *
 * Support & chat
 * ------------------------------------------------------------------ */

export type ChatRole = 'bot' | 'user'

/** Actions the assistant can run in-place, without leaving the transcript. */
export type ChatAction =
  | { kind: 'instant_start' }
  | { kind: 'instant_amount'; amount: number }
  | { kind: 'instant_confirm'; amount: number; tenure: number }

export interface ChatQuickReply {
  label: string
  /** Text sent back to the bot when tapped. */
  send?: string
  /** Route pushed when tapped. */
  to?: string
  /** Runs an in-chat action instead of navigating. */
  action?: ChatAction
}

export interface ChatMessage {
  id: string
  role: ChatRole
  text: string
  at: string
  quickReplies?: ChatQuickReply[]
}

/* ------------------------------------------------------------------ *
 * Flow Coins — the rewards programme
 * ------------------------------------------------------------------ */

export type CoinReason =
  | 'onboarding'
  | 'disbursal'
  | 'emi_paid'
  | 'emi_early'
  | 'streak'
  | 'referral'
  | 'redeemed'

export interface CoinEntry {
  id: string
  at: string
  /** Positive when earned, negative when redeemed. */
  amount: number
  reason: CoinReason
  label: string
}

export type RewardKind = 'fee_waiver' | 'rate_discount' | 'cashback'

export interface Reward {
  id: string
  kind: RewardKind
  title: string
  description: string
  cost: number
  /** ₹ value for fee/cashback rewards, or percentage points for a rate cut. */
  value: number
  icon: 'receipt' | 'percent' | 'wallet'
  accent: string
}

/** A redeemed reward waiting to be applied to the next eligible loan. */
export interface RedeemedReward {
  id: string
  rewardId: string
  title: string
  kind: RewardKind
  value: number
  redeemedAt: string
  used: boolean
}

export type TicketStatus = 'open' | 'in_progress' | 'resolved'

export interface SupportTicket {
  id: string
  subject: string
  category: string
  message: string
  status: TicketStatus
  createdAt: string
}

/* ------------------------------------------------------------------ *
 * Persistence & admin
 * ------------------------------------------------------------------ */

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
  creditScore: CreditScoreState
  loans: ActiveLoan[]
  application: LoanApplication
  pendingQuote: LoanQuote | null
  transactions: Transaction[]
  tickets: SupportTicket[]
  chat: ChatMessage[]
  coins: number
  coinLedger: CoinEntry[]
  redeemed: RedeemedReward[]
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
  | 'support'
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
