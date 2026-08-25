import type { UserProfile } from '../types'

/**
 * CIBIL-style scoring.
 *
 * Everyone starts on the entry limit of ₹25,000. The pre-approved amount is
 * only unlocked by the score, so the number on the dashboard reflects what
 * this particular customer has earned rather than a flat headline figure.
 */

export const ENTRY_LIMIT = 25_000

export interface ScoreBand {
  id: string
  /** Inclusive lower bound of the band. */
  min: number
  label: string
  limit: number
  accent: string
  blurb: string
}

/** Ordered low → high. `limit` is the pre-approved amount that band unlocks. */
export const SCORE_BANDS: ScoreBand[] = [
  {
    id: 'poor',
    min: 300,
    label: 'Poor',
    limit: ENTRY_LIMIT,
    accent: '#dc2626',
    blurb: 'Build history with on-time EMIs to unlock more.',
  },
  {
    id: 'fair',
    min: 650,
    label: 'Fair',
    limit: 75_000,
    accent: '#f59e0b',
    blurb: 'A few more on-time payments lifts your limit again.',
  },
  {
    id: 'good',
    min: 700,
    label: 'Good',
    limit: 150_000,
    accent: '#0d9488',
    blurb: 'Most unsecured products are open to you.',
  },
  {
    id: 'very_good',
    min: 750,
    label: 'Very good',
    limit: 300_000,
    accent: '#0ea5e9',
    blurb: 'You qualify for our lower interest bands.',
  },
  {
    id: 'excellent',
    min: 800,
    label: 'Excellent',
    limit: 500_000,
    accent: '#8b5cf6',
    blurb: 'Top tier — the best rate and the highest limit.',
  },
]

export const MIN_SCORE = 300
export const MAX_SCORE = 900

export function bandFor(score: number): ScoreBand {
  return [...SCORE_BANDS].reverse().find((band) => score >= band.min) ?? SCORE_BANDS[0]
}

export function nextBandFor(score: number): ScoreBand | null {
  return SCORE_BANDS.find((band) => band.min > score) ?? null
}

/** Pre-approved amount for a score, never above the admin's ceiling. */
export function limitForScore(score: number, ceiling: number): number {
  if (!score) return Math.min(ENTRY_LIMIT, ceiling)
  return Math.min(bandFor(score).limit, ceiling)
}

/**
 * Derives a stable score from the profile — same inputs always give the same
 * number, so a walkthrough is repeatable. Income and employment carry the most
 * weight, which is roughly how real bureau models behave for thin files.
 */
export function scoreFromProfile(profile: UserProfile): number {
  let score = 640

  const income = Number(profile.monthlyIncome) || 0
  if (income >= 150_000) score += 90
  else if (income >= 100_000) score += 75
  else if (income >= 75_000) score += 60
  else if (income >= 50_000) score += 45
  else if (income >= 30_000) score += 28
  else if (income >= 15_000) score += 12

  if (profile.employmentType === 'salaried') score += 45
  else if (profile.employmentType === 'self_employed') score += 28
  else if (profile.employmentType === 'other') score += 10

  // A little age weighting — longer credit history in a real bureau file.
  const dob = new Date(`${profile.dateOfBirth}T00:00:00`)
  if (!Number.isNaN(dob.getTime())) {
    const age = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 3600 * 1000))
    if (age >= 35) score += 30
    else if (age >= 28) score += 20
    else if (age >= 23) score += 10
  }

  if (profile.email.trim()) score += 5

  return Math.max(MIN_SCORE, Math.min(MAX_SCORE, score))
}

/** Each on-time EMI nudges the score up; the band table does the rest. */
export function scoreAfterOnTimePayment(score: number): number {
  return Math.min(MAX_SCORE, score + 4)
}

/** 0–100 position of a score across the full 300–900 range, for the gauge. */
export function scorePercent(score: number): number {
  if (!score) return 0
  return Math.round(((score - MIN_SCORE) / (MAX_SCORE - MIN_SCORE)) * 100)
}
