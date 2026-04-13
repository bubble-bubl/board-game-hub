import { Card, GameState, Bid } from '../types'
import { determineTrickWinner, getValidCards } from '../trick'
import { applyPlayCard } from '../game'
import { createDeck } from '../deck'
import { chooseBidIntermediate } from './intermediate'

const NUM_DETERMINIZATIONS = 50
const NUM_SIMULATIONS = 20
const TIME_LIMIT_MS = 1000

interface MCTSNode {
  card: Card
  wins: number
  visits: number
}

function determinize(state: GameState, myId: string): GameState {
  const myPlayer = state.players.find((p) => p.id === myId)!
  const myCardIds = new Set(myPlayer.hand.map((c) => c.id))

  const playedIds = new Set<string>()
  for (const trick of state.tricks) {
    for (const tc of trick.cards) playedIds.add(tc.card.id)
  }
  for (const tc of state.currentTrick) playedIds.add(tc.card.id)

  const allCards: Card[] = createDeck()
  const remaining = allCards.filter((c) => !myCardIds.has(c.id) && !playedIds.has(c.id))

  const shuffled = [...remaining].sort(() => Math.random() - 0.5)
  let idx = 0
  const players = state.players.map((p) => {
    if (p.id === myId) return p
    const count = p.hand.length
    const hand = shuffled.slice(idx, idx + count)
    idx += count
    return { ...p, hand }
  })

  return { ...state, players }
}

function randomPlayout(state: GameState): 'president' | 'opposition' {
  let s = state
  let iterations = 0
  while (s.phase === 'playing' && iterations < 100) {
    const playerId = s.currentTurnId!
    const player = s.players.find((p) => p.id === playerId)!
    const valid = getValidCards(player.hand, s.currentTrick, s.trump)
    if (valid.length === 0) break
    const card = valid[Math.floor(Math.random() * valid.length)]
    s = applyPlayCard(s, playerId, card)
    iterations++
  }
  return s.winner ?? 'opposition'
}

export function chooseCardExpert(validCards: Card[], state: GameState, myId: string): Card {
  if (validCards.length === 1) return validCards[0]

  const nodes: MCTSNode[] = validCards.map((card) => ({ card, wins: 0, visits: 0 }))
  const isPresidentTeam = state.presidentId === myId || state.friendId === myId
  const startTime = Date.now()

  for (let d = 0; d < NUM_DETERMINIZATIONS && Date.now() - startTime < TIME_LIMIT_MS; d++) {
    const detState = determinize(state, myId)
    for (const node of nodes) {
      if (Date.now() - startTime >= TIME_LIMIT_MS) break
      for (let s = 0; s < NUM_SIMULATIONS; s++) {
        const afterPlay = applyPlayCard(detState, myId, node.card)
        const result = randomPlayout(afterPlay)
        const win = isPresidentTeam ? result === 'president' : result === 'opposition'
        node.wins += win ? 1 : 0
        node.visits++
      }
    }
  }

  return nodes.reduce((best, node) => {
    const bestRate = best.visits > 0 ? best.wins / best.visits : 0
    const nodeRate = node.visits > 0 ? node.wins / node.visits : 0
    return nodeRate > bestRate ? node : best
  }).card
}

export function chooseBidExpert(hand: Card[], currentBid: Bid | null): Bid | 'pass' {
  return chooseBidIntermediate(hand, currentBid)
}
