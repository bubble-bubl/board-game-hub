'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { Suit, Bid } from '@board-hub/game-engine'

interface Props {
  currentBid: Bid | null
  playerNames: Record<string, string>
  onBid: (count: number, trump: Suit | 'no-trump') => void
  onPass: () => void
  disabled?: boolean
}

const SUITS: Array<{ value: Suit | 'no-trump'; label: string; color: string }> = [
  { value: 'spade', label: '♠', color: '#1a1a2e' },
  { value: 'heart', label: '♥', color: '#c0392b' },
  { value: 'diamond', label: '♦', color: '#c0392b' },
  { value: 'club', label: '♣', color: '#1a1a2e' },
  { value: 'no-trump', label: 'NT', color: '#c9a84c' },
]

export function BidPanel({ currentBid, playerNames, onBid, onPass, disabled = false }: Props) {
  const [count, setCount] = useState(currentBid ? currentBid.count + 1 : 13)
  const [trump, setTrump] = useState<Suit | 'no-trump'>('spade')
  const [timeLeft, setTimeLeft] = useState(30)

  useEffect(() => {
    setTimeLeft(30)
    const interval = setInterval(() => {
      setTimeLeft((t) => (t <= 1 ? 0 : t - 1))
    }, 1000)
    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentBid])

  // 타임아웃 시 자동 패스 (렌더링과 분리)
  useEffect(() => {
    if (timeLeft === 0 && !disabled) {
      onPass()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft])

  const minCount = currentBid ? currentBid.count + 1 : 13

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-board border border-gold/30 rounded-xl p-4 w-72 shadow-2xl"
    >
      {/* 현재 최고 입찰 */}
      <div className="text-center mb-3">
        {currentBid ? (
          <p className="text-gold text-sm font-cinzel">
            최고 입찰: {playerNames[currentBid.playerId] ?? currentBid.playerId} —{' '}
            {currentBid.count}{' '}
            {currentBid.trump === 'no-trump'
              ? 'NT'
              : currentBid.trump
              ? SUITS.find((s) => s.value === currentBid.trump)?.label
              : ''}
          </p>
        ) : (
          <p className="text-text/50 text-sm">첫 입찰을 시작하세요</p>
        )}
      </div>

      {/* 타이머 */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-text/50 mb-1">
          <span>남은 시간</span>
          <span className={timeLeft <= 10 ? 'text-trump-glow animate-pulse' : ''}>{timeLeft}s</span>
        </div>
        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gold rounded-full"
            animate={{ width: `${(timeLeft / 30) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* 공약 수 */}
      <div className="mb-3">
        <p className="text-text/60 text-xs mb-2">공약 수</p>
        <div className="flex flex-wrap gap-1">
          {Array.from({ length: 8 }, (_, i) => i + 13).map((n) => (
            <button
              key={n}
              onClick={() => setCount(n)}
              disabled={n < minCount}
              className={`
                w-8 h-8 rounded text-sm font-bold transition-all
                ${count === n ? 'bg-gold text-background' : 'bg-white/10 text-text hover:bg-white/20'}
                ${n < minCount ? 'opacity-30 cursor-not-allowed' : ''}
              `}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* 트럼프 수트 */}
      <div className="mb-4">
        <p className="text-text/60 text-xs mb-2">트럼프</p>
        <div className="flex gap-2">
          {SUITS.map((s) => (
            <button
              key={s.value}
              onClick={() => setTrump(s.value)}
              className={`
                flex-1 h-10 rounded text-lg font-bold transition-all
                ${trump === s.value ? 'ring-2 ring-gold bg-white/20' : 'bg-white/10 hover:bg-white/20'}
              `}
              style={{ color: s.color === '#1a1a2e' ? '#e8e8f0' : s.color }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* 버튼 */}
      <div className="flex gap-2">
        <button
          onClick={onPass}
          disabled={disabled}
          className="flex-1 py-2 rounded-lg bg-white/10 text-text hover:bg-white/20 transition-all disabled:opacity-50 text-sm"
        >
          패스
        </button>
        <button
          onClick={() => onBid(count, trump)}
          disabled={disabled || count < minCount}
          className="flex-1 py-2 rounded-lg bg-gold text-background font-bold hover:bg-gold-bright transition-all disabled:opacity-50 text-sm"
        >
          입찰
        </button>
      </div>
    </motion.div>
  )
}
