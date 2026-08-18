import lottie, { type AnimationItem } from 'lottie-web'
import { Check, Loader2 } from 'lucide-react'
import { useEffect, useRef } from 'react'
import loadingAnimation from '../../assets/lottie/loading.json'

type LottieName = 'loading' | 'success'

interface LottiePlayerProps {
  name: LottieName
  className?: string
  loop?: boolean
}

export function LottiePlayer({ name, className = 'h-28 w-28', loop = true }: LottiePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<AnimationItem | null>(null)

  useEffect(() => {
    if (name !== 'loading') return undefined
    const container = containerRef.current
    if (!container) return undefined

    animationRef.current?.destroy()
    animationRef.current = lottie.loadAnimation({
      container,
      renderer: 'svg',
      loop,
      autoplay: true,
      animationData: loadingAnimation,
    })

    return () => {
      animationRef.current?.destroy()
      animationRef.current = null
    }
  }, [name, loop])

  if (name === 'success') {
    return (
      <div className={`flex items-center justify-center ${className}`} role="img" aria-label="Success">
        <div className="flex h-full w-full items-center justify-center rounded-full bg-emerald-500 text-white shadow-md">
          <Check className="h-[48%] w-[48%]" strokeWidth={3.5} />
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={`lottie-player ${className}`}
      role="img"
      aria-label="Loading"
    />
  )
}

export function LottieFallback({ className = 'h-28 w-28' }: { className?: string }) {
  return (
    <div className={`${className} flex items-center justify-center text-primary`}>
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  )
}
