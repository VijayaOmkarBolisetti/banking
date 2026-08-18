import lottie, { type AnimationItem } from 'lottie-web'
import { Loader2 } from 'lucide-react'
import { useEffect, useRef } from 'react'
import loadingAnimation from '../../assets/lottie/loading.json'
import successAnimation from '../../assets/lottie/success.json'

type LottieName = 'loading' | 'success'

const animations: Record<LottieName, object> = {
  loading: loadingAnimation,
  success: successAnimation,
}

interface LottiePlayerProps {
  name: LottieName
  className?: string
  loop?: boolean
}

export function LottiePlayer({ name, className = 'h-28 w-28', loop = true }: LottiePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<AnimationItem | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined

    animationRef.current?.destroy()
    animationRef.current = lottie.loadAnimation({
      container,
      renderer: 'svg',
      loop,
      autoplay: true,
      animationData: animations[name],
    })

    return () => {
      animationRef.current?.destroy()
      animationRef.current = null
    }
  }, [name, loop])

  return (
    <div
      ref={containerRef}
      className={`lottie-player ${className}`}
      role="img"
      aria-label={name === 'success' ? 'Success' : 'Loading'}
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
