import type { EmiInstallment, LoanQuote, ProductConfig } from '../types'
import { addMonths } from './format'
import { DEFAULT_PRODUCT_CONFIG, getProductConfig } from '../store/useConfigStore'

export const DEFAULT_AMOUNT = DEFAULT_PRODUCT_CONFIG.defaultAmount
export const DEFAULT_TENURE = DEFAULT_PRODUCT_CONFIG.defaultTenure
export const MIN_AMOUNT = DEFAULT_PRODUCT_CONFIG.minAmount
export const MAX_AMOUNT = DEFAULT_PRODUCT_CONFIG.maxAmount
export const TENURES = DEFAULT_PRODUCT_CONFIG.tenures
export const FIRST_DUE_DATE = DEFAULT_PRODUCT_CONFIG.firstDueDate
export const INTEREST_RATE = DEFAULT_PRODUCT_CONFIG.interestRate
export const AMOUNT_STEP = DEFAULT_PRODUCT_CONFIG.amountStep

const EXAMPLE_INTEREST_RATIO = 1900 / 1800

export function clampAmount(amount: number, config: ProductConfig = getProductConfig()): number {
  const step = config.amountStep || 1000
  const rounded = Math.round(amount / step) * step
  return Math.min(config.maxAmount, Math.max(config.minAmount, rounded))
}

export function calculateLoan(
  amount: number,
  tenureMonths: number,
  config: ProductConfig = getProductConfig(),
): LoanQuote {
  const safeAmount = clampAmount(amount, config)
  const tenure = config.tenures.includes(tenureMonths) ? tenureMonths : config.defaultTenure
  const feeRate = config.processingFeePercent / 100
  const gstRate = config.gstPercent / 100
  const processingFee = Math.max(config.minProcessingFee, Math.round(safeAmount * feeRate))
  const gst = Math.floor(processingFee * gstRate)
  const netAmount = safeAmount - processingFee - gst
  const totalInterest = Math.round(
    safeAmount * (config.interestRate / 100) * (tenure / 12) * EXAMPLE_INTEREST_RATIO,
  )
  const monthlyEmi = Math.round((safeAmount + totalInterest) / tenure)
  const totalRepayment = monthlyEmi * tenure

  return {
    amount: safeAmount,
    tenure,
    processingFee,
    gst,
    netAmount,
    interestRate: config.interestRate,
    monthlyEmi,
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

export function utilizationPercent(used: number, limit: number): number {
  if (limit <= 0) return 0
  return Math.min(100, Math.round((used / limit) * 100))
}

export function repaymentProgress(paidCount: number, total: number): number {
  if (total <= 0) return 0
  return Math.min(100, Math.round((paidCount / total) * 100))
}