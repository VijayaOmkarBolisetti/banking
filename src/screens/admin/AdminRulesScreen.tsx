import { useState } from 'react'
import {
  AlertTriangle,
  Ban,
  Clock,
  PhoneCall,
  RotateCcw,
  Scale,
  ShieldAlert,
  UserRoundSearch,
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Checkbox } from '../../components/ui/Checkbox'
import { Input } from '../../components/ui/Input'
import { formatInr } from '../../lib/format'
import { logOperation } from '../../store/useAdminStore'
import { useAppStore } from '../../store/useAppStore'
import { DEFAULT_COLLECTION_RULES, useRulesStore } from '../../store/useRulesStore'
import type { CollectionRules } from '../../types'

type NumericRuleKey = {
  [K in keyof CollectionRules]: CollectionRules[K] extends number ? K : never
}[keyof CollectionRules]

const NUMERIC_KEYS: NumericRuleKey[] = [
  'gracePeriodDays',
  'bounceFeeFlat',
  'lateFeePercent',
  'maxPenaltyPercentOfEmi',
  'softReminderFromDpd',
  'callCentreFromDpd',
  'fieldAgentFromDpd',
  'legalNoticeFromDpd',
  'blockDrawFromDpd',
  'maxAgentVisitsPerWeek',
  'agentContactFromHour',
  'agentContactToHour',
  'foreclosureFeePercent',
]

function rulesToForm(rules: CollectionRules): Record<NumericRuleKey, string> {
  return Object.fromEntries(NUMERIC_KEYS.map((key) => [key, String(rules[key])])) as Record<
    NumericRuleKey,
    string
  >
}

