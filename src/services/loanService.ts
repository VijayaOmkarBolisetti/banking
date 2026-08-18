import type { ActiveLoan, LoanQuote } from '../types'
import { buildRepaymentSchedule, calculateLoan } from '../lib/loanCalculator'
import { getProductConfig } from '../store/useConfigStore'
import { todayIso } from '../lib/format'
import { createId, simulateDelay } from './delay'

export const loanService = {
  getQuote(amount: number, tenure: number): LoanQuote {
    return calculateLoan(amount, tenure)
  },

  async submitApplication(quote: LoanQuote): Promise<{ success: boolean; message: string }> {
    const { minAmount, maxAmount } = getProductConfig()
    if (quote.amount < minAmount) {
      return { success: false, message: `Requested amount is below ₹${minAmount.toLocaleString('en-IN')}` }
    }
    if (quote.amount > maxAmount) {
      return { success: false, message: `Requested amount is above ₹${maxAmount.toLocaleString('en-IN')}` }
    }
    await simulateDelay(1800)
    return { success: true, message: 'Loan request accepted' }
  },

  createLoan(quote: LoanQuote, startDate = todayIso()): ActiveLoan {
    const { firstDueDate } = getProductConfig()
    return {
      id: createId('loan'),
      amount: quote.amount,
      netAmount: quote.netAmount,
      tenure: quote.tenure,
      interestRate: quote.interestRate,
      monthlyEmi: quote.monthlyEmi,
      totalRepayment: quote.totalRepayment,
      processingFee: quote.processingFee,
      gst: quote.gst,
      firstDueDate,
      startDate,
      emis: buildRepaymentSchedule(quote, firstDueDate),
    }
  },
}