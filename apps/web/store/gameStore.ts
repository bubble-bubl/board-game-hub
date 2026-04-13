import { create } from 'zustand'
import type { GameState, Card, Bid, Suit, AILevel } from '@board-hub/game-engine'
import {
  createInitialState,
  startDealing,
  applyBid,
  applyPass,
  applyExchangeKitty,
  applySelectFriend,
  applyPlayCard,
  getValidCardsForPlayer,
} from '@board-hub/game-engine'

const HUMAN_ID = 'player-0'

interface GameStore {
  // 공통 상태
  gameState: GameState | null
  myPlayerId: string
  isMyTurn: boolean
  validCards: Card[]
  selectedCard: Card | null
  jokerCallSuit: Suit | null
  aiLevel: AILevel
  winner: string | null
  scores: Record<string, number>

  // 멀티플레이 상태
  mode: 'single' | 'multi'
  roomId: string | null
  userId: string
  username: string
  connectedPlayers: string[]

  // 싱글플레이 액션
  startSinglePlayer: (level: AILevel) => void

  // 공통 액션 (싱글: 로컬 계산, 멀티: 소켓 emit 후 서버 응답 대기)
  setGameState: (state: GameState) => void
  setValidCards: (cards: Card[]) => void
  setMyHand: (hand: Card[]) => void
  selectCard: (card: Card | null) => void

  // 싱글 전용 로컬 액션
  playCard: () => void
  placeBid: (count: number, trump: Suit | 'no-trump') => void
  passBid: () => void
  exchangeKitty: (discardCards: Card[]) => void
  selectTrump: (trump: Suit | 'no-trump') => void
  selectFriend: (card: Card) => void
  setJokerCallSuit: (suit: Suit | null) => void

  // 멀티플레이 액션
  setMultiplayerInfo: (userId: string, username: string, roomId: string) => void
  setGameResult: (result: string, scores: Record<string, number>) => void
  addConnectedPlayer: (userId: string) => void
  removeConnectedPlayer: (userId: string) => void

  resetGame: () => void
}

function computeDerived(state: GameState, myId: string) {
  const isMyTurn = state.currentTurnId === myId
  const validCards = isMyTurn ? getValidCardsForPlayer(state, myId) : []
  return { isMyTurn, validCards }
}

function getStoredUserId() {
  if (typeof window === 'undefined') return `user-${Date.now()}`
  return localStorage.getItem('userId') ?? `user-${Date.now()}`
}

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: null,
  myPlayerId: HUMAN_ID,
  isMyTurn: false,
  validCards: [],
  selectedCard: null,
  jokerCallSuit: null,
  aiLevel: 'beginner',
  winner: null,
  scores: {},

  mode: 'single',
  roomId: null,
  userId: getStoredUserId(),
  username: '나',
  connectedPlayers: [],

  startSinglePlayer: (level) => {
    const players = [
      { id: 'player-0', name: '나', hand: [], isAI: false },
      { id: 'player-1', name: 'AI-1', hand: [], isAI: true, aiLevel: level },
      { id: 'player-2', name: 'AI-2', hand: [], isAI: true, aiLevel: level },
      { id: 'player-3', name: 'AI-3', hand: [], isAI: true, aiLevel: level },
      { id: 'player-4', name: 'AI-4', hand: [], isAI: true, aiLevel: level },
    ]
    const initial = createInitialState(players)
    const dealt = startDealing(initial)
    const { isMyTurn, validCards } = computeDerived(dealt, HUMAN_ID)
    set({
      gameState: dealt,
      isMyTurn,
      validCards,
      selectedCard: null,
      aiLevel: level,
      mode: 'single',
      myPlayerId: HUMAN_ID,
      winner: null,
      scores: {},
    })
  },

  setGameState: (state) => {
    const myId = get().myPlayerId
    const { isMyTurn, validCards } = computeDerived(state, myId)
    set({ gameState: state, isMyTurn, validCards })
  },

  setValidCards: (cards) => set({ validCards: cards, isMyTurn: cards.length > 0 }),

  setMyHand: (hand) => {
    const { gameState } = get()
    if (!gameState) return
    const myId = get().myPlayerId
    const updatedPlayers = gameState.players.map((p) =>
      p.id === myId ? { ...p, hand } : p
    )
    set({ gameState: { ...gameState, players: updatedPlayers } })
  },

  selectCard: (card) => set({ selectedCard: card }),

  playCard: () => {
    const { gameState, selectedCard, myPlayerId } = get()
    if (!gameState || !selectedCard) return
    const next = applyPlayCard(gameState, myPlayerId, selectedCard)
    const { isMyTurn, validCards } = computeDerived(next, myPlayerId)
    set({ gameState: next, isMyTurn, validCards, selectedCard: null })
  },

  placeBid: (count, trump) => {
    const { gameState, myPlayerId } = get()
    if (!gameState) return
    const bid: Bid = { playerId: myPlayerId, count, trump }
    const next = applyBid(gameState, bid)
    const { isMyTurn, validCards } = computeDerived(next, myPlayerId)
    set({ gameState: next, isMyTurn, validCards })
  },

  passBid: () => {
    const { gameState, myPlayerId } = get()
    if (!gameState) return
    const next = applyPass(gameState, myPlayerId)
    const { isMyTurn, validCards } = computeDerived(next, myPlayerId)
    set({ gameState: next, isMyTurn, validCards })
  },

  exchangeKitty: (discardCards) => {
    const { gameState, myPlayerId } = get()
    if (!gameState) return
    const next = applyExchangeKitty(gameState, myPlayerId, discardCards)
    const { isMyTurn, validCards } = computeDerived(next, myPlayerId)
    set({ gameState: next, isMyTurn, validCards, selectedCard: null })
  },

  selectTrump: (trump) => {
    const { gameState } = get()
    if (!gameState) return
    set({ gameState: { ...gameState, trump } })
  },

  selectFriend: (card) => {
    const { gameState } = get()
    if (!gameState) return
    const next = applySelectFriend(gameState, card)
    const { isMyTurn, validCards } = computeDerived(next, get().myPlayerId)
    set({ gameState: next, isMyTurn, validCards })
  },

  setJokerCallSuit: (suit) => set({ jokerCallSuit: suit }),

  setMultiplayerInfo: (userId, username, roomId) =>
    set({ userId, username, roomId, mode: 'multi', myPlayerId: userId }),

  setGameResult: (result, scores) => set({ winner: result, scores }),

  addConnectedPlayer: (userId) =>
    set((s) => ({
      connectedPlayers: s.connectedPlayers.includes(userId)
        ? s.connectedPlayers
        : [...s.connectedPlayers, userId],
    })),

  removeConnectedPlayer: (userId) =>
    set((s) => ({ connectedPlayers: s.connectedPlayers.filter((id) => id !== userId) })),

  resetGame: () =>
    set({
      gameState: null,
      isMyTurn: false,
      validCards: [],
      selectedCard: null,
      jokerCallSuit: null,
      winner: null,
      scores: {},
      mode: 'single',
      roomId: null,
      connectedPlayers: [],
      myPlayerId: HUMAN_ID,
    }),
}))
