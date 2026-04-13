'use client'

import { useCallback } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'
import { useSocket } from '../../hooks/useSocket'
import { CardHand } from './CardHand'
import { TrickArea } from './TrickArea'
import { BidPanel } from './BidPanel'
import { PlayerSeat } from './PlayerSeat'
import { ScoreBoard } from './ScoreBoard'
import { WinEffect } from './WinEffect'
import { KittyPanel } from './KittyPanel'
import { FriendSelectPanel } from './FriendSelectPanel'
import { TurnTimer } from './TurnTimer'
import { ConnectionBanner } from './ConnectionBanner'
import { CardSkeleton } from './CardSkeleton'
import type { Card, Suit } from '@board-hub/game-engine'

interface Props {
  roomId: string
  onGameEnd?: () => void
}

export function MultiGameBoard({ roomId, onGameEnd }: Props) {
  const store = useGameStore()
  const {
    gameState,
    myPlayerId,
    isMyTurn,
    validCards,
    selectedCard,
    connectedPlayers,
    selectCard,
    resetGame,
  } = store

  const {
    emitPlayCard,
    emitPlaceBid,
    emitPassBid,
    emitExchangeKitty,
    emitSelectTrump,
    emitSelectFriend,
    isConnected,
    connectionError,
  } = useSocket(roomId)

  const handlePlayCard = useCallback(() => {
    if (!selectedCard) return
    emitPlayCard(selectedCard)
    selectCard(null)
  }, [selectedCard, emitPlayCard, selectCard])

  const handlePlaceBid = useCallback((count: number, trump: Suit | 'no-trump') => {
    const bid = { playerId: myPlayerId, count, trump }
    emitPlaceBid(bid)
  }, [myPlayerId, emitPlaceBid])

  const handleExchangeKitty = useCallback((discardCards: Card[]) => {
    emitExchangeKitty(discardCards)
  }, [emitExchangeKitty])

  const handleSelectTrump = useCallback((trump: Suit | 'no-trump') => {
    emitSelectTrump(trump)
  }, [emitSelectTrump])

  const handleSelectFriend = useCallback((card: Card) => {
    emitSelectFriend(card)
  }, [emitSelectFriend])

  const handleTimeout = useCallback(() => {
    const { gameState: gs, validCards: vc } = useGameStore.getState()
    if (!gs) return
    if (gs.phase === 'bidding') {
      emitPassBid()
    } else if (gs.phase === 'playing' && vc.length > 0) {
      emitPlayCard(vc[0])
    }
  }, [emitPassBid, emitPlayCard])

  // 대기 화면 (게임 상태 없음)
  if (!gameState) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
        <ConnectionBanner isConnected={isConnected} error={connectionError} />
        <div className="text-center">
          <h2 className="font-cinzel text-2xl text-gold mb-2">대기 중</h2>
          <p className="text-text/40 text-sm font-inter">플레이어를 기다리고 있습니다...</p>
          <p className="text-text/30 text-xs mt-1 font-inter">
            {connectedPlayers.length}/5명 접속 중
          </p>
        </div>

        <div className="flex flex-col gap-2 w-64">
          {Array.from({ length: 5 }, (_, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg border transition-all ${
                i < connectedPlayers.length
                  ? 'border-gold/40 bg-gold/10'
                  : 'border-white/10 bg-white/5'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${i < connectedPlayers.length ? 'bg-gold' : 'bg-white/20'}`} />
              <span className="text-sm text-text/60">
                {i < connectedPlayers.length ? `플레이어 ${i + 1}` : '대기중...'}
              </span>
            </div>
          ))}
        </div>

        <div className="w-64">
          <CardSkeleton count={5} />
        </div>

        <button
          onClick={() => { onGameEnd?.() }}
          className="text-xs text-text/30 hover:text-text/60 transition-colors"
        >
          ← 로비로 돌아가기
        </button>
      </div>
    )
  }

  const { phase, players, currentTurnId, presidentId, friendId, currentTrick, currentBid, trump, kitty, winner } = gameState
  const playerNames: Record<string, string> = Object.fromEntries(players.map((p) => [p.id, p.name]))
  const myIdx = players.findIndex((p) => p.id === myPlayerId)
  const seatOrder = [1, 2, 3, 4].map((offset) => players[(myIdx + offset) % players.length])
  const myPlayer = players.find((p) => p.id === myPlayerId)
  const myHand = myPlayer?.hand ?? []

  const seatPositions = [
    'absolute right-4 top-1/2 -translate-y-1/2',
    'absolute top-4 right-1/3',
    'absolute top-4 left-1/3',
    'absolute left-4 top-1/2 -translate-y-1/2',
  ]

  return (
    <div className="relative w-full h-screen bg-background overflow-hidden flex flex-col">
      <ConnectionBanner isConnected={isConnected} error={connectionError} />
      <div className="absolute inset-0 bg-gradient-radial from-board/40 to-background pointer-events-none" />

      {/* 헤더 */}
      <div className="relative z-10 flex items-center justify-between px-6 py-3 border-b border-gold/10">
        <h1 className="font-cinzel text-gold text-lg tracking-wider">MIGHTY</h1>
        <div className="flex items-center gap-4">
          {trump && (
            <span className="text-sm text-text/60">
              트럼프: <span className="text-gold font-bold">
                {{ spade: '♠', heart: '♥', diamond: '♦', club: '♣', 'no-trump': 'NT' }[trump]}
              </span>
            </span>
          )}
          <span className="text-xs text-text/40 font-inter">
            {phase === 'bidding' ? '입찰' : phase === 'kitty' ? '키티' : phase === 'friend-select' ? '프렌드' : phase === 'playing' ? `트릭 ${gameState.trickCount + 1}/10` : phase === 'finished' ? '종료' : '대기'}
          </span>
          {isMyTurn && (
            <TurnTimer
              isActive={isMyTurn && (phase === 'bidding' || phase === 'playing')}
              duration={30}
              onTimeout={handleTimeout}
            />
          )}
        </div>
        <button onClick={() => { onGameEnd?.(); resetGame() }} className="text-text/30 hover:text-text/70 text-xs transition-colors">
          ← 나가기
        </button>
      </div>

      {/* 메인 게임 영역 */}
      <div className="relative flex-1 flex items-center justify-center">
        {seatOrder.map((player, i) => (
          <div key={player.id} className={seatPositions[i]}>
            <PlayerSeat
              player={player}
              isCurrentTurn={currentTurnId === player.id}
              isPresident={player.id === presidentId}
              isFriend={player.id === friendId && !!friendId}
              cardCount={player.hand.length}
            />
          </div>
        ))}

        <div className="flex flex-col items-center gap-4">
          <TrickArea
            currentTrick={currentTrick}
            playerIds={players.map((p) => p.id)}
            myPlayerId={myPlayerId}
          />

          {isMyTurn && phase === 'bidding' && (
            <BidPanel
              currentBid={currentBid}
              playerNames={playerNames}
              onBid={handlePlaceBid}
              onPass={emitPassBid}
            />
          )}

          {isMyTurn && phase === 'kitty' && presidentId === myPlayerId && (
            <KittyPanel
              hand={myHand}
              kitty={kitty}
              onExchange={handleExchangeKitty}
              onSelectTrump={handleSelectTrump}
            />
          )}

          {isMyTurn && phase === 'friend-select' && presidentId === myPlayerId && (
            <FriendSelectPanel
              hand={myHand}
              onSelectFriend={handleSelectFriend}
            />
          )}

          {phase === 'playing' && isMyTurn && selectedCard && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={handlePlayCard}
              className="px-6 py-2 bg-gold text-background font-bold rounded-lg hover:bg-gold-bright transition-all shadow-lg"
            >
              카드 내기
            </motion.button>
          )}

          {!isMyTurn && phase === 'playing' && (
            <p className="text-text/40 text-sm font-inter">
              {playerNames[currentTurnId ?? ''] ?? '?'} 의 차례...
            </p>
          )}
        </div>

        <div className="absolute right-4 top-4">
          <ScoreBoard gameState={gameState} playerNames={playerNames} />
        </div>
      </div>

      {/* 내 패 */}
      <div className="relative z-10 flex flex-col items-center pb-4 px-4">
        <div className="flex items-center gap-2 mb-2">
          {myPlayer && (
            <PlayerSeat
              player={myPlayer}
              isCurrentTurn={currentTurnId === myPlayerId}
              isPresident={myPlayerId === presidentId}
              isFriend={myPlayerId === friendId && !!friendId}
              cardCount={myHand.length}
            />
          )}
        </div>
        <CardHand
          cards={myHand}
          validCards={validCards}
          selectedCard={selectedCard}
          onSelect={selectCard}
          trump={trump}
          disabled={!isMyTurn || phase !== 'playing'}
        />
      </div>

      <WinEffect winner={winner} onClose={() => { onGameEnd?.(); resetGame() }} />
    </div>
  )
}
