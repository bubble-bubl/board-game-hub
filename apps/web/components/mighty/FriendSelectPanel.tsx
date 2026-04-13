'use client'

import { motion } from 'framer-motion'
import type { Card } from '@board-hub/game-engine'
import { PlayingCard } from './PlayingCard'

interface Props {
  hand: Card[]
  onSelectFriend: (card: Card) => void
}

export function FriendSelectPanel({ hand, onSelectFriend }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-board border border-gold/30 rounded-xl p-4 shadow-2xl"
    >
      <h3 className="font-cinzel text-gold text-sm mb-1 text-center">프렌드 카드 선언</h3>
      <p className="text-text/50 text-xs text-center mb-3">파트너 카드를 선택하세요</p>
      <div className="flex flex-wrap gap-2 justify-center">
        {hand.map((card) => (
          <PlayingCard
            key={card.id}
            card={card}
            size="sm"
            onClick={() => onSelectFriend(card)}
          />
        ))}
      </div>
    </motion.div>
  )
}
