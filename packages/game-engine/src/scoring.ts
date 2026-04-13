import { Trick, Bid } from './types'

const POINT_RANKS = new Set(['A', '10', 'K'])

export function countTrickPoints(trick: Trick): number {
  let points = 0
  for (const tc of trick.cards) {
    if (POINT_RANKS.has(tc.card.rank)) points++
    if (tc.card.suit === 'joker') points++
  }
  return points
}

export function calculateResult(
  tricks: Trick[],
  bid: Bid,
  presidentId: string,
  friendId: string | null
): { winner: 'president' | 'opposition'; pointsScored: number } {
  const presidentTeam = new Set([presidentId, ...(friendId ? [friendId] : [])])
  let pointsScored = 0

  for (const trick of tricks) {
    if (presidentTeam.has(trick.winnerId)) {
      pointsScored += countTrickPoints(trick)
    }
  }

  const winner = pointsScored >= bid.count ? 'president' : 'opposition'
  return { winner, pointsScored }
}
