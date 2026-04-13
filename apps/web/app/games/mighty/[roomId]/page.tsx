'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useGameStore } from '../../../../store/gameStore'
import { useSocket } from '../../../../hooks/useSocket'
import { GameBoard } from '../../../../components/mighty/GameBoard'
import { MultiGameBoard } from '../../../../components/mighty/MultiGameBoard'

interface Props {
  params: { roomId: string }
}

export default function GamePage({ params }: Props) {
  const { roomId } = params
  const router = useRouter()
  const { gameState } = useGameStore()

  // 멀티 모드일 때만 소켓 연결
  const isMulti = roomId !== 'single'
  useSocket(isMulti ? roomId : null)

  useEffect(() => {
    if (!gameState && !isMulti) {
      router.replace('/games/mighty')
    }
  }, [gameState, isMulti, router])

  if (!isMulti) {
    if (!gameState) return null
    return <GameBoard onGameEnd={() => router.push('/games/mighty')} />
  }

  return <MultiGameBoard roomId={roomId} onGameEnd={() => router.push('/games/mighty')} />
}
