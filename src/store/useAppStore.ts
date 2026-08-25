import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type {
  ActiveLoan,
  AddressDetails,
  AppPersistedState,
  BankDetails,
  BusinessDetails,
  ChatMessage,
  CoinEntry,
  CoinReason,
  CollateralDetails,
  ConsentState,
  CreditAccount,
  CreditScoreState,
  EmiInstallment,
  LoanProductId,
  LoanQuote,
  OnboardingStep,
  PanDetails,
  PermissionStatus,
  PropertyDetails,
  RedeemedReward,
  Reward,
  SupportTicket,
  ToastMessage,
  Transaction,
  UserProfile,
} from '../types'
import { zustandSyncStorage } from '../lib/storage'
import {
  DEFAULT_ADDRESS,
  DEFAULT_APPLICATION,
  DEFAULT_BANK,
  DEFAULT_CONSENT,
  DEFAULT_CREDIT,
  DEFAULT_CREDIT_SCORE,
  DEFAULT_PAN,
  DEFAULT_PROFILE,
  DEMO_MOBILE,
  DEMO_USER_NAME,
  SAMPLE_TRANSACTIONS,
} from '../mock/data'
import { loanService } from '../services/loanService'
import { calculateLoan } from '../lib/loanCalculator'
import { getProduct } from '../lib/loanProducts'
import { COIN_REASON_LABELS, coinsForDisbursal, coinsForEmi } from '../lib/rewards'
import { limitForScore, scoreAfterOnTimePayment, scoreFromProfile } from '../lib/creditScore'
import { getProductConfig } from './useConfigStore'
import { logOperation } from './useAdminStore'
import { todayIso } from '../lib/format'
import { createId } from '../services/delay'

interface ToastState {
  toasts: ToastMessage[]
  showToast: (message: string, type?: ToastMessage['type']) => void
  dismissToast: (id: string) => void
}

interface AppStore extends AppPersistedState, ToastState {
  setOnboardingSeen: (seen: boolean) => void
  setMobileNumber: (mobile: string) => void
  setAuthenticated: (value: boolean) => void
  setCurrentStep: (step: OnboardingStep) => void
  setProfile: (profile: Partial<UserProfile>) => void
  setPan: (pan: Partial<PanDetails>) => void
  setAddress: (address: Partial<AddressDetails>) => void
  setBank: (bank: Partial<BankDetails>) => void
  setConsent: (consent: Partial<ConsentState>) => void
  setPermission: (key: 'notifications' | 'location' | 'camera', status: PermissionStatus) => void
  setCredit: (credit: CreditAccount) => void
  /** Runs the bureau check and sets the limit from the resulting band. */
  runCreditCheck: (ceiling: number) => CreditScoreState
  setPendingQuote: (quote: LoanQuote | null) => void

  selectProduct: (productId: LoanProductId) => void
  setPropertyDetails: (details: Partial<PropertyDetails>) => void
  setBusinessDetails: (details: Partial<BusinessDetails>) => void
  setCollateralDetails: (details: Partial<CollateralDetails>) => void

  activateLoan: (loan: ActiveLoan) => void
  applyEmiPayment: (loanId: string, emiId: string, transaction: Transaction) => void
  addTransaction: (transaction: Transaction) => void

  awardCoins: (amount: number, reason: CoinReason, label?: string) => void
  redeemReward: (reward: Reward) => boolean

  addTicket: (ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'status'>) => SupportTicket
  pushChatMessage: (message: Omit<ChatMessage, 'id' | 'at'>) => void
  /** Seeds the opening bot turn exactly once, however many callers ask. */
  ensureGreeting: (message: Omit<ChatMessage, 'id' | 'at'>) => void
  clearChat: () => void

  logout: () => void
  resetDemo: () => void
  seedForDemoRoute: (step: OnboardingStep | 'dashboard') => void
}

const initialPersisted: AppPersistedState = {
  onboardingSeen: false,
  isAuthenticated: false,
  mobileNumber: '',
  currentStep: 'splash',
  profile: DEFAULT_PROFILE,
  pan: DEFAULT_PAN,
  address: DEFAULT_ADDRESS,
  bank: DEFAULT_BANK,
  consent: DEFAULT_CONSENT,
  credit: DEFAULT_CREDIT,
  creditScore: DEFAULT_CREDIT_SCORE,
  loans: [],
  application: DEFAULT_APPLICATION,
  pendingQuote: null,
  transactions: [],
  tickets: [],
  chat: [],
  coins: 0,
  coinLedger: [],
  redeemed: [],
}

