'use client'

import { useEffect, useCallback, useRef } from 'react'
import { useGameStore } from '../store/gameStore'
import type { GameState } from '@board-hub/game-engine'

const AI_DELAY = 800

export function useMightyGame() {
  const store = useGameStore()
  const { gameState, myPlayerId } = store
  const processingRef = useRef(false)

  const runAITurn = useCallback(async (state: GameState) => {
    if (processingRef.current) return
    processingRef.current = true

    await new Promise((r) => setTimeout(r, AI_DELAY))

    const currentPlayer = state.players.find((p) => p.id === state.currentTurnId)
    if (!currentPlayer?.isAI) {
      processingRef.current = false
      return
    }

    const engine = await import('@board-hub/game-engine')

    let nextState = state

    if (state.phase === 'bidding') {
      // chooseBid 함수명: chooseBidBeginner / chooseBidIntermediate / chooseBidExpert
      let result: ReturnType<typeof engine.chooseBidBeginner>
      if (currentPlayer.aiLevel === 'expert') {
        result = engine.chooseBidExpert(currentPlayer.hand, state.currentBid)
      } else if (currentPlayer.aiLevel === 'intermediate') {
        result = engine.chooseBidIntermediate(currentPlayer.hand, state.currentBid)
      } else {
        result = engine.chooseBidBeginner(currentPlayer.hand, state.currentBid)
      }

      if (result === 'pass') {
        nextState = engine.applyPass(state, currentPlayer.id)
      } else {
        const bid = { ...result, playerId: currentPlayer.id }
        nextState = engine.applyBid(state, bid)
      }
    } else if (state.phase === 'kitty' && state.presidentId === currentPlayer.id) {
      const allCards = [...currentPlayer.hand, ...state.kitty]
      const discard = allCards.slice(0, 3)
      nextState = engine.applyExchangeKitty(state, currentPlayer.id, discard)
      // 트럼프 자동 선택 (스페이드)
      nextState = { ...nextState, trump: 'spade' }
    } else if (state.phase === 'friend-select' && state.presidentId === currentPlayer.id) {
      const friendCard = currentPlayer.hand[0]
      nextState = engine.applySelectFriend(state, friendCard)
    } else if (state.phase === 'playing') {
      const validCards = engine.getValidCardsForPlayer(state, currentPlayer.id)
      let card: ReturnType<typeof engine.chooseCardBeginner>
      if (currentPlayer.aiLevel === 'expert') {
        card = engine.chooseCardExpert(validCards, state, currentPlayer.id)
      } else if (currentPlayer.aiLevel === 'intermediate') {
        card = engine.chooseCardIntermediate(validCards, state, currentPlayer.id)
      } else {
        card = engine.chooseCardBeginner(validCards)
      }
      nextState = engine.applyPlayCard(state, currentPlayer.id, card)
    }

    processingRef.current = false
    store.setGameState(nextState)
  }, [store])

  useEffect(() => {
    if (!gameState) return
    if (gameState.phase === 'finished') return

    const currentPlayer = gameState.players.find((p) => p.id === gameState.currentTurnId)
    if (currentPlayer?.isAI && !processingRef.current) {
      runAITurn(gameState)
    }
  }, [gameState, runAITurn])

  const myPlayer = gameState?.players.find((p) => p.id === myPlayerId)

  return {
    ...store,
    myPlayer,
    myHand: myPlayer?.hand ?? [],
  }
}
