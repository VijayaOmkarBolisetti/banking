import type { BankDetails, CreditAccount, PanDetails, UserProfile } from '../types'
import { IFSC_DIRECTORY } from '../mock/data'
import { fillBank, fillPan } from '../lib/demoFill'
import { getProductConfig } from '../store/useConfigStore'
import { simulateDelay } from './delay'

export interface StepResult {
  success: boolean
  message: string
}

/** Walkthrough build: verification always succeeds, filling blanks as needed. */
export const eligibilityService = {
  async verifyPan(panNumber: string, fullName: string): Promise<PanDetails & StepResult> {
    await simulateDelay(2000)
    const holderName = fullName.trim() || 'VIJAY SHARMA'
    return {
      panNumber: fillPan(panNumber),
      verified: true,
      holderName: holderName.toUpperCase(),
      success: true,
      message: 'PAN verified successfully',
    }
  },

  async verifyBank(bank: BankDetails): Promise<BankDetails & StepResult> {
    await simulateDelay(1600)
    const filled = fillBank(bank, bank.accountHolderName)
    const listed = IFSC_DIRECTORY[filled.ifscCode]
    return {
      ...filled,
      bankName: listed?.bankName ?? filled.bankName,
      success: true,
      message: 'Bank account verified',
    }
  },

  async calculateEligibility(_profile: UserProfile): Promise<CreditAccount & StepResult> {
    await simulateDelay(200)
    const config = getProductConfig()
    return {
      limit: config.creditLimit,
      used: 0,
      available: config.creditLimit,
      interestRate: config.interestRate,
      success: true,
      message: 'You are eligible for credit',
    }
  },
}
