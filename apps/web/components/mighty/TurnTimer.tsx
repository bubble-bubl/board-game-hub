'use client'

import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'

interface Props {
  isActive: boolean
  duration?: number
  onTimeout?: () => void
}

export function TurnTimer({ isActive, duration = 30, onTimeout }: Props) {
  const [remaining, setRemaining] = useState(duration)
  const onTimeoutRef = useRef(onTimeout)
  onTimeoutRef.current = onTimeout

  useEffect(() => {
    if (!isActive) {
      setRemaining(duration)
      return
    }

    setRemaining(duration)
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          onTimeoutRef.current?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isActive, duration])

  if (!isActive) return null

  const progress = remaining / duration
  const circumference = 2 * Math.PI * 20
  const strokeDashoffset = circumference * (1 - progress)
  const color = remaining > 10 ? '#c9a84c' : remaining > 5 ? '#e67e22' : '#e74c3c'

  return (
    <div className="flex items-center gap-2">
      <svg width="48" height="48" className="rotate-[-90deg]">
        <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
        <motion.circle
          cx="24"
          cy="24"
          r="20"
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
        />
      </svg>
      <span
        className="text-sm font-bold font-inter tabular-nums"
        style={{ color }}
      >
        {remaining}s
      </span>
    </div>
  )
}
