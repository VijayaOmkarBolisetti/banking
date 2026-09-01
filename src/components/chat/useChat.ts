import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { greeting, respondTo, type BotReply, type ChatContext } from '../../lib/chatbot'
import {
  instantDisbursed,
  instantFailed,
  quoteInstant,
  startInstant,
} from '../../lib/chatLoan'
import { coinsForDisbursal } from '../../lib/rewards'
import { loanService } from '../../services/loanService'
import { selectNextEmi, useAppStore } from '../../store/useAppStore'
import type { ChatAction, ChatQuickReply } from '../../types'

/**
 * Drives the scripted assistant: appends the user turn, shows a short typing
 * pause so replies don't appear instantaneously, then appends the bot turn.
 * Quick replies can also carry an *action*, which lets the Instant Loan be
 * applied for and disbursed without leaving the conversation.
 */
export function useChat() {
  const navigate = useNavigate()
  const messages = useAppStore((state) => state.chat)
  const pushChatMessage = useAppStore((state) => state.pushChatMessage)
  const ensureGreeting = useAppStore((state) => state.ensureGreeting)
  const clearChat = useAppStore((state) => state.clearChat)
  const profile = useAppStore((state) => state.profile)
  const credit = useAppStore((state) => state.credit)
  const loans = useAppStore((state) => state.loans)
  const activateLoan = useAppStore((state) => state.activateLoan)

  const [typing, setTyping] = useState(false)
  const timerRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [])

  // Greet once, the first time the transcript is opened while empty.
  useEffect(() => {
    if (messages.length > 0) return
    const opener = greeting(profile)
    ensureGreeting({ role: 'bot', text: opener.text, quickReplies: opener.quickReplies })
  }, [messages.length, profile, ensureGreeting])

  /** Posts a bot turn after a pause proportional to its length. */
  const replyAfterPause = useCallback(
    (reply: BotReply, minimum = 380) => {
      const delay = Math.min(1100, minimum + reply.text.length * 4)
      timerRef.current = window.setTimeout(() => {
        pushChatMessage({ role: 'bot', text: reply.text, quickReplies: reply.quickReplies })
        setTyping(false)
      }, delay)
    },
    [pushChatMessage],
  )

  const send = useCallback(
    (rawText: string) => {
      const text = rawText.trim()
      if (!text || typing) return

      pushChatMessage({ role: 'user', text })
      setTyping(true)

      const context: ChatContext = {
        profile,
        credit,
        loans,
        nextEmi: selectNextEmi({ loans }),
      }
      replyAfterPause(respondTo(text, context))
    },
    [credit, loans, profile, pushChatMessage, replyAfterPause, typing],
  )

  /** Runs an in-chat action — currently the Instant Loan journey. */
  const runAction = useCallback(
    (action: ChatAction, label: string) => {
      if (typing) return
      pushChatMessage({ role: 'user', text: label })
      setTyping(true)

      if (action.kind === 'instant_start') {
        replyAfterPause(startInstant(credit.available))
        return
      }

      if (action.kind === 'instant_amount') {
        replyAfterPause(quoteInstant(action.amount))
        return
      }

      // Confirmed — actually underwrite and disburse.
      const quote = loanService.getQuote('instant', action.amount, action.tenure)
      void loanService.submitApplication(quote).then((result) => {
        if (!result.success) {
          replyAfterPause(instantFailed(result.message), 200)
          return
        }
        const loan = loanService.createLoan(quote)
        activateLoan(loan)
        replyAfterPause(instantDisbursed(loan.netAmount, coinsForDisbursal(loan.amount)), 200)
      })
    },
    [activateLoan, credit.available, pushChatMessage, replyAfterPause, typing],
  )

  const handleQuickReply = useCallback(
    (reply: ChatQuickReply) => {
      if (reply.action) {
        runAction(reply.action, reply.label)
        return
      }
      if (reply.to) {
        navigate(reply.to)
        return
      }
      send(reply.send ?? reply.label)
    },
    [navigate, runAction, send],
  )

  const reset = useCallback(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current)
    setTyping(false)
    clearChat()
  }, [clearChat])

  return { messages, typing, send, handleQuickReply, reset }
}
