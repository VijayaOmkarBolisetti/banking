import type { ActiveLoan, PaymentMethod, Transaction } from '../types'
import { createId, simulateDelay } from './delay'

export interface PaymentResult {
  success: boolean
  message: string
  loan?: ActiveLoan
  transaction?: Transaction
}

export const paymentService = {
  async payNextEmi(loan: ActiveLoan, method: PaymentMethod): Promise<PaymentResult> {
    const next = loan.emis.find((emi) => emi.status === 'upcoming' || emi.status === 'overdue')
    if (!next) {
      return { success: false, message: 'No EMI is due right now' }
    }

    await simulateDelay(1400)

    const updatedEmis = loan.emis.map((emi) =>
      emi.id === next.id ? { ...emi, status: 'paid' as const } : emi,
    )

    const methodLabel =
      method === 'upi' ? 'UPI' : method === 'debit_card' ? 'Debit Card' : 'Net Banking'

    const transaction: Transaction = {
      id: createId('txn'),
      title: `EMI Payment · ${methodLabel}`,
      date: next.dueDate,
      amount: -next.amount,
      type: 'payment',
      status: 'success',
    }

    return {
      success: true,
      message: 'Payment successful',
      loan: { ...loan, emis: updatedEmis },
      transaction,
    }
  },
}
