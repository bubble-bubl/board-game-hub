import { Card, Suit, Rank } from './types'

const SUITS: Suit[] = ['spade', 'heart', 'diamond', 'club']
const RANKS: Rank[] = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2']

export function createDeck(): Card[] {
  const cards: Card[] = []
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      cards.push({ suit, rank, id: `${suit}-${rank}` })
    }
  }
  cards.push({ suit: 'joker', rank: 'joker', id: 'joker' })
  return cards
}

export function shuffleDeck(deck: Card[]): Card[] {
  const arr = [...deck]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export function dealCards(deck: Card[]): { hands: Card[][]; kitty: Card[] } {
  const shuffled = shuffleDeck(deck)
  const hands: Card[][] = [[], [], [], [], []]
  for (let i = 0; i < 50; i++) {
    hands[i % 5].push(shuffled[i])
  }
  const kitty = shuffled.slice(50)
  return { hands, kitty }
}
