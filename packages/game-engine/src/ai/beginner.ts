import { Card, Bid, GameState } from '../types'

const POINT_RANKS = new Set(['A', '10', 'K'])

export function chooseBidBeginner(hand: Card[], currentBid: Bid | null): Bid | 'pass' {
  const pointCards = hand.filter((c) => POINT_RANKS.has(c.rank)).length
  if (pointCards >= 3 && Math.random() < 0.2) {
    return {
      playerId: '',
      count: currentBid ? currentBid.count + 1 : 13,
      trump: 'spade',
    }
  }
  return 'pass'
}

export function chooseCardBeginner(validCards: Card[]): Card {
  return validCards[Math.floor(Math.random() * validCards.length)]
}
