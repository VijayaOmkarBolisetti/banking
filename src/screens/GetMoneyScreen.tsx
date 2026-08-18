import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AmountSlider } from '../components/ui/AmountSlider'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { SegmentedControl } from '../components/ui/SegmentedControl'
import { Screen } from '../components/layout/Screen'
import { formatInr } from '../lib/format'
import { loanService } from '../services/loanService'
import { ROUTES } from '../navigation/routes'
import { useAppStore } from '../store/useAppStore'
import { useConfigStore } from '../store/useConfigStore'

export function GetMoneyScreen() {
  const navigate = useNavigate()
  const pendingQuote = useAppStore((state) => state.pendingQuote)
  const credit = useAppStore((state) => state.credit)
  const setPendingQuote = useAppStore((state) => state.setPendingQuote)
  const minAmount = useConfigStore((state) => state.minAmount)
  const maxAmountConfig = useConfigStore((state) => state.maxAmount)
  const defaultAmount = useConfigStore((state) => state.defaultAmount)
  const defaultTenure = useConfigStore((state) => state.defaultTenure)
  const tenures = useConfigStore((state) => state.tenures)
  const amountStep = useConfigStore((state) => state.amountStep)
  const [amount, setAmount] = useState(pendingQuote?.amount ?? defaultAmount)
  const [tenure, setTenure] = useState(pendingQuote?.tenure ?? defaultTenure)
  const maxAmount = Math.max(minAmount, Math.min(maxAmountConfig, credit.available || maxAmountConfig))
  const safeTenure = tenures.includes(tenure) ? tenure : defaultTenure
  const quote = useMemo(
    () => loanService.getQuote(Math.min(amount, maxAmount), safeTenure),
    [amount, maxAmount, safeTenure],
  )

  return (
    <Screen
      title="Get money"
      subtitle="Choose an amount and tenure. Charges update instantly."
      onBack={() => navigate(ROUTES.DASHBOARD)}
      footer={
        <Button
          onClick={() => {
            setPendingQuote(quote)
            navigate(ROUTES.LOAN_REVIEW)
          }}
        >
          Review & Continue
        </Button>
      }
    >
      <Card className="mt-3" padding="lg">
        <AmountSlider
          value={Math.min(Math.max(amount, minAmount), maxAmount)}
          min={minAmount}
          max={maxAmount}
          step={amountStep}
          onChange={setAmount}
        />
      </Card>
      <p className="mt-5 mb-2 text-sm font-semibold text-ink">Tenure</p>
      <SegmentedControl
        value={safeTenure}
        onChange={setTenure}
        options={tenures.map((item) => ({ value: item, label: `${item}m` }))}
      />
      <Card className="mt-5 space-y-3 text-sm">
        <Row label="Requested amount" value={formatInr(quote.amount)} />
        <Row label="Processing fee" value={formatInr(quote.processingFee)} />
        <Row label="GST" value={formatInr(quote.gst)} />
        <Row label="Net amount received" value={formatInr(quote.netAmount)} emphasize />
        <div className="h-px bg-slate-100" />
        <Row label="Interest rate" value={`${quote.interestRate}% p.a.`} />
        <Row label="Tenure" value={`${quote.tenure} months`} />
        <Row label="Monthly EMI" value={formatInr(quote.monthlyEmi)} />
        <Row label="Total repayment" value={formatInr(quote.totalRepayment)} emphasize />
      </Card>
    </Screen>
  )
}

function Row({ label, value, emphasize = false }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted">{label}</span>
      <span className={emphasize ? 'font-bold text-ink' : 'font-semibold text-ink'}>{value}</span>
    </div>
  )
}