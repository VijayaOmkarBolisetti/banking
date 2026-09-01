import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../components/ui/Button'
import { Logo } from '../components/brand/Logo'
import { ONBOARDING_SLIDES } from '../mock/data'
import { ROUTES } from '../navigation/routes'
import { useAppStore } from '../store/useAppStore'

/*
 * Illustrations paint from theme variables rather than fixed hex so they
 * invert cleanly in dark mode. They sit directly on the page — no card, no
 * panel — which keeps the artwork from reading as a screenshot in a box.
 */

function InstantIllustration() {
  return (
    <svg viewBox="0 0 280 200" className="h-full w-full" aria-hidden>
      <motion.circle
        cx="140"
        cy="100"
        r="70"
        fill="var(--c-primary-soft)"
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.g
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <rect x="66" y="62" width="148" height="92" rx="18" fill="var(--c-primary)" />
        <rect x="66" y="62" width="148" height="30" rx="18" fill="var(--c-primary-dark)" />
        <rect x="82" y="110" width="50" height="9" rx="4.5" fill="#fff" opacity="0.75" />
        <rect x="82" y="126" width="70" height="7" rx="3.5" fill="#fff" opacity="0.45" />
      </motion.g>

      {/* Lightning strike — the instant-disbursal cue */}
      <motion.path
        d="M186 96 L172 118h10l-6 16 20-24h-10l6-10Z"
        fill="#fde68a"
        stroke="#f59e0b"
        strokeWidth="1.5"
        strokeLinejoin="round"
        animate={{ opacity: [0.45, 1, 0.45], scale: [0.94, 1.06, 0.94] }}
        style={{ transformOrigin: '183px 115px' }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
      />

      {[
        { x: 50, y: 56, delay: 0 },
        { x: 226, y: 52, delay: 0.4 },
        { x: 44, y: 132, delay: 0.8 },
      ].map((coin) => (
        <motion.g
          key={`${coin.x}-${coin.y}`}
          animate={{ y: [0, -10, 0], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2.2, repeat: Infinity, delay: coin.delay, ease: 'easeInOut' }}
        >
          <circle cx={coin.x} cy={coin.y} r="14" fill="#fde68a" stroke="#f59e0b" strokeWidth="2" />
          <text x={coin.x} y={coin.y + 5} textAnchor="middle" fontSize="14" fontWeight="700" fill="#b45309">
            ₹
          </text>
        </motion.g>
      ))}
    </svg>
  )
}

function TransparentIllustration() {
  return (
    <svg viewBox="0 0 280 200" className="h-full w-full" aria-hidden>
      <motion.rect
        x="70"
        y="30"
        width="140"
        height="150"
        rx="16"
        fill="var(--c-card)"
        stroke="var(--c-line)"
        strokeWidth="2"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
      <rect x="88" y="52" width="72" height="10" rx="5" fill="var(--c-primary)" />
      {[0, 1, 2].map((row) => (
        <g key={row}>
          <rect x="88" y={80 + row * 28} width="104" height="8" rx="4" fill="var(--c-line)" />
          <motion.rect
            x="88"
            y={80 + row * 28}
            height="8"
            rx="4"
            fill="var(--c-primary)"
            opacity="0.5"
            initial={{ width: 0 }}
            animate={{ width: [0, 72, 72, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, delay: row * 0.35, ease: 'easeInOut' }}
          />
          <motion.g
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: [0, 1, 1, 0], scale: [0.5, 1, 1, 0.5] }}
            transition={{ duration: 2.4, repeat: Infinity, delay: row * 0.35 + 0.5, ease: 'easeOut' }}
          >
            <circle cx="204" cy={84 + row * 28} r="10" fill="var(--c-success)" />
            <path
              d={`M199 ${84 + row * 28} L202 ${87 + row * 28} L209 ${80 + row * 28}`}
              fill="none"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.g>
        </g>
      ))}
      <motion.text
        x="140"
        y="166"
        textAnchor="middle"
        fontSize="13"
        fontWeight="700"
        fill="var(--c-primary)"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        No hidden fees
      </motion.text>
    </svg>
  )
}

