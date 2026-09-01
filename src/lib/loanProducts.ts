import type { LoanProduct, LoanProductId } from '../types'
import instantPhoto from '../assets/photos/instant-loan.jpg'
import personalPhoto from '../assets/photos/personal-loan.jpg'
import homePhoto from '../assets/photos/home-loan.jpg'
import businessPhoto from '../assets/photos/business-loan.jpg'
import goldPhoto from '../assets/photos/gold-loan.jpg'

/**
 * The five products the app sells. Each one drives its own amount range,
 * tenure ladder, pricing and (optionally) an extra KYC step in the journey.
 * Instant leads the list — it is the fastest path to money and the product
 * promoted on the dashboard.
 */
export const LOAN_PRODUCTS: LoanProduct[] = [
  {
    id: 'instant',
    name: 'Instant Loan',
    shortName: 'Instant',
    tagline: 'Cash in 60 seconds, zero paperwork',
    description:
      'Small-ticket credit straight to your bank account. Approved on your existing KYC — no documents, no review queue.',
    icon: 'zap',
    gradient: 'from-[#8b5cf6] to-[#d946ef]',
    accent: '#8b5cf6',
    accentTo: '#d946ef',
    photo: instantPhoto,
    minAmount: 5_000,
    maxAmount: 100_000,
    defaultAmount: 25_000,
    amountStep: 1_000,
    tenures: [1, 2, 3, 6],
    defaultTenure: 3,
    interestRate: 22,
    processingFeePercent: 2.5,
    minProcessingFee: 199,
    extraStep: null,
    highlights: ['Disbursed in 60 seconds', 'No documents needed', 'Repay in 1–6 months'],
    documents: ['Nothing — your KYC is already verified'],
    disbursalSla: '60 seconds',
    secured: false,
    skipReview: true,
    featured: true,
  },
  {
    id: 'personal',
    name: 'Personal Loan',
    shortName: 'Personal',
    tagline: 'Money in minutes, no collateral',
    description:
      'Instant unsecured credit for weddings, travel, medical bills or anything else life throws at you.',
    icon: 'wallet',
    gradient: 'from-[#4c6fff] to-[#1e3a8a]',
    accent: '#4c6fff',
    accentTo: '#1e3a8a',
    photo: personalPhoto,
    minAmount: 5_000,
    maxAmount: 500_000,
    defaultAmount: 100_000,
    amountStep: 5_000,
    tenures: [3, 6, 12, 24, 36],
    defaultTenure: 12,
    interestRate: 14.5,
    processingFeePercent: 2,
    minProcessingFee: 499,
    extraStep: null,
    highlights: ['No collateral needed', 'Disbursal in 5 minutes', 'Foreclose free after 6 EMIs'],
    documents: ['PAN card', 'Aadhaar', 'Last 3 salary slips'],
    disbursalSla: '5 minutes',
    secured: false,
  },
  {
    id: 'home',
    name: 'Home Loan',
    shortName: 'Home',
    tagline: 'Lowest rates, up to 30 years',
    description:
      'Finance up to 80% of your property value with the longest tenure and the lowest interest rate we offer.',
    icon: 'home',
    gradient: 'from-[#0ea5e9] to-[#0c4a6e]',
    accent: '#0ea5e9',
    accentTo: '#0c4a6e',
    photo: homePhoto,
    minAmount: 500_000,
    maxAmount: 10_000_000,
    defaultAmount: 3_500_000,
    amountStep: 100_000,
    tenures: [60, 120, 180, 240, 300, 360],
    defaultTenure: 240,
    interestRate: 8.4,
    processingFeePercent: 0.5,
    minProcessingFee: 5_000,
    extraStep: 'property',
    highlights: ['Our lowest rate', 'Tenure up to 30 years', 'Tax benefits under 80C & 24(b)'],
    documents: ['PAN & Aadhaar', 'Sale agreement', 'Income proof (2 years)', 'Property papers'],
    disbursalSla: '7 working days',
    secured: true,
  },
  {
    id: 'business',
    name: 'Business Loan',
    shortName: 'Business',
    tagline: 'Working capital without the paperwork',
    description:
      'Unsecured funding sized to your turnover — cover inventory, payroll or expansion and repay as revenue lands.',
    icon: 'briefcase',
    gradient: 'from-[#0d9488] to-[#134e4a]',
    accent: '#0d9488',
    accentTo: '#134e4a',
    photo: businessPhoto,
    minAmount: 50_000,
    maxAmount: 5_000_000,
    defaultAmount: 1_000_000,
    amountStep: 50_000,
    tenures: [12, 24, 36, 48, 60],
    defaultTenure: 36,
    interestRate: 16,
    processingFeePercent: 2.5,
    minProcessingFee: 2_500,
    extraStep: 'business',
    highlights: ['GST-based approval', 'No collateral up to ₹25L', 'Flexible part-prepayment'],
    documents: ['GST returns (12 months)', 'Bank statement (6 months)', 'ITR (2 years)'],
    disbursalSla: '48 hours',
    secured: false,
  },
  {
    id: 'gold',
    name: 'Gold & Vehicle Loan',
    shortName: 'Gold',
    tagline: 'Unlock the value you already own',
    description:
      'Pledge gold jewellery or your vehicle and borrow against it at a secured rate, with same-day valuation.',
    icon: 'gem',
    gradient: 'from-[#f59e0b] to-[#92400e]',
    accent: '#f59e0b',
    accentTo: '#92400e',
    photo: goldPhoto,
    minAmount: 10_000,
    maxAmount: 2_000_000,
    defaultAmount: 250_000,
    amountStep: 10_000,
    tenures: [6, 12, 18, 24, 36],
    defaultTenure: 12,
    interestRate: 10.5,
    processingFeePercent: 1,
    minProcessingFee: 750,
    extraStep: 'collateral',
    highlights: ['Secured, so a lower rate', 'Free doorstep valuation', 'Insured vault storage'],
    documents: ['PAN & Aadhaar', 'Ownership proof', 'Vehicle RC (for vehicle loans)'],
    disbursalSla: 'Same day',
    secured: true,
  },
]

const BY_ID = new Map<LoanProductId, LoanProduct>(LOAN_PRODUCTS.map((item) => [item.id, item]))

/** Unknown ids fall back to Personal — the safest general-purpose product. */
const FALLBACK_PRODUCT = BY_ID.get('personal') ?? LOAN_PRODUCTS[0]

export function getProduct(id: LoanProductId | null | undefined): LoanProduct {
  return (id ? BY_ID.get(id) : undefined) ?? FALLBACK_PRODUCT
}

export function isLoanProductId(value: string | undefined): value is LoanProductId {
  return value != null && BY_ID.has(value as LoanProductId)
}

/** The product promoted as the dashboard's one-tap CTA. */
export const FEATURED_PRODUCT = LOAN_PRODUCTS.find((item) => item.featured) ?? LOAN_PRODUCTS[0]

/** "20 years" reads better than "240 months" once a tenure passes two years. */
export function formatTenure(months: number): string {
  if (months < 24) return `${months} months`
  const years = months / 12
  const label = Number.isInteger(years) ? String(years) : years.toFixed(1)
  return `${label} years`
}

export function tenureShortLabel(months: number): string {
  if (months < 24) return `${months}m`
  const years = months / 12
  return Number.isInteger(years) ? `${years}y` : `${years.toFixed(1)}y`
}

/** Inline background for surfaces tinted with a product's colour. */
export function productGradient(product: LoanProduct, angle = '135deg'): string {
  return `linear-gradient(${angle}, ${product.accent}, ${product.accentTo})`
}