/* ------------------------------------------------------------------ *
 * Selectors — derived views the screens share
 * ------------------------------------------------------------------ */

export function selectOpenLoans(state: Pick<AppStore, 'loans'>): ActiveLoan[] {
  return state.loans.filter((loan) => !loan.closed)
}

export interface NextEmi extends EmiInstallment {
  loan: ActiveLoan
}

/** The earliest unpaid instalment across every open loan. */
export function selectNextEmi(state: Pick<AppStore, 'loans'>): NextEmi | null {
  const candidates: NextEmi[] = []
  for (const loan of selectOpenLoans(state)) {
    const emi = loan.emis.find((item) => item.status === 'upcoming' || item.status === 'overdue')
    if (emi) candidates.push({ ...emi, loan })
  }
  if (candidates.length === 0) return null
  return candidates.sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0]
}

export function selectTotalOutstanding(state: Pick<AppStore, 'loans'>): number {
  return selectOpenLoans(state).reduce((sum, loan) => {
    const unpaid = loan.emis.filter((emi) => emi.status !== 'paid').length
    return sum + unpaid * loan.monthlyEmi
  }, 0)
}

/** Coins earned this calendar month, for the rewards header. */
export function selectCoinsThisMonth(state: Pick<AppStore, 'coinLedger'>): number {
  const now = new Date()
  return state.coinLedger
    .filter((entry) => {
      const at = new Date(entry.at)
      return (
        entry.amount > 0 &&
        at.getMonth() === now.getMonth() &&
        at.getFullYear() === now.getFullYear()
      )
    })
    .reduce((sum, entry) => sum + entry.amount, 0)
}

export function selectMonthlyOutflow(state: Pick<AppStore, 'loans'>): number {
  return selectOpenLoans(state).reduce((sum, loan) => sum + loan.monthlyEmi, 0)
}

/**
 * Principal freed by paying one instalment. Straight-line across the tenure,
 * with the final instalment releasing whatever rounding left behind so a
 * fully-repaid loan always returns the entire limit.
 */
function principalShare(loan: ActiveLoan, emiNumber: number): number {
  const perEmi = Math.round(loan.amount / loan.tenure)
  if (emiNumber >= loan.tenure) return Math.max(0, loan.amount - perEmi * (loan.tenure - 1))
  return perEmi
}

/* ------------------------------------------------------------------ *
 * Demo seeding
 * ------------------------------------------------------------------ */

const DEMO_IDENTITY = {
  profile: {
    fullName: DEMO_USER_NAME,
    dateOfBirth: '1996-04-12',
    gender: 'male' as const,
    email: 'vijay.sharma@email.com',
    employmentType: 'salaried' as const,
    monthlyIncome: 85000,
  },
  pan: {
    panNumber: 'ABCDE1234F',
    verified: true,
    holderName: DEMO_USER_NAME.toUpperCase(),
  },
  address: {
    pinCode: '560038',
    houseNumber: '12A',
    street: 'Indiranagar 100 Feet Road',
    city: 'Bengaluru',
    state: 'Karnataka',
    residentialStatus: 'rented' as const,
  },
  bank: {
    accountHolderName: DEMO_USER_NAME,
    bankName: 'HDFC Bank',
    accountNumber: '501001234567',
    ifscCode: 'HDFC0001234',
    verified: true,
  },
  consent: {
    notifications: 'granted' as const,
    location: 'granted' as const,
    camera: 'granted' as const,
    termsAccepted: true,
  },
}

