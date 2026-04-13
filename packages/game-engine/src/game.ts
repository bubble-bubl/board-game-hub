import { GameState, Player, Card, Bid, Suit, Trick, TrickCard } from './types'
import { createDeck, dealCards } from './deck'
import { isValidBid } from './bidding'
import { determineTrickWinner, getValidCards } from './trick'
import { countTrickPoints, calculateResult } from './scoring'

export function createInitialState(players: Player[]): GameState {
  return {
    phase: 'waiting',
    players,
    kitty: [],
    currentBid: null,
    trump: null,
    friendCard: null,
    presidentId: null,
    friendId: null,
    currentTurnId: players[0]?.id ?? null,
    tricks: [],
    currentTrick: [],
    trickCount: 0,
    pointsScored: 0,
    winner: null,
  }
}

export function startDealing(state: GameState): GameState {
  const deck = createDeck()
  const { hands, kitty } = dealCards(deck)
  const players = state.players.map((p, i) => ({ ...p, hand: hands[i] }))
  return { ...state, phase: 'bidding', players, kitty, currentTurnId: players[0].id }
}

export function applyBid(state: GameState, bid: Bid): GameState {
  if (!isValidBid(bid, state.currentBid)) return state

  const playerIdx = state.players.findIndex((p) => p.id === bid.playerId)
  const nextIdx = (playerIdx + 1) % state.players.length

  return {
    ...state,
    currentBid: bid,
    currentTurnId: state.players[nextIdx].id,
  }
}

export function applyPass(state: GameState, playerId: string): GameState {
  const playerIdx = state.players.findIndex((p) => p.id === playerId)
  const nextIdx = (playerIdx + 1) % state.players.length
  const nextPlayer = state.players[nextIdx]

  // 한 바퀴 돌아 주공 확정
  const passCount = (state as any)._passCount ?? 0
  const newPassCount = passCount + 1

  if (newPassCount >= state.players.length - 1) {
    if (state.currentBid) {
      // 주공 확정 → kitty 단계
      return {
        ...state,
        phase: 'kitty',
        presidentId: state.currentBid.playerId,
        trump: state.currentBid.trump,
        currentTurnId: state.currentBid.playerId,
        _passCount: 0,
      } as any
    } else {
      // 전원 패스 → 첫 번째 플레이어 강제 13 ♠ 입찰
      const forcedBid = { playerId: state.players[0].id, count: 13, trump: 'spade' as const }
      const forcedNextIdx = 1 % state.players.length
      return {
        ...state,
        currentBid: forcedBid,
        currentTurnId: state.players[forcedNextIdx].id,
        _passCount: 0,
      } as any
    }
  }

  return {
    ...state,
    currentTurnId: nextPlayer.id,
    _passCount: newPassCount,
  } as any
}

export function applyExchangeKitty(
  state: GameState,
  presidentId: string,
  discardCards: Card[]
): GameState {
  const president = state.players.find((p) => p.id === presidentId)
  if (!president) return state

  // 키티 3장을 패에 추가하고 3장 버리기
  const newHand = [
    ...president.hand,
    ...state.kitty,
  ].filter((c) => !discardCards.some((d) => d.id === c.id))

  const players = state.players.map((p) =>
    p.id === presidentId ? { ...p, hand: newHand } : p
  )

  return {
    ...state,
    phase: 'friend-select',
    players,
    kitty: discardCards,
    currentTurnId: presidentId,
  }
}

export function applySelectFriend(state: GameState, friendCard: Card): GameState {
  return {
    ...state,
    phase: 'playing',
    friendCard,
    currentTurnId: state.players[0].id,
    currentTrick: [],
  }
}

export function applyPlayCard(state: GameState, playerId: string, card: Card): GameState {
  const player = state.players.find((p) => p.id === playerId)
  if (!player) return state

  const newHand = player.hand.filter((c) => c.id !== card.id)
  const players = state.players.map((p) =>
    p.id === playerId ? { ...p, hand: newHand } : p
  )

  // 프렌드 공개 확인
  let friendId = state.friendId
  if (state.friendCard && card.id === state.friendCard.id && !state.friendId) {
    friendId = playerId
  }

  const newTrick: TrickCard[] = [...state.currentTrick, { playerId, card }]

  // 5장 다 냈으면 트릭 종료
  if (newTrick.length === state.players.length) {
    const winnerId = determineTrickWinner(newTrick, state.trump)
    const points = newTrick.reduce((sum, tc) => {
      const r = tc.card.rank
      const isPoint = r === 'A' || r === '10' || r === 'K'
      const isJoker = tc.card.suit === 'joker'
      return sum + (isPoint || isJoker ? 1 : 0)
    }, 0)

    const trick: Trick = { cards: newTrick, winnerId, points }
    const tricks = [...state.tricks, trick]
    const trickCount = state.trickCount + 1

    // 10트릭 완료 → 게임 종료
    if (trickCount === 10) {
      const bid = state.currentBid!
      const { winner, pointsScored } = calculateResult(tricks, bid, state.presidentId!, friendId)
      return {
        ...state,
        players,
        tricks,
        currentTrick: [],
        trickCount,
        friendId,
        pointsScored,
        winner,
        phase: 'finished',
        currentTurnId: null,
      }
    }

    return {
      ...state,
      players,
      tricks,
      currentTrick: [],
      trickCount,
      friendId,
      currentTurnId: winnerId,
    }
  }

  // 다음 플레이어 턴
  const currentIdx = state.players.findIndex((p) => p.id === playerId)
  const nextIdx = (currentIdx + 1) % state.players.length

  return {
    ...state,
    players,
    currentTrick: newTrick,
    friendId,
    currentTurnId: state.players[nextIdx].id,
  }
}

export function getValidCardsForPlayer(state: GameState, playerId: string): Card[] {
  const player = state.players.find((p) => p.id === playerId)
  if (!player) return []
  return getValidCards(player.hand, state.currentTrick, state.trump)
}
