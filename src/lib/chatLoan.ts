import type { BotReply } from './chatbot'
import { formatInr } from './format'
import { formatTenure, getProduct } from './loanProducts'
import { loanService } from '../services/loanService'
import { ROUTES } from '../navigation/routes'

/**
 * The in-chat instant loan flow.
 *
 * Instant is the one product with no extra KYC step and no review queue, so it
 * is the only one that can honestly be completed inside a conversation. Each
 * step returns a normal bot reply plus quick replies carrying the next action,
 * which keeps the whole thing stateless — the transcript *is* the state.
 */

const INSTANT = getProduct('instant')

/** Offer amounts, clipped to what the customer's limit actually allows. */
export function instantAmountOptions(available: number): number[] {
  const ceiling = Math.min(INSTANT.maxAmount, available)
  return [10_000, 25_000, 50_000, 100_000].filter(
    (amount) => amount >= INSTANT.minAmount && amount <= ceiling,
  )
}

export function startInstant(available: number): BotReply {
  const options = instantAmountOptions(available)

  if (options.length === 0) {
    return {
      text: `Your available credit is ${formatInr(available)}, which is below the ${formatInr(
        INSTANT.minAmount,
      )} minimum for an Instant Loan. Clearing an EMI frees up your limit.`,
      quickReplies: [
        { label: 'Pay an EMI', to: ROUTES.PAY_NOW },
        { label: 'Other products', to: ROUTES.LOAN_PRODUCTS },
      ],
    }
  }

  return {
    text: `Let's do it — no documents, straight to your bank account.\n\nYou have ${formatInr(
      available,
    )} available. How much do you need?`,
    quickReplies: options.map((amount) => ({
      label: formatInr(amount),
      action: { kind: 'instant_amount', amount } as const,
    })),
  }
}

export function quoteInstant(amount: number): BotReply {
  const tenure = INSTANT.defaultTenure
  const quote = loanService.getQuote('instant', amount, tenure)

  return {
    text: `${formatInr(quote.amount)} over ${formatTenure(quote.tenure)} at ${
      quote.interestRate
    }% p.a.\n\n• You receive — ${formatInr(quote.netAmount)}\n• Monthly EMI — ${formatInr(
      quote.monthlyEmi,
    )}\n• Total repayment — ${formatInr(quote.totalRepayment)}\n\nConfirming accepts the Instant Loan agreement.`,
    quickReplies: [
      {
        label: `Confirm ${formatInr(quote.netAmount)}`,
        action: { kind: 'instant_confirm', amount: quote.amount, tenure: quote.tenure } as const,
      },
      { label: 'Change amount', action: { kind: 'instant_start' } as const },
    ],
  }
}

export function instantDisbursed(netAmount: number, coins: number): BotReply {
  return {
    text: `Done — ${formatInr(
      netAmount,
    )} is on its way to your linked account. 🎉\n\nYou earned ${coins} Flow Coins on this disbursal.`,
    quickReplies: [
      { label: 'View schedule', to: ROUTES.REPAYMENT_SCHEDULE },
      { label: 'My loans', to: ROUTES.MY_LOANS },
      { label: 'My coins', to: ROUTES.REWARDS },
    ],
  }
}

export function instantFailed(message: string): BotReply {
  return {
    text: `I couldn't complete that: ${message}`,
    quickReplies: [
      { label: 'Try again', action: { kind: 'instant_start' } as const },
      { label: 'Talk to an agent', to: ROUTES.SUPPORT },
    ],
  }
}
