import { useEffect, useState } from 'react'

export function useTimedSteps(labels: string[], interval = 750) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (index >= labels.length) return undefined
    const timer = window.setTimeout(() => setIndex((current) => current + 1), interval)
    return () => window.clearTimeout(timer)
  }, [index, interval, labels.length])

  const steps = labels.map((label, stepIndex) => ({
    label,
    status: (stepIndex < index ? 'done' : stepIndex === index ? 'active' : 'pending') as
      | 'done'
      | 'active'
      | 'pending',
  }))

  return {
    steps: index >= labels.length ? labels.map((label) => ({ label, status: 'done' as const })) : steps,
    done: index >= labels.length,
  }
}
