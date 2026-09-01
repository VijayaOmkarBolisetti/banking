import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { ProductIcon } from '../../components/loans/ProductIcon'
import { formatInr } from '../../lib/format'
import { calculateLoan } from '../../lib/loanCalculator'
import { LOAN_PRODUCTS, formatTenure } from '../../lib/loanProducts'
import { logOperation } from '../../store/useAdminStore'
import { useAppStore } from '../../store/useAppStore'
import {
  DEFAULT_PRODUCT_CONFIG,
  DEFAULT_PRODUCT_RATES,
  useConfigStore,
} from '../../store/useConfigStore'

export function AdminSettingsScreen() {
  const creditLimit = useConfigStore((state) => state.creditLimit)
  const gstPercent = useConfigStore((state) => state.gstPercent)
  const firstDueDate = useConfigStore((state) => state.firstDueDate)
  const interestRate = useConfigStore((state) => state.interestRate)
  const productRates = useConfigStore((state) => state.productRates)
  const updateConfig = useConfigStore((state) => state.updateConfig)
  const resetConfig = useConfigStore((state) => state.resetConfig)

  const credit = useAppStore((state) => state.credit)
  const setCredit = useAppStore((state) => state.setCredit)
  const showToast = useAppStore((state) => state.showToast)

  /*
   * Numeric fields are held as STRINGS while editing. Parsing on every
   * keystroke swallows a trailing decimal point — typing "8.4" became "8"
   * the moment the "." was entered, which made decimal rates impossible to
   * set. The strings are parsed once, on save.
   */
  const [form, setForm] = useState({
    creditLimit: String(creditLimit),
    gstPercent: String(gstPercent),
    firstDueDate,
    interestRate: String(interestRate),
  })
  const [rates, setRates] = useState<Record<string, string>>(() =>
    Object.fromEntries(LOAN_PRODUCTS.map((p) => [p.id, String(productRates[p.id] ?? p.interestRate)])),
  )

  function setField(key: 'creditLimit' | 'gstPercent' | 'interestRate' | 'firstDueDate', value: string) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function applyCreditLimit(limit: number, rate: number) {
    const used = Math.min(credit.used, limit)
    setCredit({ ...credit, limit, used, available: limit - used, interestRate: rate })
  }

  function save() {
    const parsed = {
      creditLimit: Number(form.creditLimit),
      gstPercent: Number(form.gstPercent),
      interestRate: Number(form.interestRate),
      firstDueDate: form.firstDueDate,
    }

    if (!Number.isFinite(parsed.creditLimit) || parsed.creditLimit <= 0) {
      showToast('Credit limit must be greater than zero', 'error')
      return
    }
    if (!Number.isFinite(parsed.gstPercent) || parsed.gstPercent < 0 || parsed.gstPercent > 100) {
      showToast('GST must be between 0 and 100', 'error')
      return
    }
    if (!parsed.firstDueDate) {
      showToast('Pick a first EMI due date', 'error')
      return
    }

    const parsedRates = LOAN_PRODUCTS.map((product) => ({
      product,
      rate: Number(rates[product.id]),
    }))
    const invalid = parsedRates.find(
      ({ rate }) => !Number.isFinite(rate) || rate <= 0 || rate > 60,
    )
    if (invalid) {
      showToast(`${invalid.product.name} rate must be between 0 and 60%`, 'error')
      return
    }

    updateConfig(parsed)
    parsedRates.forEach(({ product, rate }) => {
      useConfigStore.getState().setProductRate(product.id, rate)
    })
    applyCreditLimit(parsed.creditLimit, parsed.interestRate)

    logOperation(
      'admin',
      'settings',
      'Product controls updated',
      `Limit ${formatInr(Number(form.creditLimit))} · GST ${form.gstPercent}% · ${LOAN_PRODUCTS.map(
        (product) => `${product.shortName} ${rates[product.id]}%`,
      ).join(', ')}`,
    )
    showToast('Controls saved. The customer app uses these immediately.', 'success')
  }

  function reset() {
    resetConfig()
    setForm({
      creditLimit: String(DEFAULT_PRODUCT_CONFIG.creditLimit),
      gstPercent: String(DEFAULT_PRODUCT_CONFIG.gstPercent),
      firstDueDate: DEFAULT_PRODUCT_CONFIG.firstDueDate,
      interestRate: String(DEFAULT_PRODUCT_CONFIG.interestRate),
    })
    setRates(Object.fromEntries(LOAN_PRODUCTS.map((p) => [p.id, String(DEFAULT_PRODUCT_RATES[p.id])])))
    applyCreditLimit(DEFAULT_PRODUCT_CONFIG.creditLimit, DEFAULT_PRODUCT_CONFIG.interestRate)
    logOperation('admin', 'settings', 'Controls reset', 'Restored default product settings')
    showToast('Default controls restored', 'info')
  }

  return (
    <div>
      <h1 className="hidden text-2xl font-extrabold text-ink lg:block">Product controls</h1>
      <p className="mt-1 hidden text-sm text-muted lg:block">
        These values apply immediately across the customer app.
      </p>

      <div className="mt-4 grid gap-4 sm:mt-6 sm:gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6 rounded-3xl border border-line/70 bg-card p-5 card-shadow sm:p-6">
          <div>
            <h2 className="font-bold">Credit line</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Input
                label="Pre-approved limit (₹)"
                inputMode="numeric"
                value={form.creditLimit}
                onChange={(event) => setField('creditLimit', event.target.value)}
              />
              <Input
                label="Line interest rate (% p.a.)"
                inputMode="decimal"
                value={form.interestRate}
                onChange={(event) => setField('interestRate', event.target.value)}
              />
              <Input
                label="GST on fees (%)"
                inputMode="decimal"
                value={form.gstPercent}
                onChange={(event) => setField('gstPercent', event.target.value)}
              />
              <Input
                label="First EMI due date"
                type="date"
                value={form.firstDueDate}
                onChange={(event) => setField('firstDueDate', event.target.value)}
              />
            </div>
          </div>

          <div>
            <h2 className="font-bold">Interest rate by product</h2>
            <p className="mt-1 text-sm text-muted">
              Overrides the published rate on the apply screen and every new quote.
            </p>
            <div className="mt-4 space-y-3">
              {LOAN_PRODUCTS.map((product) => (
                <div
                  key={product.id}
                  className="flex flex-wrap items-center gap-3 rounded-2xl bg-subtle px-4 py-3"
                >
                  <ProductIcon product={product} className="h-9 w-9 rounded-xl" iconClassName="h-4 w-4" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-ink">{product.name}</p>
                    <p className="text-xs text-muted">
                      {formatInr(product.minAmount)} – {formatInr(product.maxAmount)} · up to{' '}
                      {formatTenure(product.tenures[product.tenures.length - 1])}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      inputMode="decimal"
                      value={rates[product.id] ?? String(product.interestRate)}
                      onChange={(event) =>
                        setRates((current) => ({ ...current, [product.id]: event.target.value }))
                      }
                      className="h-10 w-20 rounded-xl border border-line bg-card px-3 text-right text-sm font-semibold outline-none focus:border-primary focus:shadow-[0_0_0_4px_var(--c-primary-ring)]"
                      aria-label={`${product.name} interest rate`}
                    />
                    <span className="text-sm font-semibold text-muted">%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={save}>Save controls</Button>
            <Button variant="secondary" fullWidth={false} className="px-5 sm:w-auto" onClick={reset}>
              Reset defaults
            </Button>
          </div>
        </div>

        <div className="rounded-3xl border border-line/70 bg-card p-5 card-shadow sm:p-6">
          <h2 className="font-bold">Live EMI preview</h2>
          <p className="mt-1 text-sm text-muted">Default amount and tenure for each product.</p>
          <div className="mt-5 space-y-4">
            {LOAN_PRODUCTS.map((product) => {
              const preview = calculateLoan(product.id, product.defaultAmount, product.defaultTenure, {
                interestRate: Number(rates[product.id]) || product.interestRate,
                gstPercent: Number(form.gstPercent) || 0,
              })
              return (
                <div key={product.id} className="border-b border-line pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: product.accent }}
                    />
                    <p className="text-sm font-bold text-ink">{product.shortName}</p>
                    <p className="ml-auto text-xs text-muted">
                      {formatInr(preview.amount)} · {formatTenure(preview.tenure)}
                    </p>
                  </div>
                  <dl className="mt-2.5 space-y-1.5 text-sm">
                    <Row label="Monthly EMI" value={formatInr(preview.monthlyEmi)} />
                    <Row label="Net disbursal" value={formatInr(preview.netAmount)} />
                    <Row label="Total interest" value={formatInr(preview.totalInterest)} />
                  </dl>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  )
}