export function AdminRulesScreen() {
  const storeRules = useRulesStore()
  const updateRules = useRulesStore((state) => state.updateRules)
  const resetRules = useRulesStore((state) => state.resetRules)
  const showToast = useAppStore((state) => state.showToast)

  const [form, setForm] = useState(() => rulesToForm(storeRules))
  const [allowPartPayment, setAllowPartPayment] = useState(storeRules.allowPartPayment)
  const [autoChargeBounceFee, setAutoChargeBounceFee] = useState(storeRules.autoChargeBounceFee)

  function setField(key: NumericRuleKey, value: string) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function save() {
    const parsed = Object.fromEntries(
      NUMERIC_KEYS.map((key) => [key, Number(form[key])]),
    ) as Record<NumericRuleKey, number>

    const invalid = NUMERIC_KEYS.find((key) => !Number.isFinite(parsed[key]) || parsed[key] < 0)
    if (invalid) {
      showToast('All numeric rule values must be zero or positive', 'error')
      return
    }
    if (parsed.agentContactFromHour > 23 || parsed.agentContactToHour > 23) {
      showToast('Contact hours must be between 0 and 23', 'error')
      return
    }
    if (parsed.agentContactFromHour >= parsed.agentContactToHour) {
      showToast('Agent contact window: start hour must be before end hour', 'error')
      return
    }
    if (
      parsed.softReminderFromDpd > parsed.callCentreFromDpd ||
      parsed.callCentreFromDpd > parsed.fieldAgentFromDpd ||
      parsed.fieldAgentFromDpd > parsed.legalNoticeFromDpd
    ) {
      showToast('Recovery stages must be in order: soft → call → field → legal', 'error')
      return
    }

    const next: CollectionRules = {
      ...parsed,
      allowPartPayment,
      autoChargeBounceFee,
    }
    updateRules(next)
    logOperation(
      'admin',
      'rules',
      'Collection rules updated',
      `Bounce ${formatInr(next.bounceFeeFlat)} · Late ${next.lateFeePercent}% · Field DPD ${next.fieldAgentFromDpd}`,
    )
    showToast('Rules saved. Ready to wire into bounce and collections flows.', 'success')
  }

  function reset() {
    resetRules()
    setForm(rulesToForm(DEFAULT_COLLECTION_RULES))
    setAllowPartPayment(DEFAULT_COLLECTION_RULES.allowPartPayment)
    setAutoChargeBounceFee(DEFAULT_COLLECTION_RULES.autoChargeBounceFee)
    logOperation('admin', 'rules', 'Collection rules reset', 'Restored default bounce and recovery policy')
    showToast('Default rules restored', 'info')
  }

  const previewEmi = 10000
  const previewBounce = Number(form.bounceFeeFlat) || 0
  const previewLate = Math.round((previewEmi * (Number(form.lateFeePercent) || 0)) / 100)
  const previewTotal = previewBounce + previewLate
  const capPct = Number(form.maxPenaltyPercentOfEmi) || 0
  const capped =
    capPct > 0 ? Math.min(previewTotal, Math.round((previewEmi * capPct) / 100)) : previewTotal

  const stages = [
    {
      icon: PhoneCall,
      title: 'Soft reminder',
      from: form.softReminderFromDpd,
      tone: 'SMS / WhatsApp / in-app',
      detail: 'Gentle nudge after missed due date. No field visit.',
    },
    {
      icon: PhoneCall,
      title: 'Call centre',
      from: form.callCentreFromDpd,
      tone: 'Phone outreach',
      detail: 'Collections desk calls during allowed hours to arrange payment.',
    },
    {
      icon: UserRoundSearch,
      title: 'Field recovery agent',
      from: form.fieldAgentFromDpd,
      tone: 'In-person visit',
      detail: `Agents may visit up to ${form.maxAgentVisitsPerWeek || 0} time(s) per week.`,
    },
    {
      icon: Scale,
      title: 'Legal notice',
      from: form.legalNoticeFromDpd,
      tone: 'Demand / legal',
      detail: 'Formal notice before escalation. Coordinate with legal ops.',
    },
  ]

  return (
    <div>
      <h1 className="hidden text-2xl font-extrabold text-ink lg:block">Rules</h1>
      <p className="mt-1 hidden text-sm text-muted lg:block">
        EMI bounce penalties, recovery stages, and when agents may approach the customer.
      </p>

      <div className="mt-4 grid gap-4 sm:mt-6 sm:gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4 sm:space-y-6">
          {/* Bounce & penalty */}
          <section className="rounded-3xl border border-line/70 bg-card p-5 card-shadow sm:p-6">
            <div className="mb-4 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-warning/15 text-warning">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-bold text-ink">EMI bounce &amp; late penalty</h2>
                <p className="mt-0.5 text-sm text-muted">
                  Charged when Autopay / UPI mandate fails or EMI stays unpaid after grace.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="Grace period (days)"
                type="number"
                min={0}
                value={form.gracePeriodDays}
                onChange={(e) => setField('gracePeriodDays', e.target.value)}
                hint="No penalty until this many days after due date"
              />
              <Input
                label="Bounce fee (₹ flat)"
                type="number"
                min={0}
                prefix="₹"
                value={form.bounceFeeFlat}
                onChange={(e) => setField('bounceFeeFlat', e.target.value)}
                hint="Applied once per failed EMI presentation"
              />
              <Input
                label="Late fee (% of EMI)"
                type="number"
                min={0}
                step="0.1"
                suffix="%"
                value={form.lateFeePercent}
                onChange={(e) => setField('lateFeePercent', e.target.value)}
              />
              <Input
                label="Max penalty cap (% of EMI)"
                type="number"
                min={0}
                step="0.1"
                suffix="%"
                value={form.maxPenaltyPercentOfEmi}
                onChange={(e) => setField('maxPenaltyPercentOfEmi', e.target.value)}
                hint="0 = no cap"
              />
            </div>

            <div className="mt-4 space-y-3 border-t border-line pt-4">
              <Checkbox
                checked={autoChargeBounceFee}
                onChange={(e) => setAutoChargeBounceFee(e.target.checked)}
                label="Auto-charge bounce fee when payment fails (demo wiring)"
              />
              <Checkbox
                checked={allowPartPayment}
                onChange={(e) => setAllowPartPayment(e.target.checked)}
                label="Allow part-payment of an overdue EMI"
              />
            </div>
          </section>

          {/* Recovery timeline */}
          <section className="rounded-3xl border border-line/70 bg-card p-5 card-shadow sm:p-6">
            <div className="mb-4 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-bold text-ink">When recovery approaches</h2>
                <p className="mt-0.5 text-sm text-muted">
                  Days past due (DPD) when each stage starts. Stages must stay in order.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="Soft reminder from DPD"
                type="number"
                min={0}
                value={form.softReminderFromDpd}
                onChange={(e) => setField('softReminderFromDpd', e.target.value)}
              />
              <Input
                label="Call centre from DPD"
                type="number"
                min={0}
                value={form.callCentreFromDpd}
                onChange={(e) => setField('callCentreFromDpd', e.target.value)}
              />
              <Input
                label="Field agent from DPD"
                type="number"
                min={0}
                value={form.fieldAgentFromDpd}
                onChange={(e) => setField('fieldAgentFromDpd', e.target.value)}
              />
              <Input
                label="Legal notice from DPD"
                type="number"
                min={0}
                value={form.legalNoticeFromDpd}
                onChange={(e) => setField('legalNoticeFromDpd', e.target.value)}
              />
              <Input
                label="Block new draws from DPD"
                type="number"
                min={0}
                value={form.blockDrawFromDpd}
                onChange={(e) => setField('blockDrawFromDpd', e.target.value)}
                hint="Credit line draw locked until overdue is cleared"
              />
            </div>
          </section>

          {/* Agent conduct */}
          <section className="rounded-3xl border border-line/70 bg-card p-5 card-shadow sm:p-6">
            <div className="mb-4 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-danger/10 text-danger">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-bold text-ink">Recovery agent rules</h2>
                <p className="mt-0.5 text-sm text-muted">
                  Conduct window and visit limits for field / call agents (RBI fair-practice aligned).
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="Contact window starts (hour)"
                type="number"
                min={0}
                max={23}
                value={form.agentContactFromHour}
                onChange={(e) => setField('agentContactFromHour', e.target.value)}
                hint="e.g. 9 = 9:00 AM"
              />
              <Input
                label="Contact window ends (hour)"
                type="number"
                min={0}
                max={23}
                value={form.agentContactToHour}
                onChange={(e) => setField('agentContactToHour', e.target.value)}
                hint="e.g. 19 = 7:00 PM"
              />
              <Input
                label="Max field visits / week"
                type="number"
                min={0}
                value={form.maxAgentVisitsPerWeek}
                onChange={(e) => setField('maxAgentVisitsPerWeek', e.target.value)}
              />
              <Input
                label="Foreclosure fee (% of principal)"
                type="number"
                min={0}
                step="0.1"
                suffix="%"
                value={form.foreclosureFeePercent}
                onChange={(e) => setField('foreclosureFeePercent', e.target.value)}
              />
            </div>
          </section>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button fullWidth={false} className="px-5 sm:w-auto" onClick={save}>
              Save rules
            </Button>
            <Button
              variant="secondary"
              fullWidth={false}
              className="px-5 sm:w-auto"
              onClick={reset}
            >
              <RotateCcw className="h-4 w-4" />
              Reset defaults
            </Button>
          </div>
        </div>

        {/* Preview column */}
        <div className="space-y-4">
          <div className="rounded-3xl border border-line/70 bg-card p-5 card-shadow sm:p-6">
            <h2 className="font-bold text-ink">Penalty example</h2>
            <p className="mt-1 text-sm text-muted">
              If a ₹{previewEmi.toLocaleString('en-IN')} EMI bounces after grace:
            </p>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Bounce fee</dt>
                <dd className="font-semibold text-ink">{formatInr(previewBounce)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Late fee ({form.lateFeePercent || 0}%)</dt>
                <dd className="font-semibold text-ink">{formatInr(previewLate)}</dd>
              </div>
              <div className="flex justify-between gap-3 border-t border-line pt-2">
                <dt className="font-semibold text-ink">Total charged</dt>
                <dd className="font-extrabold text-ink">{formatInr(capped)}</dd>
              </div>
              {capPct > 0 && capped < previewTotal ? (
                <p className="text-xs text-muted">Capped at {capPct}% of EMI.</p>
              ) : null}
            </dl>
          </div>

          <div className="rounded-3xl border border-line/70 bg-card p-5 card-shadow sm:p-6">
            <h2 className="mb-3 font-bold text-ink">Recovery timeline</h2>
            <ol className="space-y-3">
              {stages.map((stage) => {
                const Icon = stage.icon
                return (
                  <li
                    key={stage.title}
                    className="flex gap-3 rounded-2xl border border-line/60 bg-subtle/60 px-3 py-3"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-card text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-ink">{stage.title}</p>
                      <p className="text-[11px] font-semibold text-primary">
                        From DPD {stage.from || 0} · {stage.tone}
                      </p>
                      <p className="mt-0.5 text-xs text-muted">{stage.detail}</p>
                    </div>
                  </li>
                )
              })}
            </ol>
          </div>

          <div className="rounded-3xl border border-warning/30 bg-warning/10 p-4 sm:p-5">
            <div className="flex gap-3">
              <Ban className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
              <div>
                <p className="text-sm font-bold text-ink">Draw block</p>
                <p className="mt-1 text-xs leading-relaxed text-muted">
                  New withdrawals from the credit line stop from DPD{' '}
                  <span className="font-semibold text-ink">{form.blockDrawFromDpd || 0}</span> until
                  overdue EMIs (and penalties) are cleared. Agents may contact only between{' '}
                  <span className="font-semibold text-ink">
                    {form.agentContactFromHour || 0}:00–{form.agentContactToHour || 0}:00
                  </span>
                  .
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-line/70 bg-card p-4 text-xs text-muted sm:p-5">
            <p className="font-semibold text-ink">Implementation note</p>
            <p className="mt-1.5 leading-relaxed">
              These rules are stored for the lender demo. Wire them next into payment failure
              handling, DPD dashboards, and Autopay bounce charges — the customer app will use the
              same saved values.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
