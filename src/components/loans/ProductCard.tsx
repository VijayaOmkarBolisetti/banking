import { motion } from 'framer-motion'
import { ArrowRight, Clock } from 'lucide-react'
import type { LoanProduct } from '../../types'
import { formatInrShort } from '../../lib/format'
import { formatTenure } from '../../lib/loanProducts'
import { productIcon } from './ProductIcon'

interface ProductCardProps {
  product: LoanProduct
  rate: number
  index?: number
  onSelect: () => void
}

/**
 * Photographic product tile. The image sits behind a fixed scrim so the
 * headline stays legible whichever photo ships with the product.
 */
export function ProductCard({ product, rate, index = 0, onSelect }: ProductCardProps) {
  const Icon = productIcon(product.icon)
  const longestTenure = product.tenures[product.tenures.length - 1]

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      className="lift group relative w-full overflow-hidden rounded-[26px] text-left card-shadow focus-visible:ring-4 focus-visible:ring-primary-ring focus-visible:outline-none"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: [0.23, 1, 0.32, 1] }}
      whileTap={{ scale: 0.985 }}
    >
      <img
        src={product.photo}
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />
      <span className="photo-scrim absolute inset-0" />

      <span className="relative flex h-full min-h-[210px] flex-col justify-between p-5 text-white sm:min-h-[230px] lg:min-h-[250px]">
        <span className="flex items-start justify-between gap-3">
          <span
            className="flex h-11 w-11 items-center justify-center rounded-2xl backdrop-blur-sm"
            style={{ background: `${product.accent}dd` }}
          >
            <Icon className="h-5 w-5" />
          </span>
          {/* Solid dark pill rather than white/20 — the top of the scrim is
              light, so a translucent badge washes out on bright photos. */}
          <span className="shrink-0 rounded-full bg-slate-900/60 px-2.5 py-1 text-[11px] font-bold whitespace-nowrap backdrop-blur-sm">
            from {rate}% p.a.
          </span>
        </span>

        <span className="mt-6 block">
          <span className="block text-xl font-extrabold tracking-tight sm:text-[22px]">{product.name}</span>
          <span className="mt-1 block text-[13px] leading-5 text-white/80">{product.tagline}</span>

          <span className="mt-3.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] font-semibold text-white/75">
            <span>
              {formatInrShort(product.minAmount)} – {formatInrShort(product.maxAmount)}
            </span>
            <span className="h-1 w-1 rounded-full bg-white/40" />
            <span>up to {formatTenure(longestTenure)}</span>
            <span className="h-1 w-1 rounded-full bg-white/40" />
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {product.disbursalSla}
            </span>
          </span>

          <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-card px-3.5 py-2 text-[13px] font-bold text-ink transition-transform duration-200 group-hover:translate-x-0.5">
            Apply now
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </span>
      </span>
    </motion.button>
  )
}
