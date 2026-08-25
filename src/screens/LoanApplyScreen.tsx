import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertTriangle, Clock, FileText, TrendingUp, Zap } from 'lucide-react'
import { AmountSlider } from '../components/ui/AmountSlider'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Checkbox } from '../components/ui/Checkbox'
import { SegmentedControl } from '../components/ui/SegmentedControl'
import { Screen } from '../components/layout/Screen'
import { ProductIcon } from '../components/loans/ProductIcon'
import { formatInr } from '../lib/format'
import { affordabilityRatio } from '../lib/loanCalculator'
import {
  getProduct,
  formatTenure,
  isLoanProductId,
  productGradient,
  tenureShortLabel,
} from '../lib/loanProducts'
import { loanService } from '../services/loanService'
import { ROUTES } from '../navigation/routes'
import { useAppStore } from '../store/useAppStore'
import { useConfigStore } from '../store/useConfigStore'

/** Four evenly spaced presets across the product's range, rounded to the step. */
function presetsFor(min: number, max: number, step: number): number[] {
  return [0.15, 0.35, 0.6, 1].map((fraction) => {
    const raw = min + (max - min) * fraction
    return Math.min(max, Math.max(min, Math.round(raw / step) * step))
  })
}

export function LoanApplyScreen() {
  const navigate = useNavigate()
  const { productId } = useParams()
  const product = getProduct(isLoanProductId(productId) ? productId : 'personal')

  const profile = useAppStore((state) => state.profile)
  const setPendingQuote = useAppStore((state) => state.setPendingQuote)
  const selectProduct = useAppStore((state) => state.selectProduct)
  const rate = useConfigStore((state) => state.productRates[product.id] ?? product.interestRate)

  const [amount, setAmount] = useState(product.defaultAmount)
  const [tenure, setTenure] = useState(product.defaultTenure)
  // Instant products fold the agreement in here instead of a review screen.
  const [agreed, setAgreed] = useState(false)

  const quote = useMemo(
    () => loanService.getQuote(product.id, amount, tenure),
    [product.id, amount, tenure],
  )

  const income = Number(profile.monthlyIncome) || 0
  const burden = affordabilityRatio(quote.monthlyEmi, income)
  const stretched = income > 0 && burden > 50

  function proceed() {
    selectProduct(product.id)
    setPendingQuote(quote)
    if (product.extraStep) {
      navigate(ROUTES.LOAN_DETAILS_FORM)
      return
    }
    navigate(product.skipReview ? ROUTES.LOAN_PROCESSING : ROUTES.LOAN_REVIEW)
  }

  const ctaLabel = product.extraStep
    ? 'Add details'
    : product.skipReview
      ? `Get ${formatInr(quote.netAmount)} now`
      : 'Review & continue'

  return (
    <Screen
      title={product.name}
      subtitle={product.tagline}
      onBack={() => navigate(ROUTES.LOAN_PRODUCTS)}
      wide
      footer={
        <Button
          onClick={proceed}
          disabled={product.skipReview && !agreed}
          style={product.skipReview && !agreed ? undefined : { background: productGradient(product, '120deg') }}
        >
          {product.skipReview ? <Zap className="h-4 w-4" /> : null}
          {ctaLabel}
        </Button>
      }
    >
      <div className="mt-3 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-6">
        <div>
          <motion.div
            className="relative overflow-hidden rounded-[26px]"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          >
            <img src={product.photo} alt="" className="h-32 w-full object-cover sm:h-40 lg:h-44" />
            <span className="photo-scrim absolute inset-0" />
            <div className="absolute inset-0 flex items-end gap-3 p-4">
              <ProductIcon product={product} />
              <div className="min-w-0 text-white">
                <p className="text-sm font-bold">{product.disbursalSla} disbursal</p>
                <p className="text-[11px] text-white/75">{rate}% p.a. · {product.secured ? 'Secured' : 'Unsecured'}</p>
              </div>
            </div>
          </motion.div>

          <Card className="mt-4" padding="lg">
            <AmountSlider
              value={amount}
              min={product.minAmount}
              max={product.maxAmount}
              step={product.amountStep}
              accent={product.accent}
              presets={presetsFor(product.minAmount, product.maxAmount, product.amountStep)}
              onChange={setAmount}
            />
          </Card>

          <p className="mt-5 mb-2 text-sm font-semibold text-ink">Tenure</p>
          <SegmentedControl
            value={tenure}
            onChange={setTenure}
            accent={product.accent}
            options={product.tenures.map((item) => ({ value: item, label: tenureShortLabel(item) }))}
          />
          <p className="mt-2 text-xs text-muted">Selected: {formatTenure(tenure)}</p>
        </div>

        <div className="mt-5 lg:mt-0">
          <Card
            className="text-white"
            style={{ background: productGradient(product) }}
            padding="lg"
          >
            <p className="text-xs tracking-wide text-white/70 uppercase">Monthly EMI</p>
            <p className="mt-1 text-[clamp(1.9rem,7vw,2.5rem)] leading-none font-extrabold">
              {formatInr(quote.monthlyEmi)}
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/12 px-3 py-2.5">
                <p className="text-[11px] text-white/70">You receive</p>
                <p className="mt-0.5 truncate text-base font-bold">{formatInr(quote.netAmount)}</p>
              </div>
              <div className="rounded-2xl bg-white/12 px-3 py-2.5">
                <p className="text-[11px] text-white/70">Total interest</p>
                <p className="mt-0.5 truncate text-base font-bold">{formatInr(quote.totalInterest)}</p>
              </div>
            </div>
          </Card>

          {stretched ? (
            <motion.div
              className="mt-3 flex items-start gap-2.5 rounded-[20px] border border-warning/30 bg-warning-soft px-4 py-3"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
              <p className="text-[13px] leading-5 text-ink">
                This EMI is <span className="font-bold">{burden}%</span> of your declared monthly income. Lenders
                usually prefer to stay under 50% — consider a longer tenure.
              </p>
            </motion.div>
          ) : null}

          <Card className="mt-3 space-y-3 text-sm">
            <Row label="Loan amount" value={formatInr(quote.amount)} />
            <Row label="Interest rate" value={`${quote.interestRate}% p.a.`} />
            <Row label="Tenure" value={formatTenure(quote.tenure)} />
            <div className="h-px bg-subtle" />
            <Row label="Processing fee" value={formatInr(quote.processingFee)} />
            <Row label="GST on fee" value={formatInr(quote.gst)} />
            <Row label="Net disbursal" value={formatInr(quote.netAmount)} emphasize />
            <div className="h-px bg-subtle" />
            <Row label="Total repayment" value={formatInr(quote.totalRepayment)} emphasize />
          </Card>

          <Card className="mt-3">
            <p className="flex items-center gap-2 text-xs font-bold tracking-wider text-muted uppercase">
              <FileText className="h-3.5 w-3.5" />
              Keep ready
            </p>
            <ul className="mt-3 space-y-2">
              {product.documents.map((document) => (
                <li key={document} className="flex items-start gap-2 text-[13px] leading-5 text-ink">
                  <span
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ background: product.accent }}
                  />
                  {document}
                </li>
              ))}
            </ul>
            <p className="mt-4 flex items-center gap-2 text-xs text-muted">
              <Clock className="h-3.5 w-3.5" />
              Typical disbursal in {product.disbursalSla}
            </p>
            <p className="mt-1.5 flex items-center gap-2 text-xs text-muted">
              <TrendingUp className="h-3.5 w-3.5" />
              Rate shown is the {product.secured ? 'secured' : 'unsecured'} starting rate
            </p>
          </Card>

          {product.skipReview ? (
            <Card className="mt-3">
              <Checkbox
                checked={agreed}
                onChange={(event) => setAgreed(event.target.checked)}
                label={`I agree to the ${product.name} agreement — ${formatInr(quote.monthlyEmi)} a month for ${formatTenure(quote.tenure)}, ${formatInr(quote.totalRepayment)} total.`}
              />
              <p className="mt-3 text-xs leading-5 text-muted">
                No review queue for instant loans — tapping the button disburses straight to your
                linked account.
              </p>
            </Card>
          ) : null}
        </div>
      </div>
    </Screen>
  )
}

function Row({ label, value, emphasize = false }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted">{label}</span>
      <span className={emphasize ? 'font-extrabold text-ink' : 'font-semibold text-ink'}>{value}</span>
    </div>
  )
}
