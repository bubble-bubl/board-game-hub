'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { HubBackground } from '../components/hub/HubBackground'

const GAMES = [
  {
    id: 'mighty',
    title: '마이티',
    subtitle: '카드게임',
    description: '5인 트릭테이킹 카드게임',
    href: '/games/mighty',
    available: true,
    icon: '🃏',
  },
  {
    id: 'game2',
    title: '준비중',
    subtitle: '곧 출시',
    description: '',
    href: '#',
    available: false,
    icon: '🎲',
  },
  {
    id: 'game3',
    title: '준비중',
    subtitle: '곧 출시',
    description: '',
    href: '#',
    available: false,
    icon: '♟️',
  },
]

export default function HubPage() {
  return (
    <div className="relative min-h-screen bg-background overflow-hidden flex flex-col">
      <HubBackground />

      {/* 헤더 */}
      <header className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-gold/10">
        <h1 className="font-cinzel text-2xl text-gold tracking-widest font-bold">BoardHub</h1>
        <button className="px-4 py-2 rounded-lg border border-gold/30 text-gold/70 hover:border-gold hover:text-gold transition-all text-sm font-inter">
          로그인
        </button>
      </header>

      {/* 히어로 섹션 */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gold/60 text-sm font-inter tracking-widest mb-3 uppercase"
          >
            Online Board Game Hub
          </motion.p>
          <h2 className="font-cinzel text-4xl md:text-6xl font-black text-text mb-4">
            보드게임을
            <br />
            <span className="text-gold">즐겨보세요</span>
          </h2>
          <p className="text-text/40 font-inter text-sm">AI와 싱글플레이 · 친구와 멀티플레이</p>
        </motion.div>

        {/* 게임 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
          {GAMES.map((game, i) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1, type: 'spring', stiffness: 200 }}
            >
              <Link href={game.href} className={game.available ? '' : 'pointer-events-none'}>
                <motion.div
                  whileHover={game.available ? { y: -8, scale: 1.02 } : {}}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className={`
                    relative rounded-2xl border p-6 text-center cursor-pointer transition-all
                    ${game.available
                      ? 'bg-board/80 border-gold/30 hover:border-gold hover:shadow-mighty backdrop-blur-sm'
                      : 'bg-board/30 border-white/5 opacity-40'
                    }
                  `}
                >
                  <div className="text-5xl mb-4">{game.icon}</div>
                  <h3 className="font-cinzel text-xl text-text font-bold mb-1">{game.title}</h3>
                  <p className="text-gold/60 text-xs font-inter mb-2">{game.subtitle}</p>
                  {game.description && (
                    <p className="text-text/40 text-xs font-inter">{game.description}</p>
                  )}
                  {game.available && (
                    <div className="mt-4 inline-block px-4 py-1.5 bg-gold/10 border border-gold/30 rounded-full text-gold text-xs font-inter">
                      플레이 →
                    </div>
                  )}
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
      </main>

      {/* 푸터 */}
      <footer className="relative z-10 text-center py-4 text-text/20 text-xs font-inter border-t border-white/5">
        BoardHub · 마이티 카드게임
      </footer>
    </div>
  )
}
