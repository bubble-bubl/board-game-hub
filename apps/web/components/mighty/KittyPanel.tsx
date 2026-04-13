'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Card, Suit } from '@board-hub/game-engine'
import { PlayingCard } from './PlayingCard'

interface Props {
  hand: Card[]
  kitty: Card[]
  onExchange: (discardCards: Card[]) => void
  onSelectTrump: (trump: Suit | 'no-trump') => void
}

const SUITS: Array<{ value: Suit | 'no-trump'; label: string; bg: string }> = [
  { value: 'spade', label: '♠ 스페이드', bg: 'bg-white/10' },
  { value: 'heart', label: '♥ 하트', bg: 'bg-red-900/30' },
  { value: 'diamond', label: '♦ 다이아', bg: 'bg-red-900/30' },
  { value: 'club', label: '♣ 클럽', bg: 'bg-white/10' },
  { value: 'no-trump', label: 'NT 노트럼프', bg: 'bg-gold/20' },
]

export function KittyPanel({ hand, kitty, onExchange, onSelectTrump }: Props) {
  const allCards = [...hand, ...kitty]
  const [selected, setSelected] = useState<string[]>([])
  const [step, setStep] = useState<'discard' | 'trump'>('discard')

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 3 ? [...prev, id] : prev
    )
  }

  function handleConfirmDiscard() {
    if (selected.length !== 3) return
    const discardCards = allCards.filter((c) => selected.includes(c.id))
    onExchange(discardCards)
    setStep('trump')
  }

  if (step === 'trump') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-board border border-gold/30 rounded-xl p-5 w-72 shadow-2xl text-center"
      >
        <h3 className="font-cinzel text-gold text-sm mb-4">트럼프 선언</h3>
        <div className="space-y-2">
          {SUITS.map((s) => (
            <button
              key={s.value}
              onClick={() => onSelectTrump(s.value)}
              className={`w-full py-2.5 rounded-lg ${s.bg} text-text hover:ring-2 hover:ring-gold transition-all font-bold`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-board border border-gold/30 rounded-xl p-4 shadow-2xl"
    >
      <h3 className="font-cinzel text-gold text-sm mb-1 text-center">키티 교환</h3>
      <p className="text-text/50 text-xs text-center mb-3">버릴 카드 3장 선택 ({selected.length}/3)</p>
      <div className="flex flex-wrap gap-2 justify-center mb-4">
        {allCards.map((card) => {
          const isKittyCard = kitty.some((k) => k.id === card.id)
          return (
            <div key={card.id} className="relative">
              <PlayingCard
                card={card}
                size="sm"
                selected={selected.includes(card.id)}
                onClick={() => toggle(card.id)}
              />
              {isKittyCard && (
                <span className="absolute -top-1 -right-1 bg-gold text-background text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">K</span>
              )}
            </div>
          )
        })}
      </div>
      <button
        onClick={handleConfirmDiscard}
        disabled={selected.length !== 3}
        className="w-full py-2 rounded-lg bg-gold text-background font-bold disabled:opacity-40 transition-all hover:bg-gold-bright text-sm"
      >
        버리기 확인
      </button>
    </motion.div>
  )
}
