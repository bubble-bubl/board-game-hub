'use client'

import { motion } from 'framer-motion'

import { useMightyGame } from '../../hooks/useMightyGame'
import { CardHand } from './CardHand'
import { TrickArea } from './TrickArea'
import { BidPanel } from './BidPanel'
import { PlayerSeat } from './PlayerSeat'
import { ScoreBoard } from './ScoreBoard'
import { WinEffect } from './WinEffect'
import { KittyPanel } from './KittyPanel'
import { FriendSelectPanel } from './FriendSelectPanel'

interface Props {
  onGameEnd?: () => void
}

export function GameBoard({ onGameEnd }: Props) {
  const {
    gameState,
    myPlayerId,
    myHand,
    isMyTurn,
    validCards,
    selectedCard,
    selectCard,
    playCard,
    placeBid,
    passBid,
    exchangeKitty,
    selectTrump,
    selectFriend,
    resetGame,
  } = useMightyGame()

  if (!gameState) return null

  const { phase, players, currentTurnId, presidentId, friendId, currentTrick, currentBid, trump, kitty, winner } = gameState

  const playerNames: Record<string, string> = Object.fromEntries(players.map((p) => [p.id, p.name]))

  // 상대방 플레이어 배치 (내 기준 시계방향: 우→우상→좌상→좌)
  const myIdx = players.findIndex((p) => p.id === myPlayerId)
  const seatOrder = [1, 2, 3, 4].map((offset) => players[(myIdx + offset) % players.length])

  // 상대방 위치 클래스 (5인 원형: 상단2 + 좌우2)
  const seatPositions = [
    'absolute right-4 top-1/2 -translate-y-1/2',   // 우
    'absolute top-4 right-1/3',                       // 우상
    'absolute top-4 left-1/3',                        // 좌상
    'absolute left-4 top-1/2 -translate-y-1/2',      // 좌
  ]

  const isPresident = (id: string) => id === presidentId
  const isFriend = (id: string) => id === friendId && !!friendId

  return (
    <div className="relative w-full h-screen bg-background overflow-hidden flex flex-col">
      {/* 배경 그라데이션 */}
      <div className="absolute inset-0 bg-gradient-radial from-board/40 to-background pointer-events-none" />

      {/* 헤더 */}
      <div className="relative z-10 flex items-center justify-between px-6 py-3 border-b border-gold/10">
        <h1 className="font-cinzel text-gold text-lg tracking-wider">MIGHTY</h1>
        <div className="flex items-center gap-4">
          {trump && (
            <span className="text-sm text-text/60">
              트럼프: <span className="text-gold font-bold">{
                { spade: '♠', heart: '♥', diamond: '♦', club: '♣', 'no-trump': 'NT' }[trump]
              }</span>
            </span>
          )}
          <span className="text-xs text-text/40 font-inter">
            {phase === 'bidding' ? '입찰' : phase === 'kitty' ? '키티' : phase === 'friend-select' ? '프렌드' : phase === 'playing' ? `트릭 ${gameState.trickCount + 1}/10` : phase === 'finished' ? '종료' : ''}
          </span>
        </div>
        <button onClick={resetGame} className="text-text/30 hover:text-text/70 text-xs transition-colors">
          ↺ 새 게임
        </button>
      </div>

      {/* 메인 게임 영역 */}
      <div className="relative flex-1 flex items-center justify-center">
        {/* 상대방 플레이어 */}
        {seatOrder.map((player, i) => (
          <div key={player.id} className={seatPositions[i]}>
            <PlayerSeat
              player={player}
              isCurrentTurn={currentTurnId === player.id}
              isPresident={isPresident(player.id)}
              isFriend={isFriend(player.id)}
              cardCount={player.hand.length}
            />
          </div>
        ))}

        {/* 중앙 트릭 영역 */}
        <div className="flex flex-col items-center gap-4">
          <TrickArea
            currentTrick={currentTrick}
            playerIds={players.map((p) => p.id)}
            myPlayerId={myPlayerId}
          />

          {/* phase별 패널 */}
          {isMyTurn && phase === 'bidding' && (
            <BidPanel
              currentBid={currentBid}
              playerNames={playerNames}
              onBid={placeBid}
              onPass={passBid}
            />
          )}

          {isMyTurn && phase === 'kitty' && presidentId === myPlayerId && (
            <KittyPanel
              hand={myHand}
              kitty={kitty}
              onExchange={exchangeKitty}
              onSelectTrump={selectTrump}
            />
          )}

          {isMyTurn && phase === 'friend-select' && presidentId === myPlayerId && (
            <FriendSelectPanel
              hand={myHand}
              onSelectFriend={selectFriend}
            />
          )}

          {phase === 'playing' && isMyTurn && selectedCard && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={playCard}
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

        {/* 우측 스코어보드 */}
        <div className="absolute right-4 top-4">
          <ScoreBoard gameState={gameState} playerNames={playerNames} />
        </div>
      </div>

      {/* 내 패 (하단) */}
      <div className="relative z-10 flex flex-col items-center pb-4 px-4">
        <div className="flex items-center gap-2 mb-2">
          <PlayerSeat
            player={players.find((p) => p.id === myPlayerId)!}
            isCurrentTurn={currentTurnId === myPlayerId}
            isPresident={isPresident(myPlayerId)}
            isFriend={isFriend(myPlayerId)}
            cardCount={myHand.length}
          />
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

      {/* 승리 이펙트 */}
      <WinEffect winner={winner} onClose={() => { onGameEnd?.(); resetGame() }} />
    </div>
  )
}
