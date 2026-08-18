import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { formatInr } from '../../lib/format'
import { calculateLoan } from '../../lib/loanCalculator'
import { logOperation } from '../../store/useAdminStore'
import { useAppStore } from '../../store/useAppStore'
import { DEFAULT_PRODUCT_CONFIG, useConfigStore } from '../../store/useConfigStore'
import type { ProductConfig } from '../../types'

const TENURE_OPTIONS = [3, 6, 9, 12]

export function AdminSettingsScreen() {
  const config = useConfigStore()
  const updateConfig = useConfigStore((state) => state.updateConfig)
  const resetConfig = useConfigStore((state) => state.resetConfig)
  const credit = useAppStore((state) => state.credit)
  const setCredit = useAppStore((state) => state.setCredit)
  const showToast = useAppStore((state) => state.showToast)
  const [form, setForm] = useState<ProductConfig>({
    creditLimit: config.creditLimit,
    minAmount: config.minAmount,
    maxAmount: config.maxAmount,
    defaultAmount: config.defaultAmount,
    amountStep: config.amountStep,
    interestRate: config.interestRate,
    processingFeePercent: config.processingFeePercent,
    minProcessingFee: config.minProcessingFee,
    gstPercent: config.gstPercent,
    tenures: config.tenures,
    defaultTenure: config.defaultTenure,
    firstDueDate: config.firstDueDate,
  })

  function setNumber(key: keyof ProductConfig, value: string) {
    const next = Number(value)
    setForm((current) => ({ ...current, [key]: Number.isNaN(next) ? 0 : next }))
  }

  function toggleTenure(value: number) {
    setForm((current) => {
      const exists = current.tenures.includes(value)
      const tenures = exists
        ? current.tenures.filter((item) => item !== value)
        : [...current.tenures, value].sort((a, b) => a - b)
      const defaultTenure = tenures.includes(current.defaultTenure) ? current.defaultTenure : (tenures[0] ?? 6)
      return { ...current, tenures, defaultTenure }
    })
  }

  function save() {
    if (form.minAmount <= 0 || form.maxAmount <= form.minAmount) {
      showToast('Max EMI amount must be greater than min', 'error')
      return
    }
    if (form.defaultAmount < form.minAmount || form.defaultAmount > form.maxAmount) {
      showToast('Default amount must sit inside the EMI range', 'error')
      return
    }
    if (form.tenures.length === 0) {
      showToast('Select at least one tenure', 'error')
      return
    }
    updateConfig(form)
    const used = Math.min(credit.used, form.creditLimit)
    setCredit({
      ...credit,
      limit: form.creditLimit,
      used,
      available: form.creditLimit - used,
      interestRate: form.interestRate,
    })
    logOperation(
      'admin',
      'settings',
      'Product controls updated',
      `EMI ${formatInr(form.minAmount)}–${formatInr(form.maxAmount)} · Limit ${formatInr(form.creditLimit)} · ${form.interestRate}%`,
    )
    showToast('Controls saved. Customer app will use the new values.', 'success')
  }

  const preview = calculateLoan(form.defaultAmount, form.defaultTenure, form)

  return (
    <div>
      <h1 className="hidden text-2xl font-extrabold text-ink lg:block">Product controls</h1>
      <p className="mt-1 hidden text-sm text-muted lg:block">
        These values apply immediately on Get Money, EMI, eligibility and repayment screens.
      </p>
      <div className="mt-4 grid gap-4 sm:mt-6 sm:gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="font-bold">EMI & credit range</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Credit limit (₹)" inputMode="numeric" value={String(form.creditLimit)} onChange={(event) => setNumber('creditLimit', event.target.value)} />
            <Input label="Interest rate (% p.a.)" inputMode="decimal" value={String(form.interestRate)} onChange={(event) => setNumber('interestRate', event.target.value)} />
            <Input label="Min loan amount (₹)" inputMode="numeric" value={String(form.minAmount)} onChange={(event) => setNumber('minAmount', event.target.value)} />
            <Input label="Max loan amount (₹)" inputMode="numeric" value={String(form.maxAmount)} onChange={(event) => setNumber('maxAmount', event.target.value)} />
            <Input label="Default amount (₹)" inputMode="numeric" value={String(form.defaultAmount)} onChange={(event) => setNumber('defaultAmount', event.target.value)} />
            <Input label="Amount step (₹)" inputMode="numeric" value={String(form.amountStep)} onChange={(event) => setNumber('amountStep', event.target.value)} />
          </div>
          <h2 className="pt-2 font-bold">Charges</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Input label="Processing fee (%)" inputMode="decimal" value={String(form.processingFeePercent)} onChange={(event) => setNumber('processingFeePercent', event.target.value)} />
            <Input label="Min processing fee (₹)" inputMode="numeric" value={String(form.minProcessingFee)} onChange={(event) => setNumber('minProcessingFee', event.target.value)} />
            <Input label="GST (%)" inputMode="decimal" value={String(form.gstPercent)} onChange={(event) => setNumber('gstPercent', event.target.value)} />
          </div>
          <h2 className="pt-2 font-bold">Tenure options</h2>
          <div className="flex flex-wrap gap-2">
            {TENURE_OPTIONS.map((item) => {
              const active = form.tenures.includes(item)
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleTenure(item)}
                  className={`rounded-2xl px-4 py-2 text-sm font-semibold ${active ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'}`}
                >
                  {item} months
                </button>
              )
            })}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-600">Default tenure</span>
              <select
                className="h-12 w-full rounded-2xl border border-line bg-white px-3.5 text-[15px]"
                value={form.defaultTenure}
                onChange={(event) => setForm((current) => ({ ...current, defaultTenure: Number(event.target.value) }))}
              >
                {form.tenures.map((item) => (
                  <option key={item} value={item}>
                    {item} months
                  </option>
                ))}
              </select>
            </label>
            <Input
              label="First EMI due date"
              type="date"
              value={form.firstDueDate}
              onChange={(event) => setForm((current) => ({ ...current, firstDueDate: event.target.value }))}
            />
          </div>
          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Button onClick={save}>Save controls</Button>
            <Button
              variant="secondary"
              fullWidth={false}
              className="px-5 sm:w-auto"
              onClick={() => {
                resetConfig()
                setForm({ ...DEFAULT_PRODUCT_CONFIG })
                const used = Math.min(credit.used, DEFAULT_PRODUCT_CONFIG.creditLimit)
                setCredit({
                  ...credit,
                  limit: DEFAULT_PRODUCT_CONFIG.creditLimit,
                  used,
                  available: DEFAULT_PRODUCT_CONFIG.creditLimit - used,
                  interestRate: DEFAULT_PRODUCT_CONFIG.interestRate,
                })
                logOperation('admin', 'settings', 'Controls reset', 'Restored default product settings')
                showToast('Default controls restored', 'info')
              }}
            >
              Reset defaults
            </Button>
          </div>
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="font-bold">Live EMI preview</h2>
          <p className="mt-1 text-sm text-muted">Using the default amount and tenure above.</p>
          <dl className="mt-5 space-y-3 text-sm">
            <Row label="Requested" value={formatInr(preview.amount)} />
            <Row label="Processing fee" value={formatInr(preview.processingFee)} />
            <Row label="GST" value={formatInr(preview.gst)} />
            <Row label="Net disbursal" value={formatInr(preview.netAmount)} />
            <Row label="Monthly EMI" value={formatInr(preview.monthlyEmi)} />
            <Row label="Total repayment" value={formatInr(preview.totalRepayment)} />
          </dl>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  )
}