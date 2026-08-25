import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShieldCheck } from 'lucide-react'
import { Screen } from '../components/layout/Screen'
import { ProductCard } from '../components/loans/ProductCard'
import { LOAN_PRODUCTS } from '../lib/loanProducts'
import { formatInr } from '../lib/format'
import { applyRoute, ROUTES } from '../navigation/routes'
import { useAppStore } from '../store/useAppStore'
import { useConfigStore } from '../store/useConfigStore'

export function LoanProductsScreen() {
  const navigate = useNavigate()
  const credit = useAppStore((state) => state.credit)
  const selectProduct = useAppStore((state) => state.selectProduct)
  const productRates = useConfigStore((state) => state.productRates)

  return (
    <Screen
      title="Choose a loan"
      subtitle="Five products, one application. Pick the one that fits."
      onBack={() => navigate(ROUTES.DASHBOARD)}
      wide
    >
      <motion.div
        className="mt-3 flex items-center gap-3 rounded-[22px] border border-primary/15 bg-primary-soft px-4 py-3"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <ShieldCheck className="h-5 w-5 shrink-0 text-primary" />
        <p className="text-[13px] leading-5 text-ink">
          Your KYC is verified, so approval is instant. Pre-approved limit{' '}
          <span className="font-bold">{formatInr(credit.available)}</span> on unsecured products.
        </p>
      </motion.div>

      <div className="mt-4 grid gap-3.5 sm:gap-4 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-4">
        {LOAN_PRODUCTS.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            index={index}
            rate={productRates[product.id] ?? product.interestRate}
            onSelect={() => {
              selectProduct(product.id)
              navigate(applyRoute(product.id))
            }}
          />
        ))}
      </div>

      <div className="mt-6 grid gap-3 pb-4 md:grid-cols-2 xl:grid-cols-4">
        {LOAN_PRODUCTS.map((product) => (
          <div key={product.id} className="card-shadow rounded-[20px] border border-line/70 bg-card p-4">
            <p className="text-[11px] font-bold tracking-[0.14em] text-muted uppercase">{product.shortName}</p>
            <ul className="mt-3 space-y-2">
              {product.highlights.map((item) => (
                <li key={item} className="flex items-start gap-2 text-[13px] leading-5 text-ink">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: product.accent }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Screen>
  )
}
