import { Bell, Camera, MapPin } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Checkbox } from '../components/ui/Checkbox'
import { Screen } from '../components/layout/Screen'
import { ROUTES } from '../navigation/routes'
import { useAppStore } from '../store/useAppStore'
import type { PermissionStatus } from '../types'

const PERMISSIONS = [
  {
    key: 'notifications' as const,
    title: 'Notifications',
    description: 'Payment reminders and credit updates.',
    icon: Bell,
  },
  {
    key: 'location' as const,
    title: 'Location',
    description: 'Helps protect your account from unusual activity.',
    icon: MapPin,
  },
  {
    key: 'camera' as const,
    title: 'Camera / documents',
    description: 'Needed to capture KYC documents.',
    icon: Camera,
  },
]

function statusLabel(status: PermissionStatus) {
  if (status === 'granted') return 'Allowed'
  if (status === 'not_now') return 'Not now'
  return 'Allow'
}

export function ConsentScreen() {
  const navigate = useNavigate()
  const consent = useAppStore((state) => state.consent)
  const setPermission = useAppStore((state) => state.setPermission)
  const setConsent = useAppStore((state) => state.setConsent)
  const setCurrentStep = useAppStore((state) => state.setCurrentStep)

  return (
    <Screen
      title="Permissions & consent"
      subtitle="Allow these so we can keep your account secure and up to date."
      onBack={() => navigate(ROUTES.BANK)}
      footer={
        <Button
          disabled={!consent.termsAccepted}
          onClick={() => {
            setCurrentStep('eligibility')
            navigate(ROUTES.ELIGIBILITY)
          }}
        >
          Continue
        </Button>
      }
    >
      <div className="space-y-3 pt-2">
        {PERMISSIONS.map((item) => {
          const Icon = item.icon
          const status = consent[item.key]
          return (
            <Card key={item.key} className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-ink">{item.title}</p>
                <p className="text-xs leading-5 text-muted">{item.description}</p>
              </div>
              <button
                type="button"
                onClick={() => setPermission(item.key, status === 'granted' ? 'not_now' : 'granted')}
                className={`pressable rounded-full px-3 py-1.5 text-xs font-bold ${
                  status === 'granted' ? 'bg-emerald-50 text-success' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {statusLabel(status)}
              </button>
            </Card>
          )
        })}
        <div className="pt-3">
          <Checkbox
            checked={consent.termsAccepted}
            onChange={(event) => setConsent({ termsAccepted: event.target.checked })}
            label="I agree to the Terms & Conditions and Privacy Policy."
          />
        </div>
      </div>
    </Screen>
  )
}