function presentationSeed(): Partial<AppPersistedState> {
  const config = getProductConfig()
  const personal = getProduct('personal')
  // The demo user's own profile decides their band — no hand-picked number.
  const score = scoreFromProfile(DEMO_IDENTITY.profile)
  const limit = limitForScore(score, config.creditLimit)

  // One active personal loan with the first two EMIs already settled, so the
  // dashboard has repayment history to show on open.
  const quote = calculateLoan('personal', personal.defaultAmount, personal.defaultTenure)
  const loan = loanService.createLoan(quote)
  const emis = loan.emis.map((emi, index) => (index < 2 ? { ...emi, status: 'paid' as const } : emi))
  const seeded: ActiveLoan = { ...loan, emis }

  const usedAfterRepayment =
    seeded.amount - principalShare(seeded, 1) - principalShare(seeded, 2)
  const used = Math.min(limit, Math.max(0, usedAfterRepayment))

  return {
    onboardingSeen: true,
    isAuthenticated: true,
    mobileNumber: DEMO_MOBILE,
    currentStep: 'complete',
    ...DEMO_IDENTITY,
    creditScore: { score, checkedAt: '2026-06-18T10:55:00.000Z' },
    credit: {
      limit,
      used: Math.min(used, limit),
      available: limit - Math.min(used, limit),
      interestRate: config.interestRate,
    },
    loans: [seeded],
    application: DEFAULT_APPLICATION,
    pendingQuote: null,
    transactions: SAMPLE_TRANSACTIONS,
    tickets: [],
    chat: [],
    // Coins matching the seeded history: KYC + disbursal + two EMIs paid.
    coins: 1_240,
    coinLedger: [
      { id: 'coin-seed-4', at: '2026-08-05T09:12:00.000Z', amount: 250, reason: 'emi_paid', label: 'EMI 2 paid' },
      { id: 'coin-seed-3', at: '2026-07-05T09:04:00.000Z', amount: 250, reason: 'emi_paid', label: 'EMI 1 paid' },
      { id: 'coin-seed-2', at: '2026-06-18T11:30:00.000Z', amount: 240, reason: 'disbursal', label: 'Personal Loan disbursed' },
      { id: 'coin-seed-1', at: '2026-06-18T11:02:00.000Z', amount: 500, reason: 'onboarding', label: 'KYC completed' },
    ],
    redeemed: [],
  }
}

function kycSeed(step: OnboardingStep): Partial<AppPersistedState> {
  if (step === 'login' || step === 'otp' || step === 'onboarding' || step === 'splash') {
    return {
      onboardingSeen: step !== 'onboarding' && step !== 'splash',
      isAuthenticated: false,
      mobileNumber: step === 'otp' ? DEMO_MOBILE : '',
      currentStep: step,
    }
  }

  const base: Partial<AppPersistedState> = {
    onboardingSeen: true,
    isAuthenticated: true,
    mobileNumber: DEMO_MOBILE,
    currentStep: step,
    profile: DEMO_IDENTITY.profile,
  }

  if (step === 'profile') return { ...base, profile: DEFAULT_PROFILE }
  if (step === 'pan') return { ...base, pan: DEFAULT_PAN }

  const withPan = { ...base, pan: DEMO_IDENTITY.pan }
  if (step === 'address') return withPan

  const withAddress = { ...withPan, address: DEMO_IDENTITY.address }
  if (step === 'bank') return { ...withAddress, bank: DEFAULT_BANK }

  const withBank = { ...withAddress, bank: DEMO_IDENTITY.bank }
  if (step === 'consent') return { ...withBank, consent: DEFAULT_CONSENT }
  if (step === 'eligibility' || step === 'credit_approved') {
    return { ...withBank, consent: DEMO_IDENTITY.consent, credit: DEFAULT_CREDIT }
  }

  return presentationSeed()
}

