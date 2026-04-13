'use client'

import { motion } from 'framer-motion'
import type { GameState } from '@board-hub/game-engine'

interface Props {
  gameState: GameState
  playerNames: Record<string, string>
}

export function ScoreBoard({ gameState, playerNames }: Props) {
  const { currentBid, trump, presidentId, friendId, trickCount, pointsScored, tricks } = gameState

  const trumpLabel: Record<string, string> = {
    spade: '♠ 스페이드',
    heart: '♥ 하트',
    diamond: '♦ 다이아',
    club: '♣ 클럽',
    'no-trump': 'NT 노트럼프',
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-board border border-gold/20 rounded-xl p-3 w-48 text-sm"
    >
      <h3 className="font-cinzel text-gold text-xs mb-2 text-center tracking-wider">SCOREBOARD</h3>

      <div className="space-y-1.5 text-text/80 text-xs">
        {currentBid && (
          <>
            <Row label="공약" value={`${currentBid.count}점`} />
            {trump && <Row label="트럼프" value={trumpLabel[trump] ?? trump} />}
            {presidentId && <Row label="주공" value={playerNames[presidentId] ?? presidentId} highlight />}
            {friendId && <Row label="파트너" value={playerNames[friendId] ?? '?'} />}
          </>
        )}
        <div className="border-t border-white/10 pt-1.5">
          <Row label="트릭" value={`${trickCount} / 10`} />
          <Row label="획득 점수" value={`${pointsScored}점`} />
          {currentBid && <Row label="목표" value={`${currentBid.count}점`} />}
        </div>

        {tricks.length > 0 && (
          <div className="border-t border-white/10 pt-1.5">
            <p className="text-text/40 mb-1">최근 트릭</p>
            {tricks.slice(-3).reverse().map((trick, i) => (
              <div key={i} className="flex justify-between">
                <span className="text-text/50">{playerNames[trick.winnerId] ?? trick.winnerId}</span>
                <span className="text-gold">+{trick.points}점</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

function Row({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-text/50">{label}</span>
      <span className={highlight ? 'text-gold font-bold' : 'text-text'}>{value}</span>
    </div>
  )
}
