import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Screen } from '../components/layout/Screen'
import { ProcessingLoader } from '../components/ui/ProcessingLoader'
import { useTimedSteps } from '../hooks/useTimedSteps'
import { calculateLoan } from '../lib/loanCalculator'
import { loanService } from '../services/loanService'
import { ROUTES } from '../navigation/routes'
import { useAppStore } from '../store/useAppStore'
import { useConfigStore } from '../store/useConfigStore'

const LABELS = ['Validating request', 'Preparing agreement', 'Finalizing disbursal']

export function LoanProcessingScreen() {
  const navigate = useNavigate()
  const pendingQuote = useAppStore((state) => state.pendingQuote)
  const activateLoan = useAppStore((state) => state.activateLoan)
  const showToast = useAppStore((state) => state.showToast)
  const defaultAmount = useConfigStore((state) => state.defaultAmount)
  const defaultTenure = useConfigStore((state) => state.defaultTenure)
  const { steps, done } = useTimedSteps(LABELS, 800)

  useEffect(() => {
    if (!done) return undefined
    const quote = pendingQuote ?? calculateLoan(defaultAmount, defaultTenure)
    let cancelled = false
    void loanService.submitApplication(quote).then((result) => {
      if (cancelled) return
      if (!result.success) {
        showToast(result.message, 'error')
        navigate(ROUTES.LOAN_REVIEW)
        return
      }
      activateLoan(loanService.createLoan(quote))
      navigate(ROUTES.LOAN_SUCCESS, { replace: true })
    })
    return () => {
      cancelled = true
    }
  }, [activateLoan, defaultAmount, defaultTenure, done, navigate, pendingQuote, showToast])

  return (
    <Screen>
      <ProcessingLoader
        steps={steps}
        done={done}
        title="Processing your request"
        subtitle="We are preparing your credit disbursal."
      />
    </Screen>
  )
}
