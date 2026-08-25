import type {
  ActiveLoan,
  ChatQuickReply,
  CreditAccount,
  EmiInstallment,
  LoanProductId,
  UserProfile,
} from '../types'
import { formatDate, formatInr, firstName } from './format'
import { LOAN_PRODUCTS, formatTenure, getProduct } from './loanProducts'
import { monthlyEmi } from './loanCalculator'
import { getRateFor } from '../store/useConfigStore'
import { ROUTES } from '../navigation/routes'

export interface ChatContext {
  profile: UserProfile
  credit: CreditAccount
  loans: ActiveLoan[]
  nextEmi: (EmiInstallment & { loan: ActiveLoan }) | null
}

export interface BotReply {
  text: string
  quickReplies?: ChatQuickReply[]
}

interface Intent {
  id: string
  /** Any one phrase matching is enough; longer phrases score higher. */
  patterns: string[]
  reply: (context: ChatContext, input: string) => BotReply
}

const HOME_REPLIES: ChatQuickReply[] = [
  { label: 'My EMI', send: 'When is my EMI due?' },
  { label: 'Get money now', action: { kind: 'instant_start' } },
  { label: 'Interest rates', send: 'What are your interest rates?' },
  { label: 'Talk to a human', send: 'I want to talk to an agent' },
]

/* ------------------------------------------------------------------ *
 * Intents, most specific first
 * ------------------------------------------------------------------ */

