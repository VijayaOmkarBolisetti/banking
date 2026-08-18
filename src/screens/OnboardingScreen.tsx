import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../components/ui/Button'
import { Logo } from '../components/brand/Logo'
import { ONBOARDING_SLIDES } from '../mock/data'
import { ROUTES } from '../navigation/routes'
import { useAppStore } from '../store/useAppStore'

function CreditIllustration() {
  return (
    <svg viewBox="0 0 280 200" className="h-full w-full" aria-hidden>
      <motion.circle
        cx="140"
        cy="100"
        r="72"
        fill="#EEF2FF"
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.g
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <rect x="62" y="58" width="156" height="98" rx="18" fill="#3B5BDB" />
        <rect x="62" y="58" width="156" height="34" rx="18" fill="#2F4BC4" />
        <rect x="78" y="108" width="52" height="10" rx="5" fill="#C7D2FE" />
        <rect x="78" y="126" width="72" height="8" rx="4" fill="#93C5FD" opacity="0.7" />
        <circle cx="196" cy="132" r="12" fill="#FBBF24" />
        <circle cx="196" cy="132" r="8" fill="#F59E0B" />
      </motion.g>
      {[
        { x: 48, y: 52, delay: 0 },
        { x: 210, y: 48, delay: 0.4 },
        { x: 224, y: 118, delay: 0.8 },
      ].map((coin) => (
        <motion.g
          key={`${coin.x}-${coin.y}`}
          animate={{ y: [0, -10, 0], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2.2, repeat: Infinity, delay: coin.delay, ease: 'easeInOut' }}
        >
          <circle cx={coin.x} cy={coin.y} r="14" fill="#FDE68A" stroke="#F59E0B" strokeWidth="2" />
          <text x={coin.x} y={coin.y + 5} textAnchor="middle" fontSize="14" fontWeight="700" fill="#B45309">
            ₹
          </text>
        </motion.g>
      ))}
      <motion.path
        d="M88 170 Q140 150 192 170"
        fill="none"
        stroke="#CBD5E1"
        strokeWidth="3"
        strokeLinecap="round"
        animate={{ pathLength: [0.4, 1, 0.4] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      />
    </svg>
  )
}

function TransparentIllustration() {
  return (
    <svg viewBox="0 0 280 200" className="h-full w-full" aria-hidden>
      <motion.rect
        x="70"
        y="36"
        width="140"
        height="148"
        rx="16"
        fill="#fff"
        stroke="#E2E8F0"
        strokeWidth="2"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
      <rect x="88" y="56" width="72" height="10" rx="5" fill="#3B5BDB" />
      {[0, 1, 2].map((row) => (
        <g key={row}>
          <rect x="88" y={82 + row * 28} width="104" height="8" rx="4" fill="#E2E8F0" />
          <motion.rect
            x="88"
            y={82 + row * 28}
            height="8"
            rx="4"
            fill="#C7D2FE"
            initial={{ width: 0 }}
            animate={{ width: [0, 72, 72, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, delay: row * 0.35, ease: 'easeInOut' }}
          />
          <motion.g
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: [0, 1, 1, 0], scale: [0.5, 1, 1, 0.5] }}
            transition={{ duration: 2.4, repeat: Infinity, delay: row * 0.35 + 0.5, ease: 'easeOut' }}
          >
            <circle cx="204" cy={86 + row * 28} r="10" fill="#10B981" />
            <path
              d={`M199 ${86 + row * 28} L202 ${89 + row * 28} L209 ${82 + row * 28}`}
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
        y="168"
        textAnchor="middle"
        fontSize="13"
        fontWeight="700"
        fill="#3B5BDB"
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
        <rect x="88" y="28" width="104" height="156" rx="22" fill="#0F172A" />
        <rect x="94" y="38" width="92" height="136" rx="16" fill="#F8FAFC" />
        <rect x="104" y="52" width="72" height="36" rx="10" fill="#3B5BDB" />
        <rect x="112" y="62" width="40" height="6" rx="3" fill="#C7D2FE" />
        <rect x="112" y="74" width="28" height="6" rx="3" fill="#93C5FD" />
        {[0, 1, 2].map((bar) => (
          <motion.rect
            key={bar}
            x={108 + bar * 22}
            y={100}
            width="14"
            rx="4"
            fill="#3B5BDB"
            animate={{ height: [18, 36 - bar * 4, 18], y: [118, 100 + bar * 2, 118] }}
            transition={{ duration: 1.6, repeat: Infinity, delay: bar * 0.2, ease: 'easeInOut' }}
          />
        ))}
        <rect x="104" y="132" width="72" height="28" rx="10" fill="#EEF2FF" />
        <circle cx="118" cy="146" r="8" fill="#10B981" />
        <rect x="132" y="140" width="36" height="6" rx="3" fill="#CBD5E1" />
        <rect x="132" y="150" width="24" height="5" rx="2.5" fill="#E2E8F0" />
      </motion.g>
      <motion.circle
        cx="56"
        cy="120"
        r="20"
        fill="#EEF2FF"
        animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <motion.circle
        cx="224"
        cy="80"
        r="16"
        fill="#DCFCE7"
        animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2.2, repeat: Infinity, delay: 0.5 }}
      />
    </svg>
  )
}

const ILLUSTRATIONS = [CreditIllustration, TransparentIllustration, ManageIllustration]

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
    <div className="flex h-full min-h-0 flex-col bg-surface px-5 pt-4">
      <div className="flex items-center justify-between">
        <Logo size={36} />
        <button type="button" onClick={finish} className="text-sm font-semibold text-muted">
          Skip
        </button>
      </div>
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, transform: 'translateX(18px)' }}
            animate={{ opacity: 1, transform: 'translateX(0px)' }}
            exit={{ opacity: 0, transform: 'translateX(-18px)' }}
            transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
            className="w-full text-center"
          >
            <div className="mx-auto mb-6 flex h-52 w-full max-w-[300px] items-center justify-center overflow-hidden rounded-[28px] bg-gradient-to-b from-white to-[#f8faff] px-3 py-2 shadow-[0_12px_40px_rgb(59_91_219_/_0.1)]">
              <Illustration />
            </div>
            <h2 className="text-[28px] leading-8 font-extrabold text-ink">{slide.title}</h2>
            <p className="mx-auto mt-3 max-w-xs text-[15px] leading-6 text-muted">{slide.description}</p>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="mb-5 flex justify-center gap-2">
        {ONBOARDING_SLIDES.map((item, dotIndex) => (
          <span
            key={item.id}
            className={`h-2 rounded-full transition-[width,background-color] duration-200 ${
              dotIndex === index ? 'w-6 bg-primary' : 'w-2 bg-slate-300'
            }`}
          />
        ))}
      </div>
      {last ? (
        <div className="screen-footer -mx-5 px-5 pt-3">
          <Button onClick={finish}>Get Started</Button>
        </div>
      ) : (
        <div className="screen-footer -mx-5 px-5 pt-3">
          <Button onClick={() => setIndex((value) => value + 1)}>Next</Button>
        </div>
      )}
    </div>
  )
}
