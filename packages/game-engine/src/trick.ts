import { Card, TrickCard, Suit, Rank } from './types'

const RANK_ORDER: Rank[] = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2']

function rankValue(rank: Rank | 'joker'): number {
  if (rank === 'joker') return -1
  return RANK_ORDER.length - RANK_ORDER.indexOf(rank)
}

export function getMightyCard(trump: Suit | 'no-trump' | null): string {
  return trump === 'spade' ? 'heart-A' : 'spade-A'
}

export function determineTrickWinner(
  trick: TrickCard[],
  trump: Suit | 'no-trump' | null
): string {
  const mighty = getMightyCard(trump)
  const leadCard = trick[0]
  const leadSuit = leadCard.card.suit

  let winner = trick[0]

  for (const tc of trick.slice(1)) {
    const card = tc.card

    const winnerIsMighty = winner.card.id === mighty
    const cardIsMighty = card.id === mighty

    if (winnerIsMighty) continue
    if (cardIsMighty) { winner = tc; continue }

    const winnerIsJoker = winner.card.suit === 'joker'
    const cardIsJoker = card.suit === 'joker'

    if (winnerIsJoker && !cardIsMighty) continue
    if (cardIsJoker && !winnerIsMighty) { winner = tc; continue }

    const winnerIsTrump = trump && trump !== 'no-trump' && winner.card.suit === trump
    const cardIsTrump = trump && trump !== 'no-trump' && card.suit === trump

    if (winnerIsTrump && !cardIsTrump) continue
    if (cardIsTrump && !winnerIsTrump) { winner = tc; continue }

    if (card.suit === winner.card.suit && rankValue(card.rank) > rankValue(winner.card.rank)) {
      winner = tc
    } else if (card.suit !== winner.card.suit && card.suit === leadSuit && winner.card.suit !== leadSuit) {
      winner = tc
    }
  }

  return winner.playerId
}

export function getValidCards(
  hand: Card[],
  trick: TrickCard[],
  trump: Suit | 'no-trump' | null
): Card[] {
  if (trick.length === 0) return hand

  const leadSuit = trick[0].card.suit
  if (leadSuit === 'joker') return hand

  const samesuit = hand.filter((c) => c.suit === leadSuit)
  return samesuit.length > 0 ? samesuit : hand
}
