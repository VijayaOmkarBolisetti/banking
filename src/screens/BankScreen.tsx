import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { ProcessingSteps } from '../components/ui/ProcessingSteps'
import { LottiePlayer } from '../components/ui/LottiePlayer'
import { Screen } from '../components/layout/Screen'
import { eligibilityService } from '../services/eligibilityService'
import { required, validateAccountNumber, validateIfsc } from '../lib/validation'
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
  const showToast = useAppStore((state) => state.showToast)
  const [form, setForm] = useState<BankDetails>({
    ...bank,
    accountHolderName: bank.accountHolderName || profile.fullName,
  })
  const [confirm, setConfirm] = useState(bank.accountNumber)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [verifying, setVerifying] = useState(false)
  const [done, setDone] = useState(bank.verified)
  const timed = useTimedSteps(verifying ? VERIFY_LABELS : [], 650)

  function update<K extends keyof BankDetails>(key: K, value: BankDetails[K]) {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: '' }))
  }

  function validateFields(): Record<string, string> {
    const next: Record<string, string> = {}
    const holderError = required(form.accountHolderName, 'Account holder name')
    if (holderError) next.accountHolderName = holderError
    const bankError = required(form.bankName, 'Bank name')
    if (bankError) next.bankName = bankError
    const accountError = validateAccountNumber(form.accountNumber)
    if (accountError) next.accountNumber = accountError
    if (!confirm.trim()) next.confirm = 'Re-enter your account number'
    else if (form.accountNumber !== confirm) next.confirm = 'Account numbers do not match'
    const ifscError = validateIfsc(form.ifscCode)
    if (ifscError) next.ifscCode = ifscError
    return next
  }

  async function verify() {
    const fieldErrors = validateFields()
    setErrors(fieldErrors)
    if (Object.keys(fieldErrors).length > 0) {
      const first = Object.values(fieldErrors)[0]
      showToast(first, 'error')
      return
    }

    setVerifying(true)
    const result = await eligibilityService.verifyBank(form)
    if (!result.success) {
      setVerifying(false)
      showToast(result.message, 'error')
      return
    }
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
          error={errors.accountHolderName}
          onChange={(event) => update('accountHolderName', event.target.value)}
        />
        <Input
          label="Bank name"
          value={form.bankName}
          error={errors.bankName}
          onChange={(event) => update('bankName', event.target.value)}
          placeholder="HDFC Bank"
        />
        <Input
          label="Account number"
          inputMode="numeric"
          value={form.accountNumber}
          error={errors.accountNumber}
          onChange={(event) => update('accountNumber', event.target.value.replace(/\D/g, ''))}
        />
        <Input
          label="Confirm account number"
          inputMode="numeric"
          value={confirm}
          error={errors.confirm}
          onChange={(event) => {
            setConfirm(event.target.value.replace(/\D/g, ''))
            setErrors((current) => ({ ...current, confirm: '' }))
          }}
        />
        <Input
          label="IFSC code"
          value={form.ifscCode}
          error={errors.ifscCode}
          onChange={(event) => update('ifscCode', event.target.value.toUpperCase())}
          placeholder="HDFC0001234"
          hint="11 characters, for example HDFC0001234"
        />
        {verifying ? (
          <div className="rounded-[22px] bg-white p-4 shadow-sm">
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
            className="rounded-[22px] bg-emerald-50 p-5 text-center"
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
