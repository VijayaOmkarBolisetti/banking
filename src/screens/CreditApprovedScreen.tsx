import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Screen } from '../components/layout/Screen'
import { formatInr } from '../lib/format'
import { ROUTES } from '../navigation/routes'
import { useAppStore } from '../store/useAppStore'

export function CreditApprovedScreen() {
  const navigate = useNavigate()
  const credit = useAppStore((state) => state.credit)
  const setCurrentStep = useAppStore((state) => state.setCurrentStep)

  return (
    <Screen
      title="You're approved"
      subtitle="Your CreditFlow limit is ready to use."
      footer={
        <Button
          onClick={() => {
            setCurrentStep('complete')
            navigate(ROUTES.DASHBOARD)
          }}
        >
          Continue to Dashboard
        </Button>
      }
    >
      <Card className="mt-4 bg-gradient-to-br from-primary to-[#1e40af] text-white" padding="lg">
        <p className="text-sm text-indigo-100">Credit Limit</p>
        <p className="mt-1 text-4xl font-extrabold">{formatInr(credit.limit || 50000)}</p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white/10 p-3">
            <p className="text-xs text-indigo-100">Available Credit</p>
            <p className="mt-1 text-xl font-bold">{formatInr(credit.available || 50000)}</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-3">
            <p className="text-xs text-indigo-100">Used</p>
            <p className="mt-1 text-xl font-bold">{formatInr(credit.used)}</p>
          </div>
        </div>
      </Card>
      <p className="mt-5 text-sm leading-6 text-muted">
        You can use your available credit whenever you need it. Review charges and EMI before you confirm.
      </p>
    </Screen>
  )
}
