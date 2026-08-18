import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type {
  ActiveLoan,
  AddressDetails,
  AppPersistedState,
  BankDetails,
  ConsentState,
  CreditAccount,
  LoanQuote,
  OnboardingStep,
  PanDetails,
  PermissionStatus,
  ToastMessage,
  Transaction,
  UserProfile,
} from '../types'
import { zustandSyncStorage } from '../lib/storage'
import {
  DEFAULT_ADDRESS,
  DEFAULT_BANK,
  DEFAULT_CONSENT,
  DEFAULT_CREDIT,
  DEFAULT_PAN,
  DEFAULT_PROFILE,
  DEMO_MOBILE,
  DEMO_USER_NAME,
  SAMPLE_TRANSACTIONS,
} from '../mock/data'
import { loanService } from '../services/loanService'
import { calculateLoan } from '../lib/loanCalculator'
import { getProductConfig } from './useConfigStore'
import { logOperation } from './useAdminStore'
import { todayIso } from '../lib/format'

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
  setPendingQuote: (quote: LoanQuote | null) => void
  activateLoan: (loan: ActiveLoan) => void
  updateLoan: (loan: ActiveLoan) => void
  addTransaction: (transaction: Transaction) => void
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
  activeLoan: null,
  pendingQuote: null,
  transactions: [],
}

function presentationSeed(): Partial<AppPersistedState> {
  const config = getProductConfig()
  const quote = calculateLoan(config.defaultAmount, config.defaultTenure, config)
  const loan = loanService.createLoan(quote)
  return {
    onboardingSeen: true,
    isAuthenticated: true,
    mobileNumber: DEMO_MOBILE,
    currentStep: 'complete',
    profile: {
      fullName: DEMO_USER_NAME,
      dateOfBirth: '1996-04-12',
      gender: 'male',
      email: 'vijay.sharma@email.com',
      employmentType: 'salaried',
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
      residentialStatus: 'rented',
    },
    bank: {
      accountHolderName: DEMO_USER_NAME,
      bankName: 'HDFC Bank',
      accountNumber: '501001234567',
      ifscCode: 'HDFC0001234',
      verified: true,
    },
    consent: {
      notifications: 'granted',
      location: 'granted',
      camera: 'granted',
      termsAccepted: true,
    },
    credit: {
      limit: config.creditLimit,
      used: Math.min(10000, config.creditLimit),
      available: Math.max(0, config.creditLimit - Math.min(10000, config.creditLimit)),
      interestRate: config.interestRate,
    },
    activeLoan: loan,
    pendingQuote: quote,
    transactions: SAMPLE_TRANSACTIONS,
  }
}

function kycSeed(step: OnboardingStep): Partial<AppPersistedState> {
  const base: Partial<AppPersistedState> = {
    onboardingSeen: true,
    isAuthenticated: true,
    mobileNumber: DEMO_MOBILE,
    currentStep: step,
    profile: {
      fullName: DEMO_USER_NAME,
      dateOfBirth: '1996-04-12',
      gender: 'male',
      email: 'vijay.sharma@email.com',
      employmentType: 'salaried',
      monthlyIncome: 85000,
    },
  }

  if (step === 'login' || step === 'otp' || step === 'onboarding' || step === 'splash') {
    return {
      onboardingSeen: step !== 'onboarding' && step !== 'splash',
      isAuthenticated: false,
      mobileNumber: step === 'otp' ? DEMO_MOBILE : '',
      currentStep: step,
    }
  }

  if (step === 'profile') return { ...base, profile: DEFAULT_PROFILE }

  const withPan = {
    ...base,
    pan: {
      panNumber: 'ABCDE1234F',
      verified: true,
      holderName: DEMO_USER_NAME.toUpperCase(),
    },
  }

  if (step === 'pan') return { ...base, pan: DEFAULT_PAN }
  if (step === 'address') return withPan

  const withAddress = {
    ...withPan,
    address: {
      pinCode: '560038',
      houseNumber: '12A',
      street: 'Indiranagar 100 Feet Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      residentialStatus: 'rented' as const,
    },
  }

  if (step === 'bank') return { ...withAddress, bank: DEFAULT_BANK }

  const withBank = {
    ...withAddress,
    bank: {
      accountHolderName: DEMO_USER_NAME,
      bankName: 'HDFC Bank',
      accountNumber: '501001234567',
      ifscCode: 'HDFC0001234',
      verified: true,
    },
  }

  if (step === 'consent') return { ...withBank, consent: DEFAULT_CONSENT }
  if (step === 'eligibility' || step === 'credit_approved') {
    return {
      ...withBank,
      consent: {
        notifications: 'granted',
        location: 'granted',
        camera: 'granted',
        termsAccepted: true,
      },
      credit: step === 'credit_approved' ? DEFAULT_CREDIT : DEFAULT_CREDIT,
    }
  }

  return presentationSeed()
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...initialPersisted,
      toasts: [],

      showToast: (message, type = 'info') => {
        const id = `toast-${Date.now()}`
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
      setPendingQuote: (pendingQuote) => set({ pendingQuote }),

      activateLoan: (loan) => {
        const txnDate = todayIso()
        const disbursal: Transaction = {
          id: `txn-disbursal-${loan.id}`,
          title: 'Credit Disbursal',
          date: txnDate,
          amount: loan.netAmount,
          type: 'credit',
          status: 'success',
        }
        const fee: Transaction = {
          id: `txn-fee-${loan.id}`,
          title: 'Processing Fee',
          date: txnDate,
          amount: -loan.processingFee,
          type: 'charge',
          status: 'success',
        }
        set((state) => {
          const used = Math.min(state.credit.limit, state.credit.used + loan.amount)
          return {
            activeLoan: loan,
            pendingQuote: null,
            currentStep: 'complete',
            credit: {
              ...state.credit,
              used,
              available: state.credit.limit - used,
            },
            transactions: [disbursal, fee, ...state.transactions],
          }
        })
        logOperation('customer', 'loan', 'Loan disbursed', `₹${loan.amount.toLocaleString('en-IN')} for ${loan.tenure} months`, {
          amount: loan.netAmount,
        })
      },

      updateLoan: (activeLoan) => set({ activeLoan }),

      addTransaction: (transaction) => {
        if (transaction.type === 'payment') {
          logOperation('customer', 'payment', transaction.title, `₹${Math.abs(transaction.amount).toLocaleString('en-IN')}`, {
            amount: transaction.amount,
            status: transaction.status,
          })
        }
        set((state) => ({ transactions: [transaction, ...state.transactions] }))
      },

      logout: () => {
        logOperation('customer', 'login', 'Customer signed out', get().mobileNumber || 'session ended')
        set({
          isAuthenticated: false,
          currentStep: 'login',
        })
      },

      resetDemo: () => set({ ...initialPersisted, toasts: [] }),

      seedForDemoRoute: (step) => {
        if (step === 'dashboard' || step === 'complete') {
          set({ ...presentationSeed(), toasts: get().toasts })
          return
        }
        set({ ...initialPersisted, ...kycSeed(step), toasts: get().toasts })
      },
    }),
    {
      name: 'creditflow-demo',
      storage: createJSONStorage(() => zustandSyncStorage),
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
        activeLoan: state.activeLoan,
        pendingQuote: state.pendingQuote,
        transactions: state.transactions,
      }),
    },
  ),
)
