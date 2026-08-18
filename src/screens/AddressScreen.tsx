import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Screen } from '../components/layout/Screen'
import { RESIDENTIAL_OPTIONS } from '../mock/data'
import { profileService } from '../services/profileService'
import { ROUTES } from '../navigation/routes'
import { useAppStore } from '../store/useAppStore'
import type { AddressDetails, ResidentialStatus } from '../types'

export function AddressScreen() {
  const navigate = useNavigate()
  const address = useAppStore((state) => state.address)
  const setAddress = useAppStore((state) => state.setAddress)
  const setCurrentStep = useAppStore((state) => state.setCurrentStep)
  const [form, setForm] = useState<AddressDetails>(address)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  function update<K extends keyof AddressDetails>(key: K, value: AddressDetails[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function handlePin(pinCode: string) {
    const lookup = profileService.lookupPin(pinCode)
    setForm((current) => ({
      ...current,
      pinCode,
      city: lookup?.city ?? current.city,
      state: lookup?.state ?? current.state,
    }))
  }

  async function submit() {
    setLoading(true)
    const result = await profileService.saveAddress(form)
    setLoading(false)
    if (!result.success) {
      setErrors(result.errors ?? {})
      return
    }
    setAddress(form)
    setCurrentStep('bank')
    navigate(ROUTES.BANK)
  }

  return (
    <Screen
      title="Address details"
      subtitle="This should match your current residential address."
      onBack={() => navigate(ROUTES.PAN)}
      footer={
        <Button onClick={submit} loading={loading}>
          Continue
        </Button>
      }
    >
      <div className="space-y-4 pt-2">
        <Input
          label="PIN code"
          inputMode="numeric"
          maxLength={6}
          value={form.pinCode}
          error={errors.pinCode}
          onChange={(event) => handlePin(event.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="560038"
          hint="City and state fill automatically for common PIN codes"
        />
        <Input
          label="House / Flat number"
          value={form.houseNumber}
          error={errors.houseNumber}
          onChange={(event) => update('houseNumber', event.target.value)}
        />
        <Input
          label="Street / Area"
          value={form.street}
          error={errors.street}
          onChange={(event) => update('street', event.target.value)}
        />
        <Input
          label="City"
          value={form.city}
          error={errors.city}
          onChange={(event) => update('city', event.target.value)}
        />
        <Input
          label="State"
          value={form.state}
          error={errors.state}
          onChange={(event) => update('state', event.target.value)}
        />
        <Select
          label="Residential status"
          options={RESIDENTIAL_OPTIONS}
          value={form.residentialStatus}
          error={errors.residentialStatus}
          onChange={(event) => update('residentialStatus', event.target.value as ResidentialStatus)}
        />
      </div>
    </Screen>
  )
}
