import { ProcessingSteps } from './ProcessingSteps'
import { LottiePlayer } from './LottiePlayer'

interface Step {
  label: string
  status: 'pending' | 'active' | 'done'
}

interface ProcessingLoaderProps {
  steps: Step[]
  title?: string
  subtitle?: string
  done?: boolean
}

export function ProcessingLoader({
  steps,
  title = 'Please wait',
  subtitle = 'This usually takes a few seconds.',
  done = false,
}: ProcessingLoaderProps) {
  return (
    <div className="flex flex-col items-center pt-4 pb-2 text-center">
      <div className="flex h-32 w-32 items-center justify-center">
        {done ? (
          <LottiePlayer name="success" loop={false} className="h-32 w-32" />
        ) : (
          <LottiePlayer name="loading" className="h-32 w-32" />
        )}
      </div>
      <h2 className="mt-2 text-lg font-extrabold text-ink">{title}</h2>
      <p className="mt-1 max-w-xs text-sm text-muted">{subtitle}</p>
      <div className="mt-6 w-full rounded-[24px] border border-line/70 bg-card p-5 card-shadow">
        <ProcessingSteps steps={steps} />
      </div>
    </div>
  )
}
