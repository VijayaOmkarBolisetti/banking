import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { CollectionRules } from '../types'
import { zustandSyncStorage } from '../lib/storage'

export const DEFAULT_COLLECTION_RULES: CollectionRules = {
  gracePeriodDays: 3,
  bounceFeeFlat: 500,
  lateFeePercent: 2,
  maxPenaltyPercentOfEmi: 5,
  softReminderFromDpd: 1,
  callCentreFromDpd: 8,
  fieldAgentFromDpd: 31,
  legalNoticeFromDpd: 90,
  blockDrawFromDpd: 15,
  maxAgentVisitsPerWeek: 2,
  agentContactFromHour: 9,
  agentContactToHour: 19,
  foreclosureFeePercent: 2,
  allowPartPayment: true,
  autoChargeBounceFee: true,
}

interface RulesStore extends CollectionRules {
  updateRules: (patch: Partial<CollectionRules>) => void
  resetRules: () => void
}

export const useRulesStore = create<RulesStore>()(
  persist(
    (set) => ({
      ...DEFAULT_COLLECTION_RULES,
      updateRules: (patch) => set((state) => ({ ...state, ...patch })),
      resetRules: () => set({ ...DEFAULT_COLLECTION_RULES }),
    }),
    {
      name: 'creditflow-rules',
      version: 1,
      storage: createJSONStorage(() => zustandSyncStorage),
      migrate: (persisted) => ({
        ...DEFAULT_COLLECTION_RULES,
        ...(persisted as Partial<CollectionRules>),
      }),
      partialize: (state) => ({
        gracePeriodDays: state.gracePeriodDays,
        bounceFeeFlat: state.bounceFeeFlat,
        lateFeePercent: state.lateFeePercent,
        maxPenaltyPercentOfEmi: state.maxPenaltyPercentOfEmi,
        softReminderFromDpd: state.softReminderFromDpd,
        callCentreFromDpd: state.callCentreFromDpd,
        fieldAgentFromDpd: state.fieldAgentFromDpd,
        legalNoticeFromDpd: state.legalNoticeFromDpd,
        blockDrawFromDpd: state.blockDrawFromDpd,
        maxAgentVisitsPerWeek: state.maxAgentVisitsPerWeek,
        agentContactFromHour: state.agentContactFromHour,
        agentContactToHour: state.agentContactToHour,
        foreclosureFeePercent: state.foreclosureFeePercent,
        allowPartPayment: state.allowPartPayment,
        autoChargeBounceFee: state.autoChargeBounceFee,
      }),
    },
  ),
)

export function getCollectionRules(): CollectionRules {
  const state = useRulesStore.getState()
  return {
    gracePeriodDays: state.gracePeriodDays,
    bounceFeeFlat: state.bounceFeeFlat,
    lateFeePercent: state.lateFeePercent,
    maxPenaltyPercentOfEmi: state.maxPenaltyPercentOfEmi,
    softReminderFromDpd: state.softReminderFromDpd,
    callCentreFromDpd: state.callCentreFromDpd,
    fieldAgentFromDpd: state.fieldAgentFromDpd,
    legalNoticeFromDpd: state.legalNoticeFromDpd,
    blockDrawFromDpd: state.blockDrawFromDpd,
    maxAgentVisitsPerWeek: state.maxAgentVisitsPerWeek,
    agentContactFromHour: state.agentContactFromHour,
    agentContactToHour: state.agentContactToHour,
    foreclosureFeePercent: state.foreclosureFeePercent,
    allowPartPayment: state.allowPartPayment,
    autoChargeBounceFee: state.autoChargeBounceFee,
  }
}

/** Format hour 0–23 as 9:00 AM style for customer-facing copy. */
export function formatContactHour(hour: number): string {
  const h = Math.max(0, Math.min(23, Math.floor(hour)))
  const suffix = h >= 12 ? 'PM' : 'AM'
  const twelve = h % 12 === 0 ? 12 : h % 12
  return `${twelve}:00 ${suffix}`
}
