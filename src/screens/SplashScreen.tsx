import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Logo } from '../components/brand/Logo'
import { LottiePlayer } from '../components/ui/LottiePlayer'
import { APP_NAME, APP_TAGLINE } from '../mock/data'
import { useAppStore } from '../store/useAppStore'
import { ROUTES } from '../navigation/routes'
import { routeForStep } from '../navigation/resume'

export function SplashScreen() {
  const navigate = useNavigate()
  const onboardingSeen = useAppStore((state) => state.onboardingSeen)
  const isAuthenticated = useAppStore((state) => state.isAuthenticated)
  const currentStep = useAppStore((state) => state.currentStep)
  const [hydrated, setHydrated] = useState(useAppStore.persist.hasHydrated())

  useEffect(() => {
    const unsub = useAppStore.persist.onFinishHydration(() => setHydrated(true))
    if (useAppStore.persist.hasHydrated()) setHydrated(true)
    return unsub
  }, [])

  useEffect(() => {
    if (!hydrated) return undefined
    const timer = window.setTimeout(() => {
      if (!onboardingSeen) {
        navigate(ROUTES.ONBOARDING, { replace: true })
        return
      }
      if (!isAuthenticated) {
        navigate(ROUTES.LOGIN, { replace: true })
        return
      }
      navigate(routeForStep(currentStep === 'splash' ? 'complete' : currentStep), { replace: true })
    }, 2200)
    return () => window.clearTimeout(timer)
  }, [currentStep, hydrated, isAuthenticated, navigate, onboardingSeen])

  return (
    <div className="grad-splash relative flex h-full flex-col items-center justify-center overflow-hidden px-8 text-white lg:rounded-[32px]">
      <motion.div
        initial={{ opacity: 0, transform: 'scale(0.95) translateY(8px)' }}
        animate={{ opacity: 1, transform: 'scale(1) translateY(0px)' }}
        transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
        className="flex flex-col items-center"
      >
        <div className="rounded-[22px] bg-card p-2 shadow-xl">
          <Logo size={64} />
        </div>
        <h1 className="mt-6 text-3xl font-extrabold tracking-tight">{APP_NAME}</h1>
        <p className="mt-2 text-sm text-indigo-100">{APP_TAGLINE}</p>
      </motion.div>
      <div className="mt-10">
        <LottiePlayer name="loading" className="h-16 w-16 opacity-90" />
      </div>
    </div>
  )
}
