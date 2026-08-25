import type { AddressDetails, UserProfile } from '../types'
import { PINCODE_DIRECTORY } from '../mock/data'
import { fillAddress, fillProfile } from '../lib/demoFill'
import { simulateDelay } from './delay'

export interface ProfileSaveResult {
  success: boolean
  message: string
  /** Completed record — blanks replaced with demo data. */
  profile?: UserProfile
  address?: AddressDetails
}

/**
 * Walkthrough build: saving never fails. Anything left blank is filled from
 * the demo record so the presenter can tab straight through a form.
 */
export const profileService = {
  lookupPin(pinCode: string): { city: string; state: string } | null {
    return PINCODE_DIRECTORY[pinCode] ?? null
  },

  async saveProfile(profile: UserProfile): Promise<ProfileSaveResult> {
    await simulateDelay(600)
    return { success: true, message: 'Profile saved', profile: fillProfile(profile) }
  },

  async saveAddress(address: AddressDetails): Promise<ProfileSaveResult> {
    await simulateDelay(600)
    return { success: true, message: 'Address saved', address: fillAddress(address) }
  },
}
