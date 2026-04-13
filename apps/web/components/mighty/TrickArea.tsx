'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { TrickCard } from '@board-hub/game-engine'
import { PlayingCard } from './PlayingCard'

interface Props {
  currentTrick: TrickCard[]
  playerIds: string[]  // index = seat position
  myPlayerId: string
}

// 5인 원형 배치: 내 기준 상대방 위치 (각도)
// seat 0 = 나 (하단), 1 = 우측, 2 = 우상단, 3 = 좌상단, 4 = 좌측
const POSITIONS = [
  { x: 0, y: 80 },      // 내 카드 (하단)
  { x: 90, y: 30 },     // 우
  { x: 60, y: -70 },    // 우상
  { x: -60, y: -70 },   // 좌상
  { x: -90, y: 30 },    // 좌
]

export function TrickArea({ currentTrick, playerIds, myPlayerId }: Props) {
  const myIdx = playerIds.indexOf(myPlayerId)

  // playerId → seat position (내 기준 상대 배치)
  function seatOf(playerId: string) {
    const raw = playerIds.indexOf(playerId)
    return (raw - myIdx + playerIds.length) % playerIds.length
  }

  return (
    <div className="relative w-64 h-64 flex items-center justify-center">
      {/* 원형 테이블 배경 */}
      <div className="absolute inset-0 rounded-full bg-board border-2 border-gold/20 shadow-2xl" />

      <AnimatePresence>
        {currentTrick.map(({ playerId, card }) => {
          const seat = seatOf(playerId)
          const pos = POSITIONS[seat]

          return (
            <motion.div
              key={`${playerId}-${card.id}`}
              layoutId={`card-${card.id}`}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1, x: pos.x, y: pos.y }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 250, damping: 22 }}
              style={{ position: 'absolute' }}
            >
              <PlayingCard card={card} size="sm" />
            </motion.div>
          )
        })}
      </AnimatePresence>

      {currentTrick.length === 0 && (
        <p className="text-text/20 text-xs font-inter select-none">트릭 영역</p>
      )}
    </div>
  )
}
