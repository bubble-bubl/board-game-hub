'use client'

import { motion } from 'framer-motion'
import type { Card, Suit } from '@board-hub/game-engine'
import { PlayingCard } from './PlayingCard'

interface Props {
  cards: Card[]
  validCards: Card[]
  selectedCard: Card | null
  onSelect: (card: Card | null) => void
  trump: Suit | 'no-trump' | null
  disabled?: boolean
}

export function CardHand({ cards, validCards, selectedCard, onSelect, trump, disabled = false }: Props) {
  const count = cards.length
  const maxAngle = 30
  const angleStep = count > 1 ? (maxAngle * 2) / (count - 1) : 0
  const overlapRatio = 0.55
  const cardWidth = 88

  return (
    <div className={`relative flex items-end justify-center ${disabled ? 'pointer-events-none' : ''}`} style={{ height: 160, minWidth: count * cardWidth * (1 - overlapRatio) + cardWidth }}>
      {cards.map((card, i) => {
        const angle = count > 1 ? -maxAngle + angleStep * i : 0
        const offsetX = i * cardWidth * (1 - overlapRatio)
        const isValid = validCards.some((v) => v.id === card.id)
        const isSelected = selectedCard?.id === card.id
        const isMighty = (trump !== 'spade' && trump !== null && card.id === 'spade-A') || card.id === 'spade-A'
        const isTrump = trump !== null && trump !== 'no-trump' && card.suit === trump

        return (
          <motion.div
            key={card.id}
            style={{
              position: 'absolute',
              left: offsetX,
              bottom: 0,
              rotate: angle,
              transformOrigin: 'bottom center',
              zIndex: isSelected ? 50 : i,
            }}
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.05, type: 'spring', stiffness: 200, damping: 18 }}
          >
            <PlayingCard
              card={card}
              size="lg"
              selected={isSelected}
              disabled={disabled || (!isValid && validCards.length > 0)}
              isMighty={isMighty}
              isTrump={isTrump}
              onClick={() => onSelect(isSelected ? null : card)}
            />
          </motion.div>
        )
      })}
    </div>
  )
}
