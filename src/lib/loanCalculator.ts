import type { EmiInstallment, LoanProduct, LoanProductId, LoanQuote } from '../types'
import { addMonths } from './format'
import { getProduct } from './loanProducts'
import { getProductConfig } from '../store/useConfigStore'

export interface QuoteOverrides {
  /** Annual interest rate; falls back to the product's published rate. */
  interestRate?: number
  gstPercent?: number
}

export function clampAmount(amount: number, product: LoanProduct): number {
  const step = product.amountStep || 1000
  const rounded = Math.round(amount / step) * step
  return Math.min(product.maxAmount, Math.max(product.minAmount, rounded))
}

/**
 * Standard reducing-balance EMI:
 *
 *   EMI = P · r · (1+r)^n / ((1+r)^n − 1)
 *
 * where r is the monthly rate and n the tenure in months. This is what a
 * lender actually charges, so the rate shown on screen reconciles with the
 * EMI and the total repayment.
 */
export function monthlyEmi(principal: number, annualRatePercent: number, tenureMonths: number): number {
  if (tenureMonths <= 0) return 0
  const r = annualRatePercent / 100 / 12
  if (r <= 0) return Math.round(principal / tenureMonths)
  const growth = Math.pow(1 + r, tenureMonths)
  return Math.round((principal * r * growth) / (growth - 1))
}

export function calculateLoan(
  productId: LoanProductId,
  amount: number,
  tenureMonths: number,
  overrides: QuoteOverrides = {},
): LoanQuote {
  const product = getProduct(productId)
  const config = getProductConfig()

  const safeAmount = clampAmount(amount, product)
  const tenure = product.tenures.includes(tenureMonths) ? tenureMonths : product.defaultTenure
  const interestRate = overrides.interestRate ?? product.interestRate
  const gstRate = (overrides.gstPercent ?? config.gstPercent) / 100

  const processingFee = Math.max(
    product.minProcessingFee,
    Math.round(safeAmount * (product.processingFeePercent / 100)),
  )
  const gst = Math.round(processingFee * gstRate)
  const netAmount = safeAmount - processingFee - gst

  const emi = monthlyEmi(safeAmount, interestRate, tenure)
  const totalRepayment = emi * tenure
  const totalInterest = totalRepayment - safeAmount

  return {
    productId: product.id,
    amount: safeAmount,
    tenure,
    processingFee,
    gst,
    netAmount,
    interestRate,
    monthlyEmi: emi,
    totalInterest,
    totalRepayment,
  }
}

export function buildRepaymentSchedule(
  quote: LoanQuote,
  firstDueDate = getProductConfig().firstDueDate,
): EmiInstallment[] {
  return Array.from({ length: quote.tenure }, (_, index) => ({
    id: `emi-${index + 1}`,
    number: index + 1,
    dueDate: addMonths(firstDueDate, index),
    amount: quote.monthlyEmi,
    status: 'upcoming' as const,
  }))
}

/**
 * Per-instalment interest/principal split, used by the amortisation view.
 * The final row absorbs any rounding drift so the balance lands exactly on 0.
 */
export interface AmortisationRow {
  number: number
  dueDate: string
  emi: number
  principal: number
  interest: number
  balance: number
}

export function buildAmortisation(quote: LoanQuote, firstDueDate: string): AmortisationRow[] {
  const r = quote.interestRate / 100 / 12
  let balance = quote.amount
  const rows: AmortisationRow[] = []

  for (let index = 0; index < quote.tenure; index += 1) {
    const interest = Math.round(balance * r)
    const last = index === quote.tenure - 1
    const principal = last ? balance : Math.max(0, quote.monthlyEmi - interest)
    const emi = last ? principal + interest : quote.monthlyEmi
    balance = Math.max(0, balance - principal)
    rows.push({
      number: index + 1,
      dueDate: addMonths(firstDueDate, index),
      emi,
      principal,
      interest,
      balance,
    })
  }

  return rows
}

export function utilizationPercent(used: number, limit: number): number {
  if (limit <= 0) return 0
  return Math.min(100, Math.round((used / limit) * 100))
}

export function repaymentProgress(paidCount: number, total: number): number {
  if (total <= 0) return 0
  return Math.min(100, Math.round((paidCount / total) * 100))
}

/** Rough affordability guide: EMIs should stay under ~50% of monthly income. */
export function affordabilityRatio(emi: number, monthlyIncome: number): number {
  if (monthlyIncome <= 0) return 0
  return Math.round((emi / monthlyIncome) * 100)
}
