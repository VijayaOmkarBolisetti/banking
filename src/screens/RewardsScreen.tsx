import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, History, Percent, Receipt, Sparkles, Wallet } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Chip } from '../components/ui/Chip'
import { EmptyState } from '../components/ui/EmptyState'
import { ProgressBar } from '../components/ui/ProgressBar'
import { AnimatedNumber } from '../components/ui/AnimatedNumber'
import { TabPage } from '../components/layout/Screen'
import { Coin, CoinBurst } from '../components/rewards/Coin'
import { formatDate } from '../lib/format'
import {
  COIN_RATES,
  COIN_TIERS,
  REWARDS,
  nextTierFor,
  tierFor,
  tierProgress,
} from '../lib/rewards'
import { ROUTES } from '../navigation/routes'
import { selectCoinsThisMonth, useAppStore } from '../store/useAppStore'
import type { Reward } from '../types'

const ICONS = { receipt: Receipt, percent: Percent, wallet: Wallet }

const EARN_WAYS = [
  { label: 'Pay an EMI on time', coins: `+${COIN_RATES.emiPaid}`, icon: Wallet },
  { label: 'Pay before the due date', coins: `+${COIN_RATES.emiEarly} bonus`, icon: Sparkles },
  { label: 'Take a loan', coins: `+${COIN_RATES.perTenThousand} per ₹10K`, icon: Receipt },
]