function ManageIllustration() {
  return (
    <svg viewBox="0 0 280 200" className="h-full w-full" aria-hidden>
      <motion.g
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <rect x="88" y="22" width="104" height="160" rx="22" fill="var(--c-ink)" />
        <rect x="94" y="32" width="92" height="140" rx="16" fill="var(--c-surface)" />
        <rect x="104" y="46" width="72" height="36" rx="10" fill="var(--c-primary)" />
        <rect x="112" y="56" width="40" height="6" rx="3" fill="#fff" opacity="0.7" />
        <rect x="112" y="68" width="28" height="6" rx="3" fill="#fff" opacity="0.45" />
        {[0, 1, 2].map((bar) => (
          <motion.rect
            key={bar}
            x={108 + bar * 22}
            y={96}
            width="14"
            rx="4"
            fill="var(--c-primary)"
            animate={{ height: [18, 36 - bar * 4, 18], y: [114, 96 + bar * 2, 114] }}
            transition={{ duration: 1.6, repeat: Infinity, delay: bar * 0.2, ease: 'easeInOut' }}
          />
        ))}
        <rect x="104" y="130" width="72" height="28" rx="10" fill="var(--c-primary-soft)" />
        <circle cx="118" cy="144" r="8" fill="var(--c-success)" />
        <rect x="132" y="138" width="36" height="6" rx="3" fill="var(--c-line)" />
        <rect x="132" y="148" width="24" height="5" rx="2.5" fill="var(--c-line)" />
      </motion.g>
      <motion.circle
        cx="52"
        cy="118"
        r="20"
        fill="var(--c-primary-soft)"
        animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <motion.circle
        cx="228"
        cy="78"
        r="16"
        fill="var(--c-success-soft)"
        animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2.2, repeat: Infinity, delay: 0.5 }}
      />
    </svg>
  )
}

const ILLUSTRATIONS = [InstantIllustration, TransparentIllustration, ManageIllustration]

export function OnboardingScreen() {
  const [index, setIndex] = useState(0)
  const navigate = useNavigate()
  const setOnboardingSeen = useAppStore((state) => state.setOnboardingSeen)
  const setCurrentStep = useAppStore((state) => state.setCurrentStep)
  const slide = ONBOARDING_SLIDES[index]
  const last = index === ONBOARDING_SLIDES.length - 1
  const Illustration = ILLUSTRATIONS[index]

  function finish() {
    setOnboardingSeen(true)
    setCurrentStep('login')
    navigate(ROUTES.LOGIN)
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-surface px-5 pt-4 lg:px-10 lg:pt-8">
      <div className="flex items-center justify-between">
        <Logo size={36} />
        <button type="button" onClick={finish} className="text-sm font-semibold text-muted">
          Skip
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center lg:flex-row lg:items-center lg:justify-between lg:gap-14 lg:px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, transform: 'translateX(18px)' }}
            animate={{ opacity: 1, transform: 'translateX(0px)' }}
            exit={{ opacity: 0, transform: 'translateX(-18px)' }}
            transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
            className="flex w-full flex-col items-center text-center lg:flex-row lg:items-center lg:gap-14 lg:text-left"
          >
            {/* Artwork sits on the page background — no card, no shadow. */}
            <div className="mx-auto mb-7 h-40 w-full max-w-[260px] shrink-0 sm:h-44 lg:mx-0 lg:mb-0 lg:h-64 lg:w-[380px] lg:max-w-none">
              <Illustration />
            </div>

            <div className="w-full max-w-sm lg:max-w-sm">
              <h2 className="text-[26px] leading-8 font-extrabold text-ink lg:text-4xl lg:leading-tight">
                {slide.title}
              </h2>
              <p className="mx-auto mt-3 max-w-xs text-[15px] leading-6 text-muted lg:mx-0 lg:max-w-none lg:text-base">
                {slide.description}
              </p>

              <div className="mt-7 hidden justify-start gap-2 lg:flex">
                {ONBOARDING_SLIDES.map((item, dotIndex) => (
                  <span
                    key={`lg-${item.id}`}
                    className={`h-2 rounded-full transition-[width,background-color] duration-200 ${
                      dotIndex === index ? 'w-6 bg-primary' : 'w-2 bg-line'
                    }`}
                  />
                ))}
              </div>
              <div className="mt-8 hidden lg:block lg:max-w-[220px]">
                {last ? (
                  <Button onClick={finish}>Get started</Button>
                ) : (
                  <Button onClick={() => setIndex((value) => value + 1)}>Next</Button>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mb-5 flex justify-center gap-2 lg:hidden">
        {ONBOARDING_SLIDES.map((item, dotIndex) => (
          <span
            key={item.id}
            className={`h-2 rounded-full transition-[width,background-color] duration-200 ${
              dotIndex === index ? 'w-6 bg-primary' : 'w-2 bg-line'
            }`}
          />
        ))}
      </div>

      <div className="screen-footer -mx-5 px-5 pt-3 lg:hidden">
        {last ? (
          <Button onClick={finish}>Get started</Button>
        ) : (
          <Button onClick={() => setIndex((value) => value + 1)}>Next</Button>
        )}
      </div>
    </div>
  )
}
