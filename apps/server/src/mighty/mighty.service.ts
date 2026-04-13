import { Injectable } from '@nestjs/common'
import {
  GameState,
  Player,
  Card,
  Bid,
  Suit,
  AILevel,
  createInitialState,
  startDealing,
  applyBid,
  applyPass,
  applyExchangeKitty,
  applySelectFriend,
  applyPlayCard,
  getValidCardsForPlayer,
  chooseCardBeginner,
  chooseBidBeginner,
  chooseCardIntermediate,
  chooseBidIntermediate,
  chooseCardExpert,
  chooseBidExpert,
} from '@board-hub/game-engine'

@Injectable()
export class MightyService {
  private games = new Map<string, GameState>()

  initGame(roomId: string, players: Player[]): GameState {
    const state = startDealing(createInitialState(players))
    this.games.set(roomId, state)
    return state
  }

  getState(roomId: string): GameState | null {
    return this.games.get(roomId) ?? null
  }

  getStateForPlayer(roomId: string, playerId: string): GameState | null {
    const state = this.games.get(roomId)
    if (!state) return null
    // 다른 플레이어 패 숨기기
    return {
      ...state,
      players: state.players.map((p) =>
        p.id === playerId ? p : { ...p, hand: p.hand.map(() => ({ suit: 'joker' as const, rank: 'joker' as const, id: 'hidden' })) }
      ),
      kitty: state.presidentId === playerId ? state.kitty : [],
    }
  }

  placeBid(roomId: string, bid: Bid): GameState | null {
    const state = this.games.get(roomId)
    if (!state || state.phase !== 'bidding') return null
    const next = applyBid(state, bid)
    this.games.set(roomId, next)
    return next
  }

  passBid(roomId: string, playerId: string): GameState | null {
    const state = this.games.get(roomId)
    if (!state || state.phase !== 'bidding') return null
    const next = applyPass(state, playerId)
    this.games.set(roomId, next)
    return next
  }

  exchangeKitty(roomId: string, presidentId: string, discardCards: Card[]): GameState | null {
    const state = this.games.get(roomId)
    if (!state || state.phase !== 'kitty') return null
    const next = applyExchangeKitty(state, presidentId, discardCards)
    this.games.set(roomId, next)
    return next
  }

  selectTrump(roomId: string, trump: Suit | 'no-trump'): GameState | null {
    const state = this.games.get(roomId)
    if (!state || state.phase !== 'kitty') return null
    const next = { ...state, trump }
    this.games.set(roomId, next)
    return next
  }

  selectFriend(roomId: string, friendCard: Card): GameState | null {
    const state = this.games.get(roomId)
    if (!state || state.phase !== 'friend-select') return null
    const next = applySelectFriend(state, friendCard)
    this.games.set(roomId, next)
    return next
  }

  playCard(roomId: string, playerId: string, card: Card): GameState | null {
    const state = this.games.get(roomId)
    if (!state || state.phase !== 'playing') return null
    if (state.currentTurnId !== playerId) return null

    const valid = getValidCardsForPlayer(state, playerId)
    if (!valid.some((c) => c.id === card.id)) return null

    const next = applyPlayCard(state, playerId, card)
    this.games.set(roomId, next)
    return next
  }

  getValidCards(roomId: string, playerId: string): Card[] {
    const state = this.games.get(roomId)
    if (!state) return []
    return getValidCardsForPlayer(state, playerId)
  }

  // AI 턴 처리
  processAITurn(roomId: string): { playerId: string; card: Card } | null {
    const state = this.games.get(roomId)
    if (!state || state.phase !== 'playing') return null

    const currentPlayer = state.players.find((p) => p.id === state.currentTurnId)
    if (!currentPlayer?.isAI) return null

    const validCards = getValidCardsForPlayer(state, currentPlayer.id)
    if (validCards.length === 0) return null

    let card: Card
    switch (currentPlayer.aiLevel) {
      case 'expert':
        card = chooseCardExpert(validCards, state, currentPlayer.id)
        break
      case 'intermediate':
        card = chooseCardIntermediate(validCards, state, currentPlayer.id)
        break
      default:
        card = chooseCardBeginner(validCards)
    }

    this.playCard(roomId, currentPlayer.id, card)
    return { playerId: currentPlayer.id, card }
  }

  processAIBid(roomId: string): { playerId: string; bid: Bid | 'pass' } | null {
    const state = this.games.get(roomId)
    if (!state || state.phase !== 'bidding') return null

    const currentPlayer = state.players.find((p) => p.id === state.currentTurnId)
    if (!currentPlayer?.isAI) return null

    let result: Bid | 'pass'
    switch (currentPlayer.aiLevel) {
      case 'expert':
        result = chooseBidExpert(currentPlayer.hand, state.currentBid)
        break
      case 'intermediate':
        result = chooseBidIntermediate(currentPlayer.hand, state.currentBid)
        break
      default:
        result = chooseBidBeginner(currentPlayer.hand, state.currentBid)
    }

    if (result === 'pass') {
      this.passBid(roomId, currentPlayer.id)
    } else {
      const bid = { ...result, playerId: currentPlayer.id }
      this.placeBid(roomId, bid)
    }

    return { playerId: currentPlayer.id, bid: result }
  }

  deleteGame(roomId: string): void {
    this.games.delete(roomId)
  }
}