const INTENTS: Intent[] = [
  {
    id: 'greeting',
    patterns: ['hi', 'hey', 'hello', 'good morning', 'good evening', 'namaste', 'start'],
    reply: (context) => ({
      text: `Hi ${firstName(context.profile.fullName)}! I'm Flow, your CreditFlow assistant. I can check your EMIs, compare loan products or estimate a repayment for you. What would you like to do?`,
      quickReplies: HOME_REPLIES,
    }),
  },
  {
    id: 'emi_due',
    patterns: [
      'when is my emi due',
      'emi due date',
      'next emi',
      'when do i pay',
      'my emi',
      'emi',
      'due date',
      'payment due',
      'installment',
    ],
    reply: (context) => {
      if (!context.nextEmi) {
        return {
          text: "You don't have any EMI pending right now — nothing is due. Want to look at a new loan?",
          quickReplies: [
            { label: 'Browse loans', to: ROUTES.LOAN_PRODUCTS },
            { label: 'My loans', to: ROUTES.MY_LOANS },
          ],
        }
      }
      const { amount, dueDate, number, loan } = context.nextEmi
      return {
        text: `Your next EMI of ${formatInr(amount)} for your ${loan.productName} is due on ${formatDate(dueDate)}. That's instalment ${number} of ${loan.tenure}.`,
        quickReplies: [
          { label: 'Pay now', to: ROUTES.PAY_NOW },
          { label: 'View schedule', to: ROUTES.REPAYMENT_SCHEDULE },
        ],
      }
    },
  },
  {
    id: 'balance',
    patterns: [
      'how much credit',
      'available credit',
      'my balance',
      'credit limit',
      'how much can i borrow',
      'available limit',
      'limit',
      'balance',
    ],
    reply: (context) => ({
      text: `Your credit limit is ${formatInr(context.credit.limit)}. You've used ${formatInr(context.credit.used)}, so ${formatInr(context.credit.available)} is available to draw right now.`,
      quickReplies: [
        { label: 'Get money', to: ROUTES.LOAN_PRODUCTS },
        { label: 'Credit details', to: ROUTES.CREDIT_DETAILS },
      ],
    }),
  },
  {
    id: 'my_loans',
    patterns: ['my loans', 'active loan', 'outstanding', 'how many loans', 'loan status', 'my loan'],
    reply: (context) => {
      const open = context.loans.filter((loan) => !loan.closed)
      if (open.length === 0) {
        return {
          text: 'You have no active loans at the moment. We offer five products — instant, personal, home, business and gold/vehicle. Want me to walk you through them?',
          quickReplies: [
            { label: 'Show me', to: ROUTES.LOAN_PRODUCTS },
            { label: 'I need money now', send: 'Tell me about instant loans' },
          ],
        }
      }
      const lines = open.map((loan) => {
        const paid = loan.emis.filter((emi) => emi.status === 'paid').length
        return `• ${loan.productName} — ${formatInr(loan.amount)}, ${paid}/${loan.tenure} EMIs paid`
      })
      return {
        text: `You have ${open.length} active ${open.length === 1 ? 'loan' : 'loans'}:\n${lines.join('\n')}`,
        quickReplies: [
          { label: 'View all', to: ROUTES.MY_LOANS },
          { label: 'Pay now', to: ROUTES.PAY_NOW },
        ],
      }
    },
  },
  {
    id: 'rates',
    patterns: [
      'interest rate',
      'what are your rates',
      'rate of interest',
      'roi',
      'how much interest',
      'rates',
      'interest',
    ],
    reply: () => ({
      // Rates come from the store, so admin edits show up here immediately.
      text: `Here are our current rates:\n${LOAN_PRODUCTS.map(
        (product) => `• ${product.name} — from ${getRateFor(product.id)}% p.a.`,
      ).join('\n')}\n\nSecured products carry the lowest rates because there's an asset behind them.`,
      quickReplies: [
        { label: 'Compare products', to: ROUTES.LOAN_PRODUCTS },
        { label: 'Estimate my EMI', send: 'Calculate EMI for 5 lakh over 24 months' },
      ],
    }),
  },
  {
    id: 'home_loan',
    patterns: ['home loan', 'house loan', 'property loan', 'mortgage', 'buy a house', 'buy a flat'],
    reply: () => productReply('home'),
  },
  {
    id: 'business_loan',
    patterns: ['business loan', 'working capital', 'msme', 'loan for my shop', 'company loan'],
    reply: () => productReply('business'),
  },
  {
    id: 'gold_loan',
    patterns: ['gold loan', 'vehicle loan', 'car loan', 'bike loan', 'loan against gold', 'collateral'],
    reply: () => productReply('gold'),
  },
  {
    id: 'instant_loan',
    patterns: [
      'instant loan',
      'money right now',
      'need money now',
      'urgent',
      'emergency',
      '60 seconds',
      'immediately',
      'right now',
      'instant',
    ],
    reply: () => productReply('instant'),
  },
  {
    id: 'personal_loan',
    patterns: ['personal loan', 'cash loan', 'quick loan'],
    reply: () => productReply('personal'),
  },
  {
    id: 'apply',
    patterns: [
      'i want a loan',
      'apply for a loan',
      'need money',
      'want to borrow',
      'get a loan',
      'new loan',
      'apply',
      'borrow',
    ],
    reply: () => ({
      text: 'Happy to help. We have five products:\n• Instant — ₹5K–₹1L in 60 seconds, from 22%\n• Personal — unsecured, from 14.5%\n• Home — up to 30 years, from 8.4%\n• Business — GST-based, from 16%\n• Gold & Vehicle — secured, from 10.5%\n\nWhich one fits what you need?',
      quickReplies: [
        { label: 'Instant — apply here', action: { kind: 'instant_start' as const } },
        { label: 'Personal', send: 'Tell me about personal loans' },
        { label: 'Home', send: 'Tell me about home loans' },
        { label: 'Browse all', to: ROUTES.LOAN_PRODUCTS },
      ],
    }),
  },
  {
    id: 'foreclose',
    patterns: ['prepay', 'foreclose', 'close my loan', 'pay early', 'part payment', 'preclosure'],
    reply: () => ({
      text: 'You can prepay any time. Personal loans are foreclosure-free after 6 EMIs; home and business loans carry a 2% fee on the outstanding principal if closed in the first year. Use Pay Now to clear the next instalment early.',
      quickReplies: [{ label: 'Pay now', to: ROUTES.PAY_NOW }],
    }),
  },
  {
    id: 'documents',
    patterns: ['documents', 'what do i need', 'papers', 'kyc', 'requirement', 'eligibility criteria'],
    reply: () => ({
      text: 'For most products you need your PAN, Aadhaar and recent income proof. Home loans additionally need the sale agreement and property papers; business loans need 12 months of GST returns. Your PAN and bank are already verified.',
      quickReplies: [
        { label: 'My documents', to: ROUTES.PROFILE_DOCUMENTS },
        { label: 'Browse loans', to: ROUTES.LOAN_PRODUCTS },
      ],
    }),
  },
  {
    id: 'agent',
    patterns: [
      'talk to a human',
      'talk to an agent',
      'customer care',
      'call support',
      'speak to someone',
      'contact support',
      'complaint',
      'agent',
      'human',
    ],
    reply: () => ({
      text: "Of course. Our team is on 1800‑200‑4567 (Mon–Sat, 9am–7pm) or support@creditflow.app. You can also raise a ticket and we'll reply within one business day.",
      quickReplies: [{ label: 'Contact & tickets', to: ROUTES.SUPPORT }],
    }),
  },
  {
    id: 'thanks',
    patterns: ['thanks', 'thank you', 'thx', 'great', 'awesome', 'perfect', 'ok cool'],
    reply: () => ({
      text: "Anytime! Anything else I can help with?",
      quickReplies: HOME_REPLIES,
    }),
  },
  {
    id: 'safety',
    patterns: ['is it safe', 'secure', 'data privacy', 'is this real', 'scam'],
    reply: () => ({
      text: 'This build is a demonstration app — no real money moves and nothing is sent to a server. Everything you enter stays in your own browser and you can clear it any time from Profile.',
      quickReplies: [{ label: 'Privacy policy', to: ROUTES.PROFILE_PRIVACY }],
    }),
  },
]

