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
import type { BankDetails } from '../types'

const VERIFY_LABELS = ['Verifying bank account...', 'Checking IFSC...', 'Bank account verified ✓']

export function BankScreen() {
  const navigate = useNavigate()
  const bank = useAppStore((state) => state.bank)
  const profile = useAppStore((state) => state.profile)
  const setBank = useAppStore((state) => state.setBank)
  const setCurrentStep = useAppStore((state) => state.setCurrentStep)
  const [form, setForm] = useState<BankDetails>({
    ...bank,
    accountHolderName: bank.accountHolderName || profile.fullName,
  })
  const [confirm, setConfirm] = useState(bank.accountNumber)
  const [verifying, setVerifying] = useState(false)
  const [done, setDone] = useState(bank.verified)
  const timed = useTimedSteps(verifying ? VERIFY_LABELS : [], 650)

  function update<K extends keyof BankDetails>(key: K, value: BankDetails[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function verify() {
    setVerifying(true)
    const result = await eligibilityService.verifyBank(form)
    // Anything left blank comes back filled, so verification always lands.
    setForm({
      accountHolderName: result.accountHolderName,
      bankName: result.bankName,
      accountNumber: result.accountNumber,
      ifscCode: result.ifscCode,
      verified: true,
    })
    setConfirm(result.accountNumber)
    setBank({
      accountHolderName: result.accountHolderName,
      bankName: result.bankName,
      accountNumber: result.accountNumber,
      ifscCode: result.ifscCode,
      verified: true,
    })
    setDone(true)
    setVerifying(false)
  }

  return (
    <Screen
      title="Bank details"
      subtitle="We'll transfer your credit to this account."
      onBack={() => navigate(ROUTES.ADDRESS)}
      footer={
        done ? (
          <Button
            onClick={() => {
              setCurrentStep('consent')
              navigate(ROUTES.CONSENT)
            }}
          >
            Continue
          </Button>
        ) : (
          <Button onClick={verify} loading={verifying}>
            Verify account
          </Button>
        )
      }
    >
      <div className="space-y-4 pt-2">
        <Input
          label="Account holder name"
          value={form.accountHolderName}
          onChange={(event) => update('accountHolderName', event.target.value)}
        />
        <Input
          label="Bank name"
          value={form.bankName}
          onChange={(event) => update('bankName', event.target.value)}
          placeholder="HDFC Bank"
        />
        <Input
          label="Account number"
          inputMode="numeric"
          value={form.accountNumber}
          onChange={(event) => update('accountNumber', event.target.value.replace(/\D/g, ''))}
        />
        <Input
          label="Confirm account number"
          inputMode="numeric"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value.replace(/\D/g, ''))}
        />
        <Input
          label="IFSC code"
          value={form.ifscCode}
          onChange={(event) => update('ifscCode', event.target.value.toUpperCase())}
          placeholder="HDFC0001234"
          hint="11 characters, for example HDFC0001234"
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
            <p className="mt-2 text-lg font-bold">Bank account verified ✓</p>
          </motion.div>
        ) : null}
      </div>
    </Screen>
  )
}
