'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import type { AILevel } from '@board-hub/game-engine'
import { useGameStore } from '../../../store/gameStore'
import { RulesModal } from '../../../components/mighty/RulesModal'

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:4000'

const AI_LEVELS: Array<{ level: AILevel; label: string; desc: string; color: string }> = [
  { level: 'beginner', label: '초보 AI', desc: '랜덤하게 플레이', color: 'text-green-400' },
  { level: 'intermediate', label: '중수 AI', desc: '전략적으로 플레이', color: 'text-yellow-400' },
  { level: 'expert', label: '고수 AI', desc: 'MCTS 알고리즘', color: 'text-red-400' },
]

interface RoomInfo {
  id: string
  name: string
  players: Array<{ userId: string; username: string; isReady: boolean; isAI: boolean }>
  maxPlayers: number
  status: string
}

export default function MightyLobby() {
  const router = useRouter()
  const { startSinglePlayer, userId, username, setMultiplayerInfo } = useGameStore()
  const [selectedLevel, setSelectedLevel] = useState<AILevel>('beginner')
  const [rooms, setRooms] = useState<RoomInfo[]>([])
  const [creating, setCreating] = useState(false)
  const [roomName, setRoomName] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [loadingRooms, setLoadingRooms] = useState(false)
  const [showRules, setShowRules] = useState(false)

  const fetchRooms = useCallback(async () => {
    setLoadingRooms(true)
    try {
      const res = await fetch(`${SERVER_URL}/rooms`)
      if (res.ok) {
        const data = await res.json()
        setRooms(data)
      }
    } catch {
      // 서버 미연결 시 무시
    } finally {
      setLoadingRooms(false)
    }
  }, [])

  useEffect(() => {
    fetchRooms()
    const interval = setInterval(fetchRooms, 5000)
    return () => clearInterval(interval)
  }, [fetchRooms])

  function handleSinglePlay() {
    startSinglePlayer(selectedLevel)
    router.push('/games/mighty/single')
  }

  async function handleCreateRoom() {
    if (!roomName.trim()) return
    setCreating(true)
    try {
      const res = await fetch(`${SERVER_URL}/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: roomName.trim(), hostId: userId, hostUsername: username, isPrivate: false }),
      })
      if (res.ok) {
        const room: RoomInfo = await res.json()
        setMultiplayerInfo(userId, username, room.id)
        router.push(`/games/mighty/${room.id}`)
      }
    } finally {
      setCreating(false)
    }
  }

  function handleJoinRoom(roomId: string) {
    setMultiplayerInfo(userId, username, roomId)
    router.push(`/games/mighty/${roomId}`)
  }

  return (
    <div className="min-h-screen bg-background text-text flex flex-col">
      <RulesModal open={showRules} onClose={() => setShowRules(false)} />

      <header className="flex items-center justify-between gap-4 px-4 sm:px-8 py-5 border-b border-gold/10">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-gold/50 hover:text-gold transition-colors text-sm">
            ← BoardHub
          </Link>
          <h1 className="font-cinzel text-xl text-gold tracking-wider">마이티</h1>
        </div>
        <button
          onClick={() => setShowRules(true)}
          className="text-xs text-text/40 hover:text-text/70 border border-white/10 hover:border-white/30 px-3 py-1.5 rounded-lg transition-all"
        >
          ? 규칙
        </button>
      </header>

      <main className="flex-1 flex flex-col md:flex-row gap-6 p-4 sm:p-8 max-w-4xl mx-auto w-full">
        {/* 싱글플레이 */}
        <motion.section
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 bg-board/60 rounded-2xl border border-gold/20 p-6"
        >
          <h2 className="font-cinzel text-lg text-gold mb-1">싱글플레이</h2>
          <p className="text-text/40 text-xs font-inter mb-5">AI 4명과 마이티 한 판</p>

          <div className="space-y-3 mb-6">
            {AI_LEVELS.map(({ level, label, desc, color }) => (
              <button
                key={level}
                onClick={() => setSelectedLevel(level)}
                className={`
                  w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all
                  ${selectedLevel === level
                    ? 'bg-gold/10 border-gold'
                    : 'bg-white/5 border-white/10 hover:border-white/30'
                  }
                `}
              >
                <div className="text-left">
                  <p className={`font-bold text-sm ${selectedLevel === level ? 'text-gold' : 'text-text'}`}>{label}</p>
                  <p className="text-text/40 text-xs">{desc}</p>
                </div>
                {selectedLevel === level && (
                  <span className={`text-lg ${color}`}>●</span>
                )}
              </button>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSinglePlay}
            className="w-full py-3 bg-gold text-background font-cinzel font-bold rounded-xl hover:bg-gold-bright transition-all shadow-mighty"
          >
            게임 시작
          </motion.button>
        </motion.section>

        {/* 멀티플레이 */}
        <motion.section
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 bg-board/60 rounded-2xl border border-gold/20 p-6"
        >
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-cinzel text-lg text-gold">멀티플레이</h2>
            <button
              onClick={fetchRooms}
              disabled={loadingRooms}
              className="text-xs text-text/40 hover:text-text/70 transition-colors"
            >
              {loadingRooms ? '...' : '↻ 새로고침'}
            </button>
          </div>
          <p className="text-text/40 text-xs font-inter mb-5">5인 실시간 대전</p>

          {/* 방 만들기 */}
          {!showCreateForm ? (
            <button
              onClick={() => setShowCreateForm(true)}
              className="w-full py-3 bg-gold/10 text-gold rounded-xl border border-gold/30 hover:bg-gold/20 text-sm font-bold transition-all mb-4"
            >
              + 방 만들기
            </button>
          ) : (
            <div className="mb-4 space-y-2">
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateRoom()}
                placeholder="방 이름 입력..."
                className="w-full px-3 py-2 bg-white/5 border border-gold/30 rounded-lg text-sm text-text placeholder-text/30 outline-none focus:border-gold"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCreateRoom}
                  disabled={creating || !roomName.trim()}
                  className="flex-1 py-2 bg-gold text-background rounded-lg text-sm font-bold disabled:opacity-50 hover:bg-gold-bright transition-all"
                >
                  {creating ? '생성중...' : '만들기'}
                </button>
                <button
                  onClick={() => { setShowCreateForm(false); setRoomName('') }}
                  className="px-4 py-2 bg-white/5 text-text/50 rounded-lg text-sm hover:bg-white/10 transition-all"
                >
                  취소
                </button>
              </div>
            </div>
          )}

          {/* 방 목록 */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {rooms.length === 0 ? (
              <div className="rounded-xl bg-white/5 border border-white/5 p-4">
                <p className="text-text/30 text-xs text-center">공개 방이 없습니다</p>
              </div>
            ) : (
              rooms
                .filter((r) => r.status === 'waiting')
                .map((room) => (
                  <button
                    key={room.id}
                    onClick={() => handleJoinRoom(room.id)}
                    disabled={room.players.length >= room.maxPlayers}
                    className="w-full flex items-center justify-between px-4 py-3 bg-white/5 border border-white/10 rounded-xl hover:border-gold/40 hover:bg-white/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <div className="text-left">
                      <p className="text-sm font-bold text-text">{room.name}</p>
                    </div>
                    <span className="text-xs text-text/50 font-inter">
                      {room.players.length}/{room.maxPlayers}명
                    </span>
                  </button>
                ))
            )}
          </div>
        </motion.section>
      </main>
    </div>
  )
}
