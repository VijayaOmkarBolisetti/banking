import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { ProcessingSteps } from '../components/ui/ProcessingSteps'
import { LottiePlayer } from '../components/ui/LottiePlayer'
import { Screen } from '../components/layout/Screen'
import { eligibilityService } from '../services/eligibilityService'
import { ROUTES } from '../navigation/routes'
import { useAppStore } from '../store/useAppStore'
import { useTimedSteps } from '../hooks/useTimedSteps'

const VERIFY_LABELS = ['Checking PAN details...', 'Matching name...', 'Verification successful']

export function PanScreen() {
  const navigate = useNavigate()
  const pan = useAppStore((state) => state.pan)
  const profile = useAppStore((state) => state.profile)
  const setPan = useAppStore((state) => state.setPan)
  const setCurrentStep = useAppStore((state) => state.setCurrentStep)
  const [value, setValue] = useState(pan.panNumber)
  const [verifying, setVerifying] = useState(false)
  const [done, setDone] = useState(pan.verified)
  const timed = useTimedSteps(verifying ? VERIFY_LABELS : [], 700)

  async function verify() {
    setVerifying(true)
    const result = await eligibilityService.verifyPan(value, profile.fullName)
    setValue(result.panNumber)
    setPan({
      panNumber: result.panNumber,
      verified: true,
      holderName: result.holderName,
    })
    setDone(true)
    setVerifying(false)
  }

  return (
    <Screen
      title="PAN verification"
      subtitle="Enter your PAN to verify your identity."
      onBack={() => navigate(ROUTES.PROFILE)}
      footer={
        done ? (
          <Button
            onClick={() => {
              setCurrentStep('address')
              navigate(ROUTES.ADDRESS)
            }}
          >
            Continue
          </Button>
        ) : (
          <Button onClick={verify} loading={verifying}>
            Verify
          </Button>
        )
      }
    >
      <div className="space-y-5 pt-2">
        <Input
          label="PAN number"
          value={value}
          maxLength={10}
          onChange={(event) => setValue(event.target.value.toUpperCase())}
          placeholder="ABCDE1234F"
          hint="Format: 5 letters, 4 digits, 1 letter"
        />
        {verifying ? (
          <div className="rounded-[22px] border border-line/70 bg-card p-4 card-shadow">
            <div className="mb-4 flex justify-center">
              <LottiePlayer name="loading" className="h-24 w-24" />
            </div>
            <ProcessingSteps steps={timed.steps} />
          </div>
        ) : null}
        {done ? (
          <motion.div
            initial={{ opacity: 0, transform: 'scale(0.96)' }}
            animate={{ opacity: 1, transform: 'scale(1)' }}
            className="rounded-[22px] bg-success-soft p-5 text-center"
          >
            <div className="mx-auto flex h-24 w-24 items-center justify-center">
              <LottiePlayer name="success" loop={false} className="h-24 w-24" />
            </div>
            <p className="mt-2 text-lg font-bold text-ink">Verified successfully</p>
            <p className="mt-1 text-sm text-muted">Name matched to {pan.holderName || profile.fullName.toUpperCase()}</p>
          </motion.div>
        ) : null}
      </div>
    </Screen>
  )
}
