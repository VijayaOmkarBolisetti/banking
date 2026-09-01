import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShieldCheck, Zap } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Logo } from '../components/brand/Logo'
import heroPhoto from '../assets/photos/hero-onboard.jpg'
import { authService } from '../services/authService'
import { LOAN_PRODUCTS } from '../lib/loanProducts'
import { ROUTES } from '../navigation/routes'
import { useAppStore } from '../store/useAppStore'
import { useConfigStore } from '../store/useConfigStore'

export function LoginScreen() {
  const navigate = useNavigate()
  const setMobileNumber = useAppStore((state) => state.setMobileNumber)
  const setCurrentStep = useAppStore((state) => state.setCurrentStep)
  const showToast = useAppStore((state) => state.showToast)
  const existing = useAppStore((state) => state.mobileNumber)
  const [mobile, setMobile] = useState(existing)
  const [loading, setLoading] = useState(false)

  async function handleContinue() {
    setLoading(true)
    const result = await authService.sendOtp(mobile)
    setLoading(false)
    // A blank or short number falls back to the demo number rather than erroring.
    setMobileNumber(result.mobile)
    setMobile(result.mobile)
    setCurrentStep('otp')
    showToast(result.message, 'success')
    navigate(ROUTES.OTP)
  }

  const productRates = useConfigStore((state) => state.productRates)
  const lowestRate = Math.min(
    ...LOAN_PRODUCTS.map((product) => productRates[product.id] ?? product.interestRate),
  )

  return (
    <div className="grid h-full min-h-0 min-w-0 overflow-hidden bg-surface lg:grid-cols-2">
      {/* Desktop-only marketing panel — the auth card is otherwise very empty
          at 1120px wide. Hidden below lg so phones keep the focused form. */}
      <aside className="relative hidden overflow-hidden lg:block">
        <img src={heroPhoto} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <span className="photo-scrim absolute inset-0" />
        <div className="relative flex h-full flex-col justify-end p-10 text-white">
          <Logo size={44} />
          <h2 className="mt-6 text-3xl leading-tight font-extrabold">
            Every loan you need,
            <br />
            one application.
          </h2>
          <p className="mt-3 max-w-sm text-sm leading-6 text-white/80">
            Personal, home, business and gold loans — compare rates, see your exact EMI and get
            approved without the paperwork.
          </p>
          <div className="mt-7 flex flex-wrap gap-2.5">
            <Badge icon={Zap} label={`Rates from ${lowestRate}% p.a.`} />
            <Badge icon={ShieldCheck} label="Bank-grade security" />
          </div>
        </div>
      </aside>

      <div className="grid min-h-0 grid-rows-[minmax(0,1fr)_auto] overflow-hidden">
        <div className="thin-scroll min-h-0 overflow-y-auto px-5 pt-6 sm:px-6 lg:px-10 lg:pt-16">
          <motion.div
            className="mx-auto w-full max-w-md"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
          >
            <div className="mb-8 flex justify-center lg:hidden">
              <Logo size={56} />
            </div>

            <h1 className="text-[22px] leading-7 font-extrabold text-ink lg:text-3xl lg:leading-tight">
              Enter mobile number
            </h1>
            <p className="mt-1 text-sm text-muted">
              We'll send a one-time password to verify it's you.
            </p>

            <label className="mt-6 block">
              <span className="mb-1.5 block text-sm font-medium text-muted">Mobile number</span>
              <div
                className="flex items-center gap-3 rounded-2xl border border-line bg-card px-3.5 transition-[border-color,box-shadow] duration-150 focus-within:border-primary focus-within:shadow-[0_0_0_4px_var(--c-primary-ring)]"
              >
                <span className="flex items-center gap-2 border-r border-line pr-3 text-sm font-semibold text-ink">
                  <span aria-hidden>🇮🇳</span>
                  +91
                </span>
                <input
                  inputMode="numeric"
                  maxLength={10}
                  value={mobile}
                  onChange={(event) => setMobile(event.target.value.replace(/\D/g, '').slice(0, 10))}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') void handleContinue()
                  }}
                  placeholder="10-digit number"
                  className="h-12 w-full bg-transparent text-[15px] outline-none"
                />
              </div>
            </label>

            <p className="mt-4 text-xs leading-5 text-muted">
              An OTP will be sent to this number to verify your account.
            </p>

            <a
              href={ROUTES.ADMIN_LOGIN}
              className="mt-8 block text-center text-xs font-semibold text-faint lg:text-left"
            >
              Staff login
            </a>
          </motion.div>
        </div>

        <div className="screen-footer shrink-0 border-t border-line bg-card px-5 pt-3 sm:px-6 lg:px-10">
          <div className="mx-auto w-full max-w-md">
            <Button onClick={handleContinue} loading={loading}>
              Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Badge({ icon: Icon, label }: { icon: typeof Zap; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold backdrop-blur-sm">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  )
}
