import type { CoinReason, Reward } from '../types'

/**
 * Flow Coins — the loyalty layer.
 *
 * Coins are earned by behaviour the lender actually wants (borrowing, and
 * above all repaying on time) and spent on things that cost the customer
 * money: the processing fee, the interest rate, and EMI cashback. That keeps
 * the loop honest — every reward maps to a real rupee saving rather than a
 * points balance with nowhere to go.
 */

export const COIN_RATES = {
  /** One-time, for finishing KYC. */
  onboarding: 500,
  /** Per ₹10,000 borrowed, capped below. */
  perTenThousand: 20,
  disbursalCap: 400,
  /** Every instalment settled. */
  emiPaid: 100,
  /** Bonus when the instalment is cleared before its due date. */
  emiEarly: 150,
} as const

export const COIN_REASON_LABELS: Record<CoinReason, string> = {
  onboarding: 'KYC completed',
  disbursal: 'Loan disbursed',
  emi_paid: 'EMI paid',
  emi_early: 'Early payment bonus',
  streak: 'Repayment streak',
  referral: 'Friend referred',
  redeemed: 'Reward redeemed',
}

export const REWARDS: Reward[] = [
  {
    id: 'fee-250',
    kind: 'fee_waiver',
    title: '₹250 off processing fee',
    description: 'Applied automatically to your next loan.',
    cost: 500,
    value: 250,
    icon: 'receipt',
    accent: '#0ea5e9',
  },
  {
    id: 'cashback-500',
    kind: 'cashback',
    title: '₹500 EMI cashback',
    description: 'Credited back after your next instalment clears.',
    cost: 1_000,
    value: 500,
    icon: 'wallet',
    accent: '#0d9488',
  },
  {
    id: 'fee-full',
    kind: 'fee_waiver',
    title: 'Full processing fee waived',
    description: 'Up to ₹2,500 off the fee on your next loan.',
    cost: 2_000,
    value: 2_500,
    icon: 'receipt',
    accent: '#8b5cf6',
  },
  {
    id: 'rate-half',
    kind: 'rate_discount',
    title: '0.5% lower interest rate',
    description: 'Applies to the next loan you take, any product.',
    cost: 3_500,
    value: 0.5,
    icon: 'percent',
    accent: '#f59e0b',
  },
]

export function rewardById(id: string): Reward | undefined {
  return REWARDS.find((reward) => reward.id === id)
}

/** Coins earned for a disbursal, scaled to size but capped. */
export function coinsForDisbursal(amount: number): number {
  const earned = Math.floor(amount / 10_000) * COIN_RATES.perTenThousand
  return Math.min(COIN_RATES.disbursalCap, Math.max(COIN_RATES.perTenThousand, earned))
}

/** Coins for settling one instalment, with a bonus if it is paid early. */
export function coinsForEmi(dueDate: string, paidOn = new Date()): number {
  const due = new Date(`${dueDate}T00:00:00`)
  const early = !Number.isNaN(due.getTime()) && paidOn < due
  return COIN_RATES.emiPaid + (early ? COIN_RATES.emiEarly : 0)
}

/* ------------------------------------------------------------------ *
 * Tiers — a light progression so the balance means something
 * ------------------------------------------------------------------ */

export interface CoinTier {
  id: string
  name: string
  min: number
  perk: string
  accent: string
}

export const COIN_TIERS: CoinTier[] = [
  { id: 'bronze', name: 'Bronze', min: 0, perk: 'Standard rates', accent: '#b45309' },
  { id: 'silver', name: 'Silver', min: 1_000, perk: 'Priority support', accent: '#64748b' },
  { id: 'gold', name: 'Gold', min: 3_000, perk: 'Fee waivers unlocked', accent: '#f59e0b' },
  { id: 'platinum', name: 'Platinum', min: 6_000, perk: 'Best rate on every product', accent: '#8b5cf6' },
]

export function tierFor(coins: number): CoinTier {
  return [...COIN_TIERS].reverse().find((tier) => coins >= tier.min) ?? COIN_TIERS[0]
}

export function nextTierFor(coins: number): CoinTier | null {
  return COIN_TIERS.find((tier) => tier.min > coins) ?? null
}

/** 0–100 progress toward the next tier, or 100 at the top. */
export function tierProgress(coins: number): number {
  const current = tierFor(coins)
  const next = nextTierFor(coins)
  if (!next) return 100
  const span = next.min - current.min
  if (span <= 0) return 100
  return Math.min(100, Math.round(((coins - current.min) / span) * 100))
}
