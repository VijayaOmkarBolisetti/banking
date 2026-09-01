import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { OtpInput } from '../components/ui/OtpInput'
import { Screen } from '../components/layout/Screen'
import { authService } from '../services/authService'
import { formatMobile } from '../lib/format'
import { ROUTES } from '../navigation/routes'
import { useAppStore } from '../store/useAppStore'

export function OtpScreen() {
  const navigate = useNavigate()
  const mobileNumber = useAppStore((state) => state.mobileNumber)
  const setAuthenticated = useAppStore((state) => state.setAuthenticated)
  const setCurrentStep = useAppStore((state) => state.setCurrentStep)
  const currentStep = useAppStore((state) => state.currentStep)
  const showToast = useAppStore((state) => state.showToast)
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [seconds, setSeconds] = useState(30)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (seconds <= 0) return undefined
    const timer = window.setTimeout(() => setSeconds((value) => value - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [seconds])

  async function verify() {
    setLoading(true)
    // Walkthrough build: any code verifies, so there is no failure branch.
    await authService.verifyOtp(mobileNumber, otp)
    setLoading(false)
    setSuccess(true)
    setAuthenticated(true)
    const next = currentStep === 'complete' ? 'complete' : 'profile'
    setCurrentStep(next)
    window.setTimeout(() => {
      navigate(next === 'complete' ? ROUTES.DASHBOARD : ROUTES.PROFILE)
    }, 900)
  }

  async function resend() {
    if (seconds > 0) return
    await authService.sendOtp(mobileNumber)
    setSeconds(30)
    showToast('OTP sent. You can request another in 30 seconds.', 'info')
  }

  return (
    <Screen
      title="Verify OTP"
      subtitle={`Enter the 6-digit code sent to ${formatMobile(mobileNumber || '9876543210')}`}
      onBack={() => navigate(ROUTES.LOGIN)}
      footer={
        success ? null : (
          <Button onClick={verify} loading={loading}>
            Verify
          </Button>
        )
      }
    >
      <div className="pt-6">
        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="ok"
              className="flex flex-col items-center py-16"
              initial={{ opacity: 0, transform: 'scale(0.95)' }}
              animate={{ opacity: 1, transform: 'scale(1)' }}
              transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg">
                <Check className="h-10 w-10" strokeWidth={3} />
              </div>
              <p className="mt-4 text-lg font-bold text-ink">Verified successfully</p>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <OtpInput value={otp} onChange={setOtp} />
              <div className="mt-6 flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={resend}
                  disabled={seconds > 0}
                  className="font-semibold text-primary disabled:text-faint"
                >
                  Resend OTP
                </button>
                <span className="font-medium text-muted">{seconds > 0 ? `00:${String(seconds).padStart(2, '0')}` : 'Now'}</span>
              </div>
              <button
                type="button"
                onClick={() => navigate(ROUTES.LOGIN)}
                className="mt-4 text-sm font-semibold text-muted"
              >
                Change mobile number
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Screen>
  )
}
