'use client'

import { useEffect, useState } from 'react'
import Particles, { initParticlesEngine } from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'

export function HubBackground() {
  const [init, setInit] = useState(false)

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine)
    }).then(() => setInit(true))
  }, [])

  if (!init) return null

  return (
    <Particles
      id="hub-particles"
      options={{
        background: { color: { value: 'transparent' } },
        fpsLimit: 60,
        particles: {
          number: { value: 25, density: { enable: true, width: 800 } },
          color: { value: ['#c9a84c', '#e74c3c', '#1a1a2e', '#c0392b'] },
          shape: {
            type: 'char',
            options: {
              char: { value: ['♠', '♥', '♦', '♣'], font: 'Arial', style: '', weight: '400' },
            },
          },
          opacity: { value: { min: 0.1, max: 0.35 } },
          size: { value: { min: 14, max: 30 } },
          move: {
            enable: true,
            speed: { min: 0.4, max: 1.2 },
            direction: 'none',
            random: true,
            straight: false,
            outModes: { default: 'out' },
          },
        },
        detectRetina: true,
      }}
      className="absolute inset-0 z-0"
    />
  )
}