/* ------------------------------------------------------------------ *
 * Store
 * ------------------------------------------------------------------ */

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...initialPersisted,
      toasts: [],

      showToast: (message, type = 'info') => {
        const id = createId('toast')
        set((state) => ({ toasts: [...state.toasts, { id, message, type }] }))
        setTimeout(() => get().dismissToast(id), 2800)
      },

      dismissToast: (id) => {
        set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) }))
      },

      setOnboardingSeen: (onboardingSeen) => set({ onboardingSeen }),
      setMobileNumber: (mobileNumber) => set({ mobileNumber }),
      setAuthenticated: (isAuthenticated) => {
        if (isAuthenticated) {
          logOperation('customer', 'login', 'Customer verified OTP', get().mobileNumber || 'mobile login')
        }
        set({ isAuthenticated })
      },
      setCurrentStep: (currentStep) => set({ currentStep }),
      setProfile: (profile) => set((state) => ({ profile: { ...state.profile, ...profile } })),
      setPan: (pan) => set((state) => ({ pan: { ...state.pan, ...pan } })),
      setAddress: (address) => set((state) => ({ address: { ...state.address, ...address } })),
      setBank: (bank) => set((state) => ({ bank: { ...state.bank, ...bank } })),
      setConsent: (consent) => set((state) => ({ consent: { ...state.consent, ...consent } })),
      setPermission: (key, status) =>
        set((state) => ({ consent: { ...state.consent, [key]: status } })),
      setCredit: (credit) => set({ credit }),

      runCreditCheck: (ceiling) => {
        const score = scoreFromProfile(get().profile)
        const limit = limitForScore(score, ceiling)
        const next: CreditScoreState = { score, checkedAt: new Date().toISOString() }

        set((state) => {
          const used = Math.min(state.credit.used, limit)
          return {
            creditScore: next,
            credit: { ...state.credit, limit, used, available: limit - used },
          }
        })
        return next
      },
      setPendingQuote: (pendingQuote) => set({ pendingQuote }),

      selectProduct: (productId) =>
        set((state) => ({ application: { ...state.application, productId } })),

      setPropertyDetails: (details) =>
        set((state) => ({
          application: { ...state.application, property: { ...state.application.property, ...details } },
        })),

      setBusinessDetails: (details) =>
        set((state) => ({
          application: { ...state.application, business: { ...state.application.business, ...details } },
        })),

      setCollateralDetails: (details) =>
        set((state) => ({
          application: {
            ...state.application,
            collateral: { ...state.application.collateral, ...details },
          },
        })),

      activateLoan: (loan) => {
        const txnDate = todayIso()
        const disbursal: Transaction = {
          id: `txn-disbursal-${loan.id}`,
          title: `${loan.productName} disbursal`,
          date: txnDate,
          amount: loan.netAmount,
          type: 'credit',
          status: 'success',
          loanId: loan.id,
        }
        const fee: Transaction = {
          id: `txn-fee-${loan.id}`,
          title: 'Processing fee & GST',
          date: txnDate,
          amount: -(loan.processingFee + loan.gst),
          type: 'charge',
          status: 'success',
          loanId: loan.id,
        }

        set((state) => {
          const used = Math.min(state.credit.limit, state.credit.used + loan.amount)
          return {
            loans: [loan, ...state.loans],
            pendingQuote: null,
            application: DEFAULT_APPLICATION,
            currentStep: 'complete',
            credit: { ...state.credit, used, available: state.credit.limit - used },
            transactions: [disbursal, fee, ...state.transactions],
          }
        })

        get().awardCoins(coinsForDisbursal(loan.amount), 'disbursal', `${loan.productName} disbursed`)

        logOperation(
          'customer',
          'loan',
          `${loan.productName} disbursed`,
          `₹${loan.amount.toLocaleString('en-IN')} over ${loan.tenure} months @ ${loan.interestRate}%`,
          { amount: loan.netAmount },
        )
      },

      /**
       * Marks one instalment paid, releases its principal back onto the credit
       * line, and closes the loan once every instalment is settled.
       */
      applyEmiPayment: (loanId, emiId, transaction) => {
        set((state) => {
          const loan = state.loans.find((item) => item.id === loanId)
          if (!loan) return state

          const emi = loan.emis.find((item) => item.id === emiId)
          if (!emi || emi.status === 'paid') return state

          const emis = loan.emis.map((item) =>
            item.id === emiId ? { ...item, status: 'paid' as const } : item,
          )
          const closed = emis.every((item) => item.status === 'paid')
          const updated: ActiveLoan = { ...loan, emis, closed }

          const released = principalShare(loan, emi.number)
          const used = Math.max(0, state.credit.used - released)

          return {
            ...state,
            loans: state.loans.map((item) => (item.id === loanId ? updated : item)),
            credit: { ...state.credit, used, available: state.credit.limit - used },
            transactions: [transaction, ...state.transactions],
          }
        })

        const settled = get().loans.find((item) => item.id === loanId)
        const paidEmi = settled?.emis.find((item) => item.id === emiId)
        if (paidEmi) {
          get().awardCoins(coinsForEmi(paidEmi.dueDate), 'emi_paid', `EMI ${paidEmi.number} paid`)
        }

        // Repaying builds the bureau score, which is what unlocks a bigger limit.
        set((state) => {
          if (!state.creditScore.score) return state
          const score = scoreAfterOnTimePayment(state.creditScore.score)
          const limit = Math.max(state.credit.limit, limitForScore(score, state.credit.limit))
          return {
            ...state,
            creditScore: { ...state.creditScore, score },
            credit: { ...state.credit, limit, available: limit - state.credit.used },
          }
        })

        logOperation('customer', 'payment', transaction.title, `₹${Math.abs(transaction.amount).toLocaleString('en-IN')}`, {
          amount: transaction.amount,
          status: transaction.status,
        })
      },

      addTransaction: (transaction) =>
        set((state) => ({ transactions: [transaction, ...state.transactions] })),

      awardCoins: (amount, reason, label) => {
        if (amount === 0) return
        const entry: CoinEntry = {
          id: createId('coin'),
          at: new Date().toISOString(),
          amount,
          reason,
          label: label ?? COIN_REASON_LABELS[reason],
        }
        set((state) => ({
          coins: Math.max(0, state.coins + amount),
          coinLedger: [entry, ...state.coinLedger].slice(0, 100),
        }))
      },

      /** Spends coins on a reward. Returns false when the balance is short. */
      redeemReward: (reward) => {
        if (get().coins < reward.cost) return false

        const redeemed: RedeemedReward = {
          id: createId('rwd'),
          rewardId: reward.id,
          title: reward.title,
          kind: reward.kind,
          value: reward.value,
          redeemedAt: new Date().toISOString(),
          used: false,
        }
        set((state) => ({
          coins: state.coins - reward.cost,
          redeemed: [redeemed, ...state.redeemed],
          coinLedger: [
            {
              id: createId('coin'),
              at: new Date().toISOString(),
              amount: -reward.cost,
              reason: 'redeemed' as const,
              label: reward.title,
            },
            ...state.coinLedger,
          ].slice(0, 100),
        }))
        logOperation('customer', 'support', 'Reward redeemed', `${reward.title} · ${reward.cost} coins`)
        return true
      },

      addTicket: (input) => {
        const ticket: SupportTicket = {
          ...input,
          id: createId('tkt'),
          status: 'open',
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ tickets: [ticket, ...state.tickets] }))
        logOperation('customer', 'support', `Ticket raised · ${ticket.category}`, ticket.subject)
        return ticket
      },

      pushChatMessage: (message) =>
        set((state) => ({
          chat: [...state.chat, { ...message, id: createId('msg'), at: new Date().toISOString() }].slice(-60),
        })),

      // Checked inside `set` so concurrent callers (StrictMode's double effect
      // invocation, or two mounted chat panels) can't both win the race.
      ensureGreeting: (message) =>
        set((state) =>
          state.chat.length > 0
            ? state
            : { chat: [{ ...message, id: createId('msg'), at: new Date().toISOString() }] },
        ),

      clearChat: () => set({ chat: [] }),

      logout: () => {
        logOperation('customer', 'login', 'Customer signed out', get().mobileNumber || 'session ended')
        set({ isAuthenticated: false, currentStep: 'login' })
      },

      resetDemo: () => set({ ...initialPersisted, toasts: [] }),

      seedForDemoRoute: (step) => {
        if (step === 'dashboard' || step === 'complete') {
          set({ ...initialPersisted, ...presentationSeed(), toasts: get().toasts })
          return
        }
        set({ ...initialPersisted, ...kycSeed(step), toasts: get().toasts })
      },
    }),
    {
      name: 'creditflow-demo',
      version: 2,
      storage: createJSONStorage(() => zustandSyncStorage),
      /** v1 stored a single `activeLoan`; v2 keeps an array of products. */
      migrate: (persisted) => {
        const previous = (persisted ?? {}) as Partial<AppPersistedState> & {
          activeLoan?: Record<string, unknown> | null
        }
        const legacy = previous.activeLoan
        const loans: ActiveLoan[] =
          previous.loans ??
          (legacy
            ? [
                {
                  ...(legacy as unknown as ActiveLoan),
                  productId: 'personal' as const,
                  productName: 'Personal Loan',
                  totalInterest: 0,
                  closed: false,
                },
              ]
            : [])

        return {
          ...initialPersisted,
          ...previous,
          loans,
          application: previous.application ?? DEFAULT_APPLICATION,
          tickets: previous.tickets ?? [],
          chat: previous.chat ?? [],
          creditScore: previous.creditScore ?? DEFAULT_CREDIT_SCORE,
          coins: previous.coins ?? 0,
          coinLedger: previous.coinLedger ?? [],
          redeemed: previous.redeemed ?? [],
          pendingQuote: null,
        }
      },
      partialize: (state) => ({
        onboardingSeen: state.onboardingSeen,
        isAuthenticated: state.isAuthenticated,
        mobileNumber: state.mobileNumber,
        currentStep: state.currentStep,
        profile: state.profile,
        pan: state.pan,
        address: state.address,
        bank: state.bank,
        consent: state.consent,
        credit: state.credit,
        creditScore: state.creditScore,
        loans: state.loans,
        application: state.application,
        pendingQuote: state.pendingQuote,
        transactions: state.transactions,
        tickets: state.tickets,
        chat: state.chat,
        coins: state.coins,
        coinLedger: state.coinLedger,
        redeemed: state.redeemed,
      }),
    },
  ),
)
