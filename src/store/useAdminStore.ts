import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Operation, OperationActor, OperationType, TransactionStatus } from '../types'
import { zustandSyncStorage } from '../lib/storage'
import { createId } from '../services/delay'

export const ADMIN_CREDENTIALS = {
  email: 'admin@creditflow.app',
  password: 'Admin@123',
}

interface AdminStore {
  isAdminAuthenticated: boolean
  adminEmail: string
  operations: Operation[]
  login: (email: string, password: string) => { success: boolean; message: string }
  logout: () => void
  logOperation: (entry: Omit<Operation, 'id' | 'at'> & { at?: string }) => void
}

const seedOperations: Operation[] = [
  {
    id: 'op-seed-1',
    at: '2026-08-18T06:40:00.000Z',
    actor: 'admin',
    type: 'settings',
    title: 'Product live',
    detail: 'Default credit limit ₹50,000 · EMI 3–12 months',
    status: 'success',
  },
]

export const useAdminStore = create<AdminStore>()(
  persist(
    (set) => ({
      isAdminAuthenticated: false,
      adminEmail: '',
      operations: seedOperations,

      login: (email, password) => {
        const valid =
          email.trim().toLowerCase() === ADMIN_CREDENTIALS.email &&
          password === ADMIN_CREDENTIALS.password
        if (!valid) {
          return { success: false, message: 'Invalid email or password' }
        }
        set({ isAdminAuthenticated: true, adminEmail: ADMIN_CREDENTIALS.email })
        return { success: true, message: 'Welcome back' }
      },

      logout: () => set({ isAdminAuthenticated: false, adminEmail: '' }),

      logOperation: (entry) => {
        const operation: Operation = {
          id: createId('op'),
          at: entry.at ?? new Date().toISOString(),
          actor: entry.actor,
          type: entry.type,
          title: entry.title,
          detail: entry.detail,
          amount: entry.amount,
          status: entry.status,
        }
        set((state) => ({ operations: [operation, ...state.operations].slice(0, 200) }))
      },
    }),
    {
      name: 'creditflow-admin',
      storage: createJSONStorage(() => zustandSyncStorage),
      partialize: (state) => ({
        isAdminAuthenticated: state.isAdminAuthenticated,
        adminEmail: state.adminEmail,
        operations: state.operations,
      }),
    },
  ),
)

export function logOperation(
  actor: OperationActor,
  type: OperationType,
  title: string,
  detail: string,
  extra?: { amount?: number; status?: TransactionStatus },
) {
  useAdminStore.getState().logOperation({
    actor,
    type,
    title,
    detail,
    amount: extra?.amount,
    status: extra?.status ?? 'success',
  })
}