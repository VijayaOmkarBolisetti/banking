import type {
  AddressDetails,
  BankDetails,
  BusinessDetails,
  CollateralDetails,
  PropertyDetails,
  UserProfile,
} from '../types'
import { DEMO_ADDRESS, DEMO_BANK, DEMO_PAN, DEMO_PROFILE } from '../mock/data'

/**
 * This build is a client walkthrough, not a live lender — a presenter should
 * never be stopped by a required field. Every form runs its input through the
 * matching filler, which substitutes realistic demo data for anything left
 * blank so "Continue" always advances with sensible-looking values.
 *
 * Format helpers (validation.ts) are still used for live hints while typing;
 * they just no longer block submission.
 */

function text(value: string, fallback: string): string {
  return value.trim() ? value.trim() : fallback
}

function num(value: number | '', fallback: number): number {
  const parsed = Number(value)
  return value !== '' && !Number.isNaN(parsed) && parsed > 0 ? parsed : fallback
}

export function fillProfile(profile: UserProfile): UserProfile {
  return {
    fullName: text(profile.fullName, DEMO_PROFILE.fullName),
    dateOfBirth: text(profile.dateOfBirth, DEMO_PROFILE.dateOfBirth),
    gender: profile.gender || DEMO_PROFILE.gender,
    email: text(profile.email, DEMO_PROFILE.email),
    employmentType: profile.employmentType || DEMO_PROFILE.employmentType,
    monthlyIncome: num(profile.monthlyIncome, Number(DEMO_PROFILE.monthlyIncome)),
  }
}

export function fillAddress(address: AddressDetails): AddressDetails {
  return {
    pinCode: text(address.pinCode, DEMO_ADDRESS.pinCode),
    houseNumber: text(address.houseNumber, DEMO_ADDRESS.houseNumber),
    street: text(address.street, DEMO_ADDRESS.street),
    city: text(address.city, DEMO_ADDRESS.city),
    state: text(address.state, DEMO_ADDRESS.state),
    residentialStatus: address.residentialStatus || DEMO_ADDRESS.residentialStatus,
  }
}

export function fillBank(bank: BankDetails, holderName: string): BankDetails {
  return {
    accountHolderName: text(bank.accountHolderName, holderName || DEMO_BANK.accountHolderName),
    bankName: text(bank.bankName, DEMO_BANK.bankName),
    accountNumber: text(bank.accountNumber, DEMO_BANK.accountNumber),
    ifscCode: text(bank.ifscCode, DEMO_BANK.ifscCode).toUpperCase(),
    verified: true,
  }
}

export function fillPan(panNumber: string): string {
  return text(panNumber, DEMO_PAN.panNumber).toUpperCase()
}

export function fillProperty(details: PropertyDetails, loanAmount: number): PropertyDetails {
  const value = num(details.propertyValue, Math.round(loanAmount * 1.35))
  return {
    propertyType: details.propertyType || 'apartment',
    propertyValue: value,
    downPayment: details.downPayment === '' ? Math.round(value * 0.2) : Number(details.downPayment),
    city: text(details.city, DEMO_ADDRESS.city),
    builderName: details.builderName,
  }
}

export function fillBusiness(details: BusinessDetails): BusinessDetails {
  return {
    businessName: text(details.businessName, 'Sharma Traders'),
    businessType: details.businessType || 'proprietorship',
    gstNumber: text(details.gstNumber, '29ABCDE1234F1Z5').toUpperCase(),
    annualTurnover: num(details.annualTurnover, 8_000_000),
    yearsInOperation: num(details.yearsInOperation, 5),
  }
}

export function fillCollateral(details: CollateralDetails, loanAmount: number): CollateralDetails {
  const type = details.collateralType || 'gold'
  return {
    collateralType: type,
    description: text(
      details.description,
      type === 'vehicle' ? 'Honda City 2021, petrol' : '2 bangles and 1 chain, 45g total',
    ),
    estimatedValue: num(details.estimatedValue, Math.round(loanAmount * 1.4)),
    purity: text(details.purity, type === 'gold' ? '22K' : ''),
    registrationNumber: text(details.registrationNumber, type === 'vehicle' ? 'KA01AB1234' : ''),
  }
}
