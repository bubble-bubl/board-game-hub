'use client'

import { motion } from 'framer-motion'
import type { Card } from '@board-hub/game-engine'

interface Props {
  card: Card
  size?: 'sm' | 'md' | 'lg'
  selected?: boolean
  disabled?: boolean
  faceDown?: boolean
  onClick?: () => void
  isMighty?: boolean
  isTrump?: boolean
  layoutId?: string
}

const SUIT_SYMBOLS: Record<string, string> = {
  spade: '♠',
  heart: '♥',
  diamond: '♦',
  club: '♣',
  joker: '🃏',
}

const SUIT_COLORS: Record<string, string> = {
  spade: '#1a1a2e',
  club: '#1a1a2e',
  heart: '#c0392b',
  diamond: '#c0392b',
  joker: '#6b21a8',
}

const SIZE_MAP = {
  sm: { width: 60, height: 90, rank: 'text-xs', symbol: 'text-2xl' },
  md: { width: 72, height: 108, rank: 'text-sm', symbol: 'text-3xl' },
  lg: { width: 88, height: 132, rank: 'text-base', symbol: 'text-4xl' },
}

export function PlayingCard({
  card,
  size = 'lg',
  selected = false,
  disabled = false,
  faceDown = false,
  onClick,
  isMighty = false,
  isTrump = false,
  layoutId,
}: Props) {
  const { width, height, rank: rankClass, symbol: symbolClass } = SIZE_MAP[size]
  const isJoker = card.suit === 'joker'
  const suitColor = SUIT_COLORS[card.suit] ?? '#1a1a2e'
  const suitSymbol = SUIT_SYMBOLS[card.suit] ?? '?'

  return (
    <motion.div
      layoutId={layoutId}
      onClick={disabled ? undefined : onClick}
      animate={{
        y: selected ? -20 : 0,
        scale: selected ? 1.05 : 1,
        opacity: disabled ? 0.4 : 1,
      }}
      whileHover={!disabled && onClick ? { y: selected ? -20 : -12 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      style={{ width, height, cursor: disabled ? 'default' : onClick ? 'pointer' : 'default' }}
      className={`
        relative rounded-lg select-none flex-shrink-0
        ${faceDown ? 'card-back' : 'card-face'}
        ${isMighty ? 'animate-mighty-glow ring-2 ring-gold-bright' : ''}
        ${isTrump && !isMighty ? 'ring-2 ring-trump-glow' : ''}
        ${selected ? 'shadow-card-hover' : 'shadow-card'}
      `}
    >
      {faceDown ? null : isJoker ? (
        <div className="absolute inset-0 flex items-center justify-center text-3xl pointer-events-none">
          🃏
        </div>
      ) : (
        <>
          {/* 좌상단 */}
          <div
            className={`absolute top-1 left-1.5 flex flex-col items-center leading-none pointer-events-none ${rankClass}`}
            style={{ color: suitColor }}
          >
            <span className="font-bold">{card.rank}</span>
            <span className="text-xs">{suitSymbol}</span>
          </div>

          {/* 중앙 심볼 */}
          <div
            className={`absolute inset-0 flex items-center justify-center pointer-events-none ${symbolClass}`}
            style={{ color: suitColor }}
          >
            {suitSymbol}
          </div>

          {/* 우하단 (180도) */}
          <div
            className={`absolute bottom-1 right-1.5 flex flex-col items-center leading-none pointer-events-none ${rankClass} rotate-180`}
            style={{ color: suitColor }}
          >
            <span className="font-bold">{card.rank}</span>
            <span className="text-xs">{suitSymbol}</span>
          </div>
        </>
      )}
    </motion.div>
  )
}
