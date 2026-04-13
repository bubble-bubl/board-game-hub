'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useGameStore } from '../store/gameStore'
import type { Card, Bid, Suit, AILevel } from '@board-hub/game-engine'

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:4000'

export function useSocket(roomId: string | null) {
  const socketRef = useRef<Socket | null>(null)
  const store = useGameStore()
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  useEffect(() => {
    if (!roomId || roomId === 'single') return

    const socket = io(SERVER_URL, { autoConnect: false, reconnectionAttempts: 5 })
    socketRef.current = socket

    socket.on('connect', () => {
      setIsConnected(true)
      setConnectionError(null)
    })

    socket.on('disconnect', () => {
      setIsConnected(false)
    })

    socket.on('connect_error', () => {
      setIsConnected(false)
      setConnectionError('서버에 연결할 수 없습니다')
    })

    socket.on('reconnect_failed', () => {
      setConnectionError('재연결 실패 — 잠시 후 다시 시도해주세요')
    })

    socket.on('game-state', (state) => {
      store.setGameState(state)
    })

    socket.on('your-turn', ({ validCards }: { phase: string; validCards: Card[] }) => {
      store.setValidCards(validCards)
    })

    socket.on('player-joined', ({ player }: { player: { userId: string; username: string } }) => {
      store.addConnectedPlayer(player.userId)
    })

    socket.on('player-left', ({ playerId }: { playerId: string }) => {
      store.removeConnectedPlayer(playerId)
    })

    socket.on('game-started', ({ hand }: { hand: Card[] }) => {
      store.setMyHand(hand)
    })

    socket.on('game-ended', ({ result, scores }: { result: string; scores: Record<string, number> }) => {
      store.setGameResult(result, scores)
    })

    socket.on('error', ({ message }: { message: string }) => {
      console.error('[Socket error]', message)
    })

    socket.connect()

    // 재연결 처리: localStorage에서 userId 복구
    const userId = localStorage.getItem('userId') ?? `user-${Date.now()}`
    const username = localStorage.getItem('username') ?? '플레이어'
    if (!localStorage.getItem('userId')) localStorage.setItem('userId', userId)
    localStorage.setItem('roomId', roomId)

    store.setMultiplayerInfo(userId, username, roomId)
    socket.emit('join-room', { roomId, userId, username })

    return () => {
      socket.disconnect()
      socketRef.current = null
      localStorage.removeItem('roomId')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId])

  const emitPlayCard = useCallback((card: Card) => {
    const { roomId } = useGameStore.getState()
    socketRef.current?.emit('play-card', { roomId, card })
  }, [])

  const emitPlaceBid = useCallback((bid: Bid) => {
    const { roomId } = useGameStore.getState()
    socketRef.current?.emit('place-bid', { roomId, bid })
  }, [])

  const emitPassBid = useCallback(() => {
    const { roomId } = useGameStore.getState()
    socketRef.current?.emit('pass-bid', { roomId })
  }, [])

  const emitExchangeKitty = useCallback((discardCards: Card[]) => {
    const { roomId } = useGameStore.getState()
    socketRef.current?.emit('exchange-kitty', { roomId, discardCards })
  }, [])

  const emitSelectTrump = useCallback((trump: Suit | 'no-trump') => {
    const { roomId } = useGameStore.getState()
    socketRef.current?.emit('select-trump', { roomId, trump })
  }, [])

  const emitSelectFriend = useCallback((friendCard: Card) => {
    const { roomId } = useGameStore.getState()
    socketRef.current?.emit('select-friend', { roomId, friendCard })
  }, [])

  const emitStartSingle = useCallback((aiLevel: AILevel) => {
    const state = useGameStore.getState()
    socketRef.current?.emit('start-single', {
      userId: state.userId,
      username: state.username,
      aiLevel,
    })
  }, [])

  return {
    socket: socketRef.current,
    isConnected,
    connectionError,
    emitPlayCard,
    emitPlaceBid,
    emitPassBid,
    emitExchangeKitty,
    emitSelectTrump,
    emitSelectFriend,
    emitStartSingle,
  }
}
