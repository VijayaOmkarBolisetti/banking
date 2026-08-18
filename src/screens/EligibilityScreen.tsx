import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '../components/ui/Button'
import { LottiePlayer } from '../components/ui/LottiePlayer'
import { ProcessingSteps } from '../components/ui/ProcessingSteps'
import { Screen } from '../components/layout/Screen'
import { eligibilityService } from '../services/eligibilityService'
import { formatInr } from '../lib/format'
import { ROUTES } from '../navigation/routes'
import { useAppStore } from '../store/useAppStore'
import { useConfigStore } from '../store/useConfigStore'
import { logOperation } from '../store/useAdminStore'
import { useTimedSteps } from '../hooks/useTimedSteps'

const PRE_CHECKS = [
  { label: 'Profile completed', status: 'done' as const },
  { label: 'PAN verified', status: 'done' as const },
  { label: 'Bank details verified', status: 'done' as const },
]

const PROCESS = ['Analyzing profile', 'Checking eligibility', 'Calculating available credit']

export function EligibilityScreen() {
  const navigate = useNavigate()
  const profile = useAppStore((state) => state.profile)
  const setCredit = useAppStore((state) => state.setCredit)
  const setCurrentStep = useAppStore((state) => state.setCurrentStep)
  const creditLimit = useConfigStore((state) => state.creditLimit)
  const { steps, done } = useTimedSteps(PROCESS, 850)

  useEffect(() => {
    if (!done) return
    void eligibilityService.calculateEligibility(profile).then((result) => {
      setCredit({
        limit: result.limit,
        used: 0,
        available: result.available,
        interestRate: result.interestRate,
      })
      setCurrentStep('credit_approved')
      logOperation('customer', 'eligibility', 'Credit approved', `Limit ${result.limit.toLocaleString('en-IN')}`, {
        amount: result.limit,
      })
    })
  }, [done, profile, setCredit, setCurrentStep])

  return (
    <Screen title="Checking eligibility" subtitle="This usually takes a few seconds.">
      <div className="pt-1">
        {!done ? (
          <div className="mb-3 flex justify-center py-1">
            <LottiePlayer name="loading" className="h-20 w-20" />
          </div>
        ) : null}
        <div className="mb-4 rounded-[22px] bg-white p-4 shadow-sm">
          <ProcessingSteps steps={PRE_CHECKS} />
        </div>
        <div className="rounded-[22px] bg-white p-4 shadow-sm">
          <p className="mb-3 text-sm font-semibold text-primary">Calculating your credit eligibility...</p>
          <ProcessingSteps steps={steps} />
        </div>
        {done ? (
          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0, transform: 'scale(0.96)' }}
            animate={{ opacity: 1, transform: 'scale(1)' }}
          >
            <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-primary to-[#1d4ed8] p-8 text-white shadow-xl">
              <div className="pointer-events-none absolute -top-6 -right-6 h-24 w-24 rounded-full bg-white/10" />
              <div className="pointer-events-none absolute bottom-4 left-6 h-3 w-3 rounded-full bg-emerald-300" />
              <p className="text-lg font-semibold text-indigo-100">Congratulations!</p>
              <p className="mt-2 text-sm text-indigo-100">You are eligible for</p>
              <p className="mt-2 text-5xl font-extrabold">{formatInr(creditLimit)}</p>
            </div>
            <div className="mt-6">
              <Button onClick={() => navigate(ROUTES.CREDIT_APPROVED)}>View your credit</Button>
            </div>
          </motion.div>
        ) : null}
      </div>
    </Screen>
  )
}
