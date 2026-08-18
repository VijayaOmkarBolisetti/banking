import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Screen } from '../components/layout/Screen'
import { Logo } from '../components/brand/Logo'
import { authService } from '../services/authService'
import { validateMobile } from '../lib/validation'
import { ROUTES } from '../navigation/routes'
import { useAppStore } from '../store/useAppStore'

export function LoginScreen() {
  const navigate = useNavigate()
  const setMobileNumber = useAppStore((state) => state.setMobileNumber)
  const setCurrentStep = useAppStore((state) => state.setCurrentStep)
  const showToast = useAppStore((state) => state.showToast)
  const existing = useAppStore((state) => state.mobileNumber)
  const [mobile, setMobile] = useState(existing)
  const [error, setError] = useState<string | undefined>()
  const [loading, setLoading] = useState(false)

  async function handleContinue() {
    const message = validateMobile(mobile)
    if (message) {
      setError(message)
      return
    }
    setError(undefined)
    setLoading(true)
    const result = await authService.sendOtp(mobile)
    setLoading(false)
    if (!result.success) {
      setError(result.message)
      return
    }
    setMobileNumber(mobile.replace(/\D/g, '').slice(-10))
    setCurrentStep('otp')
    showToast(result.message, 'success')
    navigate(ROUTES.OTP)
  }

  return (
    <Screen
      title="Enter mobile number"
      subtitle="We'll send a one-time password to verify it's you."
      footer={
        <Button onClick={handleContinue} loading={loading}>
          Continue
        </Button>
      }
    >
      <div className="mt-4 mb-8 flex justify-center">
        <Logo size={56} />
      </div>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-slate-600">Mobile number</span>
        <div
          className={`flex items-center gap-3 rounded-2xl border bg-white px-3.5 ${
            error
              ? 'border-red-300 shadow-[0_0_0_4px_rgb(254_226_226)]'
              : 'border-line focus-within:border-primary focus-within:shadow-[0_0_0_4px_rgb(238_242_255)]'
          }`}
        >
          <span className="flex items-center gap-2 border-r border-slate-200 pr-3 text-sm font-semibold text-ink">
            <span aria-hidden>🇮🇳</span>
            +91
          </span>
          <input
            inputMode="numeric"
            maxLength={10}
            value={mobile}
            onChange={(event) => setMobile(event.target.value.replace(/\D/g, '').slice(0, 10))}
            placeholder="10-digit number"
            className="h-12 w-full bg-transparent text-[15px] outline-none"
          />
        </div>
        {error ? <p className="mt-1.5 text-xs font-medium text-danger">{error}</p> : null}
      </label>
      <p className="mt-4 text-xs leading-5 text-muted">
        An OTP will be sent to this number to verify your account.
      </p>
      <a href="/admin/login" className="mt-6 block text-center text-xs font-semibold text-slate-400">
        Staff login
      </a>
    </Screen>
  )
}
