import type { BankDetails, CreditAccount, PanDetails, UserProfile } from '../types'
import { validateAccountNumber, validateIfsc, validatePan } from '../lib/validation'
import { IFSC_DIRECTORY } from '../mock/data'
import { getProductConfig } from '../store/useConfigStore'
import { simulateDelay } from './delay'

export interface StepResult {
  success: boolean
  message: string
}

export const eligibilityService = {
  async verifyPan(panNumber: string, fullName: string): Promise<PanDetails & StepResult> {
    const error = validatePan(panNumber)
    if (error) {
      return {
        panNumber,
        verified: false,
        holderName: '',
        success: false,
        message: error,
      }
    }

    await simulateDelay(2200)
    const holderName = fullName.trim() || 'VIJAY SHARMA'
    return {
      panNumber: panNumber.toUpperCase(),
      verified: true,
      holderName: holderName.toUpperCase(),
      success: true,
      message: 'PAN verified successfully',
    }
  },

  async verifyBank(bank: BankDetails): Promise<(BankDetails & StepResult) | (StepResult & { success: false })> {
    const holderError = bank.accountHolderName.trim() ? null : 'Enter account holder name'
    const bankError = bank.bankName.trim() ? null : 'Enter bank name'
    const accountError = validateAccountNumber(bank.accountNumber)
    const ifscError = validateIfsc(bank.ifscCode)

    const message = holderError || bankError || accountError || ifscError
    if (message) {
      return { success: false, message }
    }

    await simulateDelay(1700)
    const ifsc = bank.ifscCode.toUpperCase()
    const listed = IFSC_DIRECTORY[ifsc]
    return {
      ...bank,
      ifscCode: ifsc,
      bankName: listed?.bankName ?? bank.bankName,
      verified: true,
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
