import type { AddressDetails, UserProfile } from '../types'
import { isAdult, required, validateEmail } from '../lib/validation'
import { PINCODE_DIRECTORY } from '../mock/data'
import { simulateDelay } from './delay'

export interface ProfileSaveResult {
  success: boolean
  message: string
  errors?: Record<string, string>
}

export const profileService = {
  validateProfile(profile: UserProfile): Record<string, string> {
    const errors: Record<string, string> = {}
    const nameError = required(profile.fullName, 'Full name')
    if (nameError) errors.fullName = nameError
    else if (profile.fullName.trim().split(/\s+/).length < 2) {
      errors.fullName = 'Enter your full name'
    }

    if (!profile.dateOfBirth) errors.dateOfBirth = 'Select your date of birth'
    else if (!isAdult(profile.dateOfBirth)) errors.dateOfBirth = 'You must be 18 or older'

    if (!profile.gender) errors.gender = 'Select gender'

    const emailError = validateEmail(profile.email)
    if (emailError) errors.email = emailError

    if (!profile.employmentType) errors.employmentType = 'Select employment type'

    const income = Number(profile.monthlyIncome)
    if (!profile.monthlyIncome || Number.isNaN(income) || income < 5000) {
      errors.monthlyIncome = 'Enter a monthly income of at least ₹5,000'
    }

    return errors
  },

  validateAddress(address: AddressDetails): Record<string, string> {
    const errors: Record<string, string> = {}
    if (!/^\d{6}$/.test(address.pinCode)) errors.pinCode = 'Enter a valid 6-digit PIN code'
    if (!address.houseNumber.trim()) errors.houseNumber = 'Enter house / flat number'
    if (!address.street.trim()) errors.street = 'Enter street / area'
    if (!address.city.trim()) errors.city = 'Enter city'
    if (!address.state.trim()) errors.state = 'Enter state'
    if (!address.residentialStatus) errors.residentialStatus = 'Select residential status'
    return errors
  },

  lookupPin(pinCode: string): { city: string; state: string } | null {
    return PINCODE_DIRECTORY[pinCode] ?? null
  },

  async saveProfile(profile: UserProfile): Promise<ProfileSaveResult> {
    const errors = this.validateProfile(profile)
    if (Object.keys(errors).length > 0) {
      return { success: false, message: 'Please fix the highlighted fields', errors }
    }
    await simulateDelay(650)
    return { success: true, message: 'Profile saved' }
  },

  async saveAddress(address: AddressDetails): Promise<ProfileSaveResult> {
    const errors = this.validateAddress(address)
    if (Object.keys(errors).length > 0) {
      return { success: false, message: 'Please fix the highlighted fields', errors }
    }
    await simulateDelay(650)
    return { success: true, message: 'Address saved' }
  },
}
