import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { ProductConfig } from '../types'
import { zustandSyncStorage } from '../lib/storage'

export const DEFAULT_PRODUCT_CONFIG: ProductConfig = {
  creditLimit: 50000,
  minAmount: 5000,
  maxAmount: 50000,
  defaultAmount: 20000,
  amountStep: 1000,
  interestRate: 18,
  processingFeePercent: 2.495,
  minProcessingFee: 199,
  gstPercent: 18,
  tenures: [3, 6, 9, 12],
  defaultTenure: 6,
  firstDueDate: '2026-09-05',
}

interface ConfigStore extends ProductConfig {
  updateConfig: (patch: Partial<ProductConfig>) => void
  resetConfig: () => void
}

export const useConfigStore = create<ConfigStore>()(
  persist(
    (set) => ({
      ...DEFAULT_PRODUCT_CONFIG,
      updateConfig: (patch) => set((state) => ({ ...state, ...patch })),
      resetConfig: () => set({ ...DEFAULT_PRODUCT_CONFIG }),
    }),
    {
      name: 'creditflow-config',
      storage: createJSONStorage(() => zustandSyncStorage),
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