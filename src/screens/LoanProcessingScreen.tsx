import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Screen } from '../components/layout/Screen'
import { ProcessingLoader } from '../components/ui/ProcessingLoader'
import { useTimedSteps } from '../hooks/useTimedSteps'
import { getProduct } from '../lib/loanProducts'
import { loanService } from '../services/loanService'
import { ROUTES } from '../navigation/routes'
import { useAppStore } from '../store/useAppStore'

const BASE_STEPS = ['Validating your request', 'Running credit checks', 'Preparing the agreement']
const SECURED_STEPS = ['Validating your request', 'Verifying collateral', 'Running credit checks', 'Preparing the agreement']

export function LoanProcessingScreen() {
  const navigate = useNavigate()
  const pendingQuote = useAppStore((state) => state.pendingQuote)
  const activateLoan = useAppStore((state) => state.activateLoan)
  const showToast = useAppStore((state) => state.showToast)

  const product = pendingQuote ? getProduct(pendingQuote.productId) : null
  const { steps, done } = useTimedSteps(product?.secured ? SECURED_STEPS : BASE_STEPS, 800)

  // One submission per mount, whatever the effect deps do afterwards.
  const submittedRef = useRef(false)

  useEffect(() => {
    if (!pendingQuote) {
      navigate(ROUTES.LOAN_PRODUCTS, { replace: true })
    }
  }, [pendingQuote, navigate])

  useEffect(() => {
    if (!done || !pendingQuote || submittedRef.current) return
    submittedRef.current = true

    let cancelled = false
    void loanService.submitApplication(pendingQuote).then((result) => {
      if (cancelled) return
      if (!result.success) {
        submittedRef.current = false
        showToast(result.message, 'error')
        navigate(ROUTES.LOAN_REVIEW, { replace: true })
        return
      }
      activateLoan(loanService.createLoan(pendingQuote))
      navigate(ROUTES.LOAN_SUCCESS, { replace: true })
    })

    return () => {
      cancelled = true
    }
  }, [done, pendingQuote, activateLoan, navigate, showToast])

  return (
    <Screen>
      <ProcessingLoader
        steps={steps}
        done={done}
        title={product ? `Processing your ${product.name}` : 'Processing your request'}
        subtitle="Please keep the app open — this takes a few seconds."
      />
    </Screen>
  )
}
