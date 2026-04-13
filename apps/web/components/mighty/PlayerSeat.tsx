'use client'

import { motion } from 'framer-motion'
import type { Player } from '@board-hub/game-engine'

interface Props {
  player: Player
  isCurrentTurn: boolean
  isPresident: boolean
  isFriend: boolean
  cardCount: number
}

export function PlayerSeat({ player, isCurrentTurn, isPresident, isFriend, cardCount }: Props) {
  return (
    <motion.div
      animate={{ scale: isCurrentTurn ? 1.05 : 1 }}
      className={`
        flex flex-col items-center gap-1 p-2 rounded-xl transition-all
        ${isCurrentTurn ? 'bg-gold/10 ring-2 ring-gold' : ''}
      `}
    >
      {/* 아바타 */}
      <div
        className={`
          w-10 h-10 rounded-full flex items-center justify-center text-lg
          ${isPresident ? 'bg-gold text-background' : isFriend ? 'bg-blue-500 text-white' : 'bg-white/10 text-text'}
        `}
      >
        {isPresident ? '👑' : isFriend ? '🤝' : player.isAI ? '🤖' : '😊'}
      </div>

      {/* 이름 */}
      <p className="text-text text-xs font-inter truncate max-w-16">{player.name}</p>

      {/* 카드 수 */}
      <div className="flex gap-0.5">
        {Array.from({ length: Math.min(cardCount, 10) }).map((_, i) => (
          <div key={i} className="w-1.5 h-4 bg-board border border-gold/30 rounded-sm" />
        ))}
      </div>

      {isCurrentTurn && (
        <motion.div
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
          className="text-gold text-xs"
        >
          ●
        </motion.div>
      )}
    </motion.div>
  )
}
