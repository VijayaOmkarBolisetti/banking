import { useNavigate } from 'react-router-dom'
import { Building2, Gem, House } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Screen } from '../components/layout/Screen'
import {
  BUSINESS_TYPE_OPTIONS,
  COLLATERAL_TYPE_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
} from '../mock/data'
import { formatInr } from '../lib/format'
import { fillBusiness, fillCollateral, fillProperty } from '../lib/demoFill'
import { getProduct } from '../lib/loanProducts'
import { ROUTES } from '../navigation/routes'
import { useAppStore } from '../store/useAppStore'
import { logOperation } from '../store/useAdminStore'

/**
 * The one step that differs per product: property papers for home loans,
 * GST/turnover for business, collateral valuation for gold & vehicle.
 */
export function LoanDetailsFormScreen() {
  const navigate = useNavigate()
  const application = useAppStore((state) => state.application)
  const pendingQuote = useAppStore((state) => state.pendingQuote)
  const setPropertyDetails = useAppStore((state) => state.setPropertyDetails)
  const setBusinessDetails = useAppStore((state) => state.setBusinessDetails)
  const setCollateralDetails = useAppStore((state) => state.setCollateralDetails)

  const product = getProduct(application.productId ?? pendingQuote?.productId ?? 'home')

  const loanAmount = pendingQuote?.amount ?? product.defaultAmount

  function submit() {
    // Walkthrough build: blanks are filled with plausible values rather than
    // blocking, so the extra step never stalls a demo.
    if (product.extraStep === 'property') setPropertyDetails(fillProperty(application.property, loanAmount))
    if (product.extraStep === 'business') setBusinessDetails(fillBusiness(application.business))
    if (product.extraStep === 'collateral') {
      setCollateralDetails(fillCollateral(application.collateral, loanAmount))
    }

    logOperation('customer', 'kyc', `${product.name} details captured`, product.extraStep ?? 'details')
    navigate(ROUTES.LOAN_REVIEW)
  }

  return (
    <Screen
      title={TITLES[product.extraStep ?? 'property']}
      subtitle={SUBTITLES[product.extraStep ?? 'property']}
      onBack={() => navigate(`${ROUTES.LOAN_PRODUCTS}/${product.id}`)}
      footer={<Button onClick={submit} style={{ background: product.accent }}>Continue to review</Button>}
    >
      <Card className="mt-3 flex items-center gap-3" padding="md">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white"
          style={{ background: product.accent }}
        >
          {product.extraStep === 'property' ? (
            <House className="h-5 w-5" />
          ) : product.extraStep === 'business' ? (
            <Building2 className="h-5 w-5" />
          ) : (
            <Gem className="h-5 w-5" />
          )}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-bold text-ink">{product.name}</p>
          <p className="text-xs text-muted">Applying for {formatInr(loanAmount)}</p>
        </div>
      </Card>

      <div className="mt-4 space-y-4 pb-2">
        {product.extraStep === 'property' ? (
          <>
            <Select
              label="Property type"
              options={PROPERTY_TYPE_OPTIONS}
              value={application.property.propertyType}
              onChange={(event) =>
                setPropertyDetails({ propertyType: event.target.value as 'apartment' })
              }
            />
            <Input
              label="Property value"
              inputMode="numeric"
              prefix="₹"
              value={application.property.propertyValue === '' ? '' : String(application.property.propertyValue)}
              hint="We finance up to 80% of the property value"
              onChange={(event) => setPropertyDetails({ propertyValue: toNumber(event.target.value) })}
              placeholder="5000000"
            />
            <Input
              label="Your down payment"
              inputMode="numeric"
              prefix="₹"
              value={application.property.downPayment === '' ? '' : String(application.property.downPayment)}
              onChange={(event) => setPropertyDetails({ downPayment: toNumber(event.target.value) })}
              placeholder="1500000"
            />
            <Input
              label="Property city"
              value={application.property.city}
              onChange={(event) => setPropertyDetails({ city: event.target.value })}
              placeholder="Bengaluru"
            />
            <Input
              label="Builder / seller name"
              value={application.property.builderName}
              onChange={(event) => setPropertyDetails({ builderName: event.target.value })}
              placeholder="Optional"
            />
          </>
        ) : null}

        {product.extraStep === 'business' ? (
          <>
            <Input
              label="Business name"
              value={application.business.businessName}
              onChange={(event) => setBusinessDetails({ businessName: event.target.value })}
              placeholder="Sharma Traders"
            />
            <Select
              label="Business type"
              options={BUSINESS_TYPE_OPTIONS}
              value={application.business.businessType}
              onChange={(event) =>
                setBusinessDetails({ businessType: event.target.value as 'proprietorship' })
              }
            />
            <Input
              label="GSTIN"
              value={application.business.gstNumber}
              maxLength={15}
              hint="15 characters, for example 29ABCDE1234F1Z5"
              onChange={(event) => setBusinessDetails({ gstNumber: event.target.value.toUpperCase() })}
              placeholder="29ABCDE1234F1Z5"
            />
            <Input
              label="Annual turnover"
              inputMode="numeric"
              prefix="₹"
              value={application.business.annualTurnover === '' ? '' : String(application.business.annualTurnover)}
              onChange={(event) => setBusinessDetails({ annualTurnover: toNumber(event.target.value) })}
              placeholder="8000000"
            />
            <Input
              label="Years in operation"
              inputMode="numeric"
              value={
                application.business.yearsInOperation === ''
                  ? ''
                  : String(application.business.yearsInOperation)
              }
              onChange={(event) => setBusinessDetails({ yearsInOperation: toNumber(event.target.value) })}
              placeholder="5"
            />
          </>
        ) : null}

        {product.extraStep === 'collateral' ? (
          <>
            <Select
              label="What are you pledging?"
              options={COLLATERAL_TYPE_OPTIONS}
              value={application.collateral.collateralType}
              onChange={(event) =>
                setCollateralDetails({ collateralType: event.target.value as 'gold' })
              }
            />
            <Input
              label="Description"
              value={application.collateral.description}
              onChange={(event) => setCollateralDetails({ description: event.target.value })}
              placeholder={
                application.collateral.collateralType === 'vehicle'
                  ? 'Honda City 2021, petrol'
                  : '2 bangles and 1 chain, 45g total'
              }
            />
            <Input
              label="Estimated value"
              inputMode="numeric"
              prefix="₹"
              value={
                application.collateral.estimatedValue === ''
                  ? ''
                  : String(application.collateral.estimatedValue)
              }
              hint="We lend up to 80% of the valued amount"
              onChange={(event) => setCollateralDetails({ estimatedValue: toNumber(event.target.value) })}
              placeholder="400000"
            />
            {application.collateral.collateralType === 'gold' ? (
              <Input
                label="Purity"
                value={application.collateral.purity}
                onChange={(event) => setCollateralDetails({ purity: event.target.value })}
                placeholder="22K"
              />
            ) : (
              <Input
                label="Registration number"
                value={application.collateral.registrationNumber}
                onChange={(event) =>
                  setCollateralDetails({ registrationNumber: event.target.value.toUpperCase() })
                }
                placeholder="KA01AB1234"
              />
            )}
            <p className="rounded-2xl bg-warning-soft px-4 py-3 text-[13px] leading-5 text-amber-900">
              A valuation agent will confirm this at pickup. Final sanction may differ from the estimate.
            </p>
          </>
        ) : null}
      </div>
    </Screen>
  )
}

const TITLES: Record<'property' | 'business' | 'collateral', string> = {
  property: 'Property details',
  business: 'Business details',
  collateral: 'Collateral details',
}

const SUBTITLES: Record<'property' | 'business' | 'collateral', string> = {
  property: 'Tell us about the property you are financing.',
  business: 'We size your limit from your GST turnover.',
  collateral: 'What you pledge decides the sanctioned amount.',
}

function toNumber(raw: string): number | '' {
  const digits = raw.replace(/\D/g, '')
  return digits ? Number(digits) : ''
}
