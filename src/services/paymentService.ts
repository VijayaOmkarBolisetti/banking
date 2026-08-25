import type { ActiveLoan, EmiInstallment, PaymentMethod, Transaction } from '../types'
import { createId, simulateDelay } from './delay'

export interface PaymentResult {
  success: boolean
  message: string
  emi?: EmiInstallment
  transaction?: Transaction
}

const METHOD_LABELS: Record<PaymentMethod, string> = {
  upi: 'UPI',
  debit_card: 'Debit Card',
  net_banking: 'Net Banking',
}

export const paymentService = {
  /** Settles one specific instalment; the store applies it and releases credit. */
  async payEmi(loan: ActiveLoan, emi: EmiInstallment, method: PaymentMethod): Promise<PaymentResult> {
    if (emi.status === 'paid') {
      return { success: false, message: 'This EMI is already paid' }
    }

    await simulateDelay(1400)

    const transaction: Transaction = {
      id: createId('txn'),
      title: `EMI ${emi.number} · ${METHOD_LABELS[method]}`,
      date: emi.dueDate,
      amount: -emi.amount,
      type: 'payment',
      status: 'success',
      loanId: loan.id,
    }

    return { success: true, message: 'Payment successful', emi, transaction }
  },
}