export function RewardsScreen() {
  const navigate = useNavigate()
  const coins = useAppStore((state) => state.coins)
  const ledger = useAppStore((state) => state.coinLedger)
  const redeemed = useAppStore((state) => state.redeemed)
  const redeemReward = useAppStore((state) => state.redeemReward)
  const showToast = useAppStore((state) => state.showToast)

  const [celebrating, setCelebrating] = useState(false)
  const [tab, setTab] = useState<'redeem' | 'history'>('redeem')

  const earnedThisMonth = selectCoinsThisMonth({ coinLedger: ledger })
  const tier = tierFor(coins)
  const next = nextTierFor(coins)
  const progress = tierProgress(coins)

  function redeem(reward: Reward) {
    if (coins < reward.cost) {
      showToast(`You need ${(reward.cost - coins).toLocaleString('en-IN')} more coins`, 'info')
      return
    }
    if (!redeemReward(reward)) return
    setCelebrating(true)
    window.setTimeout(() => setCelebrating(false), 1400)
    showToast(`${reward.title} unlocked`, 'success')
  }

  return (
    <TabPage title="Flow Coins" subtitle="Earn on every repayment. Spend on real savings.">
      {/* Balance */}
      <motion.div
        className="relative overflow-hidden rounded-[26px] p-5 text-white lg:p-6"
        style={{ background: 'linear-gradient(135deg, #f59e0b, #b45309 55%, #7c2d12)' }}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
      >
        <div className="pointer-events-none absolute -top-12 -right-10 h-40 w-40 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute right-16 bottom-0 h-20 w-20 rounded-full bg-white/5" />

        <AnimatePresence>{celebrating ? <CoinBurst /> : null}</AnimatePresence>

        <div className="relative flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-[0.16em] text-amber-100 uppercase">
              Coin balance
            </p>
            <div className="mt-2 flex items-center gap-2.5">
              <Coin size={34} spin />
              <AnimatedNumber
                value={coins}
                format={(value) => value.toLocaleString('en-IN')}
                className="text-[clamp(1.9rem,8vw,2.75rem)] leading-none font-extrabold tabular-nums"
              />
            </div>
          </div>
          <span
            className="shrink-0 rounded-full px-3 py-1.5 text-[11px] font-extrabold backdrop-blur-sm"
            style={{ background: 'rgb(255 255 255 / 0.22)' }}
          >
            {tier.name}
          </span>
        </div>

        <div className="relative mt-5">
          <ProgressBar value={progress} tone="onColor" track="light" />
          <p className="mt-2 text-[11px] text-amber-100">
            {next
              ? `${(next.min - coins).toLocaleString('en-IN')} coins to ${next.name} · ${next.perk}`
              : `Top tier — ${tier.perk}`}
          </p>
        </div>

        {earnedThisMonth > 0 ? (
          <p className="relative mt-3 text-xs text-amber-100">
            +{earnedThisMonth.toLocaleString('en-IN')} earned this month
          </p>
        ) : null}
      </motion.div>

      {/* How to earn */}
      <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
        {EARN_WAYS.map((way, index) => {
          const Icon = way.icon
          return (
            <motion.div
              key={way.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32, delay: 0.06 * index }}
            >
              <Card className="grad-card flex h-full items-center gap-3" padding="sm">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-warning-soft text-warning">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[13px] font-bold text-ink">{way.label}</span>
                  <span className="block text-[11px] font-semibold text-warning">{way.coins}</span>
                </span>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Tabs */}
      <div className="mt-5 flex gap-2">
        {(['redeem', 'history'] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={`pressable rounded-full px-4 py-2 text-sm font-semibold capitalize transition-colors ${
              tab === item ? 'bg-primary text-white' : 'bg-card text-muted'
            }`}
          >
            {item === 'redeem' ? 'Redeem' : `History (${ledger.length})`}
          </button>
        ))}
      </div>

      {tab === 'redeem' ? (
        <>
          <div className="mt-3 grid gap-2.5 lg:grid-cols-2 2xl:grid-cols-3">
            {REWARDS.map((reward, index) => {
              const Icon = ICONS[reward.icon]
              const affordable = coins >= reward.cost
              const short = reward.cost - coins
              return (
                <motion.div
                  key={reward.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.32, delay: 0.05 * index }}
                >
                  <Card className="flex h-full flex-col">
                    <div className="flex items-start gap-3">
                      <span
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white"
                        style={{ background: reward.accent }}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-ink">{reward.title}</p>
                        <p className="mt-0.5 text-xs leading-5 text-muted">{reward.description}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <span className="flex items-center gap-1.5">
                        <Coin size={18} />
                        <span className="text-sm font-extrabold text-ink tabular-nums">
                          {reward.cost.toLocaleString('en-IN')}
                        </span>
                      </span>
                      <Button
                        size="sm"
                        fullWidth={false}
                        variant={affordable ? 'primary' : 'secondary'}
                        className="px-4"
                        onClick={() => redeem(reward)}
                      >
                        {affordable ? 'Redeem' : `${short.toLocaleString('en-IN')} more`}
                      </Button>
                    </div>

                    {!affordable ? (
                      <div className="mt-3">
                        <ProgressBar value={Math.round((coins / reward.cost) * 100)} tone="warning" />
                      </div>
                    ) : null}
                  </Card>
                </motion.div>
              )
            })}
          </div>

          {redeemed.length > 0 ? (
            <>
              <h2 className="mt-6 font-bold text-ink">Unlocked rewards</h2>
              <div className="mt-3 space-y-2 pb-2">
                {redeemed.map((item) => (
                  <Card key={item.id} className="flex items-center gap-3" padding="sm">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-success-soft text-success">
                      <Check className="h-4 w-4" strokeWidth={3} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink">{item.title}</p>
                      <p className="text-xs text-muted">
                        Redeemed {formatDate(item.redeemedAt.slice(0, 10), 'medium')}
                      </p>
                    </div>
                    <Chip label={item.used ? 'Used' : 'Ready'} tone={item.used ? 'neutral' : 'success'} />
                  </Card>
                ))}
              </div>
            </>
          ) : null}

          {/* Tier ladder */}
          <h2 className="mt-6 font-bold text-ink">Tiers</h2>
          <div className="mt-3 grid gap-2.5 pb-2 sm:grid-cols-2 xl:grid-cols-4">
            {COIN_TIERS.map((item) => {
              const reached = coins >= item.min
              return (
                <Card
                  key={item.id}
                  className={reached ? 'grad-card' : ''}
                  padding="sm"
                  style={reached ? { borderColor: `${item.accent}55` } : undefined}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ background: reached ? item.accent : 'var(--c-line)' }}
                    />
                    <p className="text-sm font-bold text-ink">{item.name}</p>
                    {item.id === tier.id ? <Chip label="You" tone="info" /> : null}
                  </div>
                  <p className="mt-1.5 text-xs text-muted">{item.perk}</p>
                  <p className="mt-0.5 text-[11px] font-semibold text-faint">
                    {item.min.toLocaleString('en-IN')}+ coins
                  </p>
                </Card>
              )
            })}
          </div>
        </>
      ) : (
        <div className="mt-3 space-y-2 pb-2">
          {ledger.map((entry) => (
            <Card key={entry.id} className="flex items-center gap-3" padding="sm">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                  entry.amount > 0 ? 'bg-warning-soft' : 'bg-subtle'
                }`}
              >
                {entry.amount > 0 ? <Coin size={20} /> : <History className="h-4 w-4 text-muted" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">{entry.label}</p>
                <p className="text-xs text-muted">
                  {formatDate(entry.at.slice(0, 10), 'medium')}
                </p>
              </div>
              <p
                className={`shrink-0 text-sm font-extrabold tabular-nums ${
                  entry.amount > 0 ? 'text-warning' : 'text-muted'
                }`}
              >
                {entry.amount > 0 ? '+' : ''}
                {entry.amount.toLocaleString('en-IN')}
              </p>
            </Card>
          ))}

          {ledger.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="No coins yet"
              description="Take a loan or clear an EMI and your coins start stacking up here."
              action={<Button size="md" onClick={() => navigate(ROUTES.LOAN_PRODUCTS)}>Browse loans</Button>}
            />
          ) : null}
        </div>
      )}
    </TabPage>
  )
}

