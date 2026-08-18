import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Screen } from '../components/layout/Screen'
import { EMPLOYMENT_OPTIONS, GENDER_OPTIONS } from '../mock/data'
import { profileService } from '../services/profileService'
import { ROUTES } from '../navigation/routes'
import { useAppStore } from '../store/useAppStore'
import type { EmploymentType, Gender, UserProfile } from '../types'

export function ProfileSetupScreen() {
  const navigate = useNavigate()
  const profile = useAppStore((state) => state.profile)
  const setProfile = useAppStore((state) => state.setProfile)
  const setCurrentStep = useAppStore((state) => state.setCurrentStep)
  const [form, setForm] = useState<UserProfile>(profile)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  function update<K extends keyof UserProfile>(key: K, value: UserProfile[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function submit() {
    setLoading(true)
    const result = await profileService.saveProfile(form)
    setLoading(false)
    if (!result.success) {
      setErrors(result.errors ?? {})
      return
    }
    setProfile(form)
    setCurrentStep('pan')
    navigate(ROUTES.PAN)
  }

  return (
    <Screen
      title="Basic profile"
      subtitle="Tell us a little about yourself to check eligibility."
      footer={
        <Button onClick={submit} loading={loading}>
          Continue
        </Button>
      }
    >
      <div className="space-y-4 pt-2">
        <Input
          label="Full name"
          value={form.fullName}
          error={errors.fullName}
          onChange={(event) => update('fullName', event.target.value)}
          placeholder="Vijay Sharma"
        />
        <Input
          label="Date of birth"
          type="date"
          value={form.dateOfBirth}
          error={errors.dateOfBirth}
          onChange={(event) => update('dateOfBirth', event.target.value)}
        />
        <Select
          label="Gender"
          options={GENDER_OPTIONS}
          value={form.gender}
          error={errors.gender}
          onChange={(event) => update('gender', event.target.value as Gender)}
        />
        <Input
          label="Email address"
          type="email"
          value={form.email}
          error={errors.email}
          onChange={(event) => update('email', event.target.value)}
          placeholder="you@email.com"
        />
        <Select
          label="Employment type"
          options={EMPLOYMENT_OPTIONS}
          value={form.employmentType}
          error={errors.employmentType}
          onChange={(event) => update('employmentType', event.target.value as EmploymentType)}
        />
        <Input
          label="Monthly income"
          inputMode="numeric"
          prefix="₹"
          value={form.monthlyIncome === '' ? '' : String(form.monthlyIncome)}
          error={errors.monthlyIncome}
          onChange={(event) => {
            const raw = event.target.value.replace(/\D/g, '')
            update('monthlyIncome', raw ? Number(raw) : '')
          }}
          placeholder="85000"
        />
      </div>
    </Screen>
  )
}
