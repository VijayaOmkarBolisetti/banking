import { simulateDelay } from './delay'

export interface TicketDraft {
  subject: string
  category: string
  message: string
  email: string
}

export interface TicketResult {
  success: boolean
  message: string
  draft: TicketDraft
}

/** Walkthrough build: tickets always submit, with blanks filled in. */
export const supportService = {
  async submit(draft: TicketDraft): Promise<TicketResult> {
    await simulateDelay(900)
    return {
      success: true,
      message: 'Ticket raised — we reply within one business day',
      draft: {
        subject: draft.subject.trim() || 'Question about my loan',
        category: draft.category || 'Something else',
        message: draft.message.trim() || 'Raised from the CreditFlow app.',
        email: draft.email.trim() || 'vijay.sharma@email.com',
      },
    }
  },
}
