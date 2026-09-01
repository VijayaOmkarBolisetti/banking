import { AnimatePresence, motion } from 'framer-motion'
import { Check, Loader2 } from 'lucide-react'

interface Step {
  label: string
  status: 'pending' | 'active' | 'done'
}

interface ProcessingStepsProps {
  steps: Step[]
}

export function ProcessingSteps({ steps }: ProcessingStepsProps) {
  return (
    <div className="space-y-3">
      {steps.map((step) => (
        <div key={step.label} className="flex items-center gap-3">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
              step.status === 'done'
                ? 'bg-emerald-500 text-white'
                : step.status === 'active'
                  ? 'bg-primary text-white'
                  : 'bg-subtle text-faint'
            }`}
          >
            {step.status === 'done' ? <Check className="h-4 w-4" /> : null}
            {step.status === 'active' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            {step.status === 'pending' ? <span className="h-1.5 w-1.5 rounded-full bg-line" /> : null}
          </div>
          <AnimatePresence mode="wait">
            <motion.p
              key={`${step.label}-${step.status}`}
              initial={{ opacity: 0.6 }}
              animate={{ opacity: 1 }}
              className={`text-sm font-medium ${
                step.status === 'pending' ? 'text-faint' : 'text-ink'
              }`}
            >
              {step.label}
            </motion.p>
          </AnimatePresence>
        </div>
      ))}
    </div>
  )
}