function productReply(id: LoanProductId): BotReply {
  const product = getProduct(id)
  return {
    text: `${product.name}: ${product.description}\n\n• Rate from ${getRateFor(product.id)}% p.a.\n• ${formatInr(product.minAmount)} to ${formatInr(product.maxAmount)}\n• Tenure up to ${formatTenure(product.tenures[product.tenures.length - 1])}\n• Disbursal in ${product.disbursalSla}`,
    quickReplies: [
      // Instant needs no extra KYC and skips the review queue, so it is the
      // one product that can be completed here inside the conversation.
      product.skipReview
        ? { label: 'Apply right here', action: { kind: 'instant_start' as const } }
        : { label: `Apply for ${product.shortName}`, to: `${ROUTES.LOAN_PRODUCTS}/${product.id}` },
      { label: 'Compare all', to: ROUTES.LOAN_PRODUCTS },
    ],
  }
}

/* ------------------------------------------------------------------ *
 * EMI calculator intent — parses "5 lakh over 24 months" style asks
 * ------------------------------------------------------------------ */

function parseAmount(input: string): number | null {
  const lakh = input.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lac|l\b)/)
  if (lakh) return Math.round(parseFloat(lakh[1]) * 100_000)
  const crore = input.match(/(\d+(?:\.\d+)?)\s*(?:crore|cr\b)/)
  if (crore) return Math.round(parseFloat(crore[1]) * 10_000_000)
  const thousand = input.match(/(\d+(?:\.\d+)?)\s*(?:thousand|k\b)/)
  if (thousand) return Math.round(parseFloat(thousand[1]) * 1_000)
  const plain = input.match(/(?:₹|rs\.?\s*)?(\d[\d,]{3,})/)
  if (plain) return Number(plain[1].replace(/,/g, ''))
  return null
}

function parseTenure(input: string): number | null {
  const years = input.match(/(\d+)\s*(?:year|yr)/)
  if (years) return Number(years[1]) * 12
  const months = input.match(/(\d+)\s*(?:month|mo\b)/)
  if (months) return Number(months[1])
  return null
}

function calculatorReply(input: string): BotReply | null {
  if (!/(calculat|emi for|how much.*(emi|month)|estimate)/.test(input)) return null
  const amount = parseAmount(input)
  if (!amount) {
    return {
      text: 'Sure — tell me the amount and tenure, for example "EMI for 5 lakh over 24 months".',
    }
  }
  const tenure = parseTenure(input) ?? 12
  // Pick the product whose range best fits the amount.
  const product =
    LOAN_PRODUCTS.find((item) => amount >= item.minAmount && amount <= item.maxAmount) ?? LOAN_PRODUCTS[0]
  const rate = getRateFor(product.id)
  const emi = monthlyEmi(amount, rate, tenure)
  const total = emi * tenure
  return {
    text: `For ${formatInr(amount)} over ${formatTenure(tenure)} at ${rate}% p.a. (${product.name} rate):\n\n• Monthly EMI — ${formatInr(emi)}\n• Total repayment — ${formatInr(total)}\n• Total interest — ${formatInr(total - amount)}`,
    quickReplies: [
      { label: `Apply for ${product.shortName}`, to: `${ROUTES.LOAN_PRODUCTS}/${product.id}` },
      { label: 'Compare products', to: ROUTES.LOAN_PRODUCTS },
    ],
  }
}

/* ------------------------------------------------------------------ *
 * Matching
 * ------------------------------------------------------------------ */

/**
 * Scores every intent by its longest matching phrase, so "home loan" beats
 * the bare "loan" keyword. Returns a fallback when nothing clears the bar.
 */
export function respondTo(rawInput: string, context: ChatContext): BotReply {
  const input = rawInput.toLowerCase().trim()
  if (!input) {
    return { text: 'Ask me anything about your loans or our products.', quickReplies: HOME_REPLIES }
  }

  const calculated = calculatorReply(input)
  if (calculated) return calculated

  let best: { intent: Intent; score: number } | null = null
  for (const intent of INTENTS) {
    for (const pattern of intent.patterns) {
      if (!input.includes(pattern)) continue
      // Word-boundary check keeps "l" or "emi" from matching inside other words.
      const boundary = new RegExp(`(^|\\W)${escapeRegex(pattern)}($|\\W)`).test(input)
      const score = pattern.length + (boundary ? 10 : 0)
      if (!best || score > best.score) best = { intent, score }
    }
  }

  if (!best) {
    return {
      text: "I didn't quite catch that. I can help with EMI dates, credit limits, our four loan products, prepayment rules or connecting you to an agent.",
      quickReplies: HOME_REPLIES,
    }
  }

  return best.intent.reply(context, input)
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function greeting(profile: UserProfile): BotReply {
  return {
    text: `Hi ${firstName(profile.fullName)} 👋 I'm Flow, your CreditFlow assistant. Ask me about your EMIs, our loan products, or anything else.`,
    quickReplies: HOME_REPLIES,
  }
}
