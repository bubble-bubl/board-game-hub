'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Particles, { initParticlesEngine } from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'

interface Props {
  winner: 'president' | 'opposition' | null
  onClose: () => void
}

export function WinEffect({ winner, onClose }: Props) {
  const [init, setInit] = useState(false)

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine)
    }).then(() => setInit(true))
  }, [])

  const isPresident = winner === 'president'

  const particleOptions = {
    particles: {
      number: { value: 120 },
      color: {
        value: isPresident ? ['#ffd700', '#c9a84c', '#fff8dc'] : ['#60a5fa', '#a78bfa', '#e2e8f0'],
      },
      shape: { type: 'star' },
      opacity: { value: { min: 0.5, max: 1 } },
      size: { value: { min: 3, max: 8 } },
      move: {
        enable: true,
        speed: { min: 3, max: 8 },
        direction: 'top' as const,
        outModes: { default: 'out' as const },
      },
      life: { duration: { value: 3 } },
    },
    emitters: {
      direction: 'top' as const,
      life: { duration: 2, count: 1 },
      rate: { quantity: 60, delay: 0.1 },
      position: { x: 50, y: 100 },
    },
  }

  return (
    <AnimatePresence>
      {winner && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={onClose}
        >
          {init && (
            <Particles
              id="win-particles"
              options={particleOptions as Parameters<typeof Particles>[0]['options']}
              className="absolute inset-0"
            />
          )}

          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: [0.5, 1.2, 1.0], opacity: 1 }}
            transition={{ duration: 0.6, times: [0, 0.6, 1] }}
            className="relative z-10 text-center"
          >
            <motion.h1
              className={`font-cinzel text-5xl font-black mb-4 ${isPresident ? 'text-gold-bright' : 'text-blue-400'}`}
              style={{
                textShadow: isPresident
                  ? '0 0 30px #ffd700, 0 0 60px #ffd70088'
                  : '0 0 30px #60a5fa, 0 0 60px #60a5fa88',
              }}
            >
              {isPresident ? '주공팀 승리!' : '야당팀 승리!'}
            </motion.h1>
            <p className="text-text/70 text-sm mb-6">클릭하면 계속</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
