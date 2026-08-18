import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Chip, emiTone } from '../components/ui/Chip'
import { TabPage } from '../components/layout/Screen'
import { formatDate, formatInr } from '../lib/format'
import { ROUTES } from '../navigation/routes'
import { useAppStore } from '../store/useAppStore'

export function PaymentsTabScreen() {
  const navigate = useNavigate()
  const loan = useAppStore((state) => state.activeLoan)
  const next = loan?.emis.find((emi) => emi.status === 'upcoming' || emi.status === 'overdue')

  return (
    <TabPage title="Payments" subtitle="Manage EMIs and payment methods.">
      <div className="lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-6">
        <Card padding="lg">
          <p className="text-xs font-semibold tracking-wide text-muted uppercase">Amount due</p>
          <p className="mt-1 text-[clamp(1.75rem,6vw,2.25rem)] font-extrabold">{next ? formatInr(next.amount) : '₹0'}</p>
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-sm text-muted">{next ? formatDate(next.dueDate) : 'Nothing pending'}</p>
            {next ? <Chip label={next.status === 'overdue' ? 'Overdue' : 'Upcoming'} tone={emiTone(next.status)} /> : null}
          </div>
          <div className="mt-4">
            <Button onClick={() => navigate(ROUTES.PAY_NOW)} disabled={!next}>
              Pay Now
            </Button>
          </div>
        </Card>

        <div className="mt-4 grid grid-cols-2 gap-3 lg:mt-0 lg:grid-cols-1">
          <button
            type="button"
            onClick={() => navigate(ROUTES.REPAYMENT_SCHEDULE)}
            className="pressable rounded-[22px] bg-white p-4 text-left shadow-sm lg:p-5"
          >
            <p className="font-bold">Schedule</p>
            <p className="mt-1 text-xs text-muted">See every EMI</p>
          </button>
          <button
            type="button"
            onClick={() => navigate(ROUTES.TRANSACTIONS)}
            className="pressable rounded-[22px] bg-white p-4 text-left shadow-sm lg:p-5"
          >
            <p className="font-bold">History</p>
            <p className="mt-1 text-xs text-muted">Credits & charges</p>
          </button>
        </div>
      </div>
    </TabPage>
  )
}
