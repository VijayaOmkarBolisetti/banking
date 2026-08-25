import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { LoanProductId, ProductConfig } from '../types'
import { zustandSyncStorage } from '../lib/storage'
import { LOAN_PRODUCTS } from '../lib/loanProducts'

export type ProductRates = Record<LoanProductId, number>

export const DEFAULT_PRODUCT_RATES: ProductRates = LOAN_PRODUCTS.reduce((acc, product) => {
  acc[product.id] = product.interestRate
  return acc
}, {} as ProductRates)

export const DEFAULT_PRODUCT_CONFIG: ProductConfig = {
  creditLimit: 500000,
  minAmount: 5000,
  maxAmount: 500000,
  defaultAmount: 100000,
  amountStep: 5000,
  interestRate: 14.5,
  processingFeePercent: 2,
  minProcessingFee: 499,
  gstPercent: 18,
  tenures: [3, 6, 12, 24, 36],
  defaultTenure: 12,
  firstDueDate: '2026-09-05',
}

interface ConfigStore extends ProductConfig {
  productRates: ProductRates
  updateConfig: (patch: Partial<ProductConfig>) => void
  setProductRate: (id: LoanProductId, rate: number) => void
  resetConfig: () => void
}

export const useConfigStore = create<ConfigStore>()(
  persist(
    (set) => ({
      ...DEFAULT_PRODUCT_CONFIG,
      productRates: DEFAULT_PRODUCT_RATES,
      updateConfig: (patch) => set((state) => ({ ...state, ...patch })),
      setProductRate: (id, rate) =>
        set((state) => ({ productRates: { ...state.productRates, [id]: rate } })),
      resetConfig: () =>
        set({ ...DEFAULT_PRODUCT_CONFIG, productRates: { ...DEFAULT_PRODUCT_RATES } }),
    }),
    {
      name: 'creditflow-config',
      version: 2,
      storage: createJSONStorage(() => zustandSyncStorage),
      migrate: (persisted) => ({
        ...DEFAULT_PRODUCT_CONFIG,
        ...(persisted as Partial<ConfigStore>),
        productRates: {
          ...DEFAULT_PRODUCT_RATES,
          ...((persisted as Partial<ConfigStore>)?.productRates ?? {}),
        },
      }),
      partialize: (state) => ({
        creditLimit: state.creditLimit,
        minAmount: state.minAmount,
        maxAmount: state.maxAmount,
        defaultAmount: state.defaultAmount,
        amountStep: state.amountStep,
        interestRate: state.interestRate,
        processingFeePercent: state.processingFeePercent,
        minProcessingFee: state.minProcessingFee,
        gstPercent: state.gstPercent,
        tenures: state.tenures,
        defaultTenure: state.defaultTenure,
        firstDueDate: state.firstDueDate,
        productRates: state.productRates,
      }),
    },
  ),
)

export function getProductConfig(): ProductConfig {
  const state = useConfigStore.getState()
  return {
    creditLimit: state.creditLimit,
    minAmount: state.minAmount,
    maxAmount: state.maxAmount,
    defaultAmount: state.defaultAmount,
    amountStep: state.amountStep,
    interestRate: state.interestRate,
    processingFeePercent: state.processingFeePercent,
    minProcessingFee: state.minProcessingFee,
    gstPercent: state.gstPercent,
    tenures: state.tenures,
    defaultTenure: state.defaultTenure,
    firstDueDate: state.firstDueDate,
  }
}

/** Admin-tuned rate for a product, falling back to its published rate. */
export function getRateFor(id: LoanProductId): number {
  return useConfigStore.getState().productRates[id] ?? DEFAULT_PRODUCT_RATES[id]
}
