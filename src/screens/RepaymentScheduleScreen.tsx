import { useNavigate } from 'react-router-dom'
import { Chip, emiTone } from '../components/ui/Chip'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Screen } from '../components/layout/Screen'
import { formatDate, formatInr } from '../lib/format'
import { buildRepaymentSchedule, calculateLoan } from '../lib/loanCalculator'
import { ROUTES } from '../navigation/routes'
import { useAppStore } from '../store/useAppStore'
import { useConfigStore } from '../store/useConfigStore'

export function RepaymentScheduleScreen() {
  const navigate = useNavigate()
  const loan = useAppStore((state) => state.activeLoan)
  const defaultAmount = useConfigStore((state) => state.defaultAmount)
  const defaultTenure = useConfigStore((state) => state.defaultTenure)
  const firstDueDate = useConfigStore((state) => state.firstDueDate)
  const emis = loan?.emis ?? buildRepaymentSchedule(calculateLoan(defaultAmount, defaultTenure), firstDueDate)

  return (
    <Screen
      title="Repayment schedule"
      subtitle="Each EMI is due on the 5th of the month."
      onBack={() => navigate(-1)}
      footer={
        <Button variant="secondary" onClick={() => navigate(ROUTES.PAY_NOW)}>
          Pay next EMI
        </Button>
      }
    >
      <div className="space-y-3 pt-2">
        {emis.map((emi) => (
          <Card key={emi.id} className="flex items-center justify-between">
            <div>
              <p className="font-bold">EMI {emi.number}</p>
              <p className="text-sm text-muted">Due: {formatDate(emi.dueDate, 'medium')}</p>
            </div>
            <div className="text-right">
              <p className="font-extrabold">{formatInr(emi.amount)}</p>
              <div className="mt-1">
                <Chip
                  label={emi.status === 'paid' ? 'Paid' : emi.status === 'overdue' ? 'Overdue' : 'Upcoming'}
                  tone={emiTone(emi.status)}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Screen>
  )
}
