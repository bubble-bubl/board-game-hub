'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  open: boolean
  onClose: () => void
}

const SECTIONS = [
  {
    title: '기본 규칙',
    items: [
      '5명이 플레이, 각자 10장씩 패 배분 (나머지 3장은 키티)',
      '입찰 단계에서 주공(사장)을 결정합니다',
      '주공은 키티 3장을 교환하고 트럼프 수트를 선언합니다',
      '프렌드 카드를 선언 — 해당 카드를 낸 플레이어가 파트너',
      '10번의 트릭으로 점수 카드(A·10·K)를 획득합니다',
    ],
  },
  {
    title: '카드 강도 순서',
    items: [
      '① 마이티 (♠A, 트럼프가 ♠이면 ♥A)',
      '② 조커 (선이 아닐 때)',
      '③ 트럼프 수트 (높은 랭크 우선)',
      '④ 선 수트 (높은 랭크 우선)',
      '⑤ 나머지 카드',
    ],
  },
  {
    title: '점수 계산',
    items: [
      '점수 카드: A(1점), 10(1점), K(1점) — 수트당 3점',
      '조커가 포함된 트릭: +1점 (최대 13점)',
      '주공팀 승리 조건: 획득 점수 ≥ 선언 공약',
      '야당팀 승리 조건: 주공팀 공약 미달',
    ],
  },
  {
    title: '특수 규칙',
    items: [
      '팔로우: 같은 수트가 있으면 반드시 따라야 함',
      '조커콜: 선이 조커를 낼 때 원하는 수트 선언',
      '조커 제한: 첫 트릭·마지막 트릭에 선으로 조커 불가',
      '프렌드 공개: 프렌드 카드를 낸 순간 파트너 공개',
    ],
  },
]

export function RulesModal({ open, onClose }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg max-h-[80vh] overflow-y-auto bg-board border border-gold/20 rounded-2xl p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-cinzel text-xl text-gold tracking-wider">마이티 게임 규칙</h2>
              <button
                onClick={onClose}
                className="text-text/40 hover:text-text/80 transition-colors text-xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-5">
              {SECTIONS.map((section) => (
                <div key={section.title}>
                  <h3 className="text-sm font-bold text-gold/70 mb-2 font-cinzel">{section.title}</h3>
                  <ul className="space-y-1.5">
                    {section.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-xs text-text/70 font-inter">
                        <span className="text-gold/40 mt-0.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <button
              onClick={onClose}
              className="mt-6 w-full py-2.5 bg-gold/10 border border-gold/30 rounded-xl text-gold text-sm font-bold hover:bg-gold/20 transition-all"
            >
              확인
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
