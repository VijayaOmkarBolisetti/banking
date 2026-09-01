import type { ActiveLoan, LoanProductId, LoanQuote } from '../types'
import { buildRepaymentSchedule, calculateLoan } from '../lib/loanCalculator'
import { getProduct } from '../lib/loanProducts'
import { getProductConfig, getRateFor } from '../store/useConfigStore'
import { todayIso } from '../lib/format'
import { createId, simulateDelay } from './delay'

export const loanService = {
  /** Quote using the admin-tuned rate for that product. */
  getQuote(productId: LoanProductId, amount: number, tenure: number): LoanQuote {
    return calculateLoan(productId, amount, tenure, { interestRate: getRateFor(productId) })
  },

  async submitApplication(quote: LoanQuote): Promise<{ success: boolean; message: string }> {
    const product = getProduct(quote.productId)

    if (quote.amount < product.minAmount) {
      return {
        success: false,
        message: `${product.name} starts at ₹${product.minAmount.toLocaleString('en-IN')}`,
      }
    }
    if (quote.amount > product.maxAmount) {
      return {
        success: false,
        message: `${product.name} is capped at ₹${product.maxAmount.toLocaleString('en-IN')}`,
      }
    }

    // Secured products take longer to underwrite — reflected in the wait.
    await simulateDelay(product.secured ? 2200 : 1600)
    return { success: true, message: `${product.name} approved` }
  },

  createLoan(quote: LoanQuote, startDate = todayIso()): ActiveLoan {
    const { firstDueDate } = getProductConfig()
    const product = getProduct(quote.productId)

    return {
      id: createId('loan'),
      productId: product.id,
      productName: product.name,
      amount: quote.amount,
      netAmount: quote.netAmount,
      tenure: quote.tenure,
      interestRate: quote.interestRate,
      monthlyEmi: quote.monthlyEmi,
      totalRepayment: quote.totalRepayment,
      totalInterest: quote.totalInterest,
      processingFee: quote.processingFee,
      gst: quote.gst,
      firstDueDate,
      startDate,
      emis: buildRepaymentSchedule(quote, firstDueDate),
      closed: false,
    }
  },
}
