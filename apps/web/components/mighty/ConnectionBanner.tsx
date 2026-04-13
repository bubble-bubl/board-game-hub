'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  isConnected: boolean
  error: string | null
}

export function ConnectionBanner({ isConnected, error }: Props) {
  const show = !isConnected || !!error

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 py-2 px-4 text-sm font-inter"
          style={{ background: error ? '#7f1d1d' : '#1e3a5f' }}
        >
          <span className={`w-2 h-2 rounded-full animate-pulse ${error ? 'bg-red-400' : 'bg-yellow-400'}`} />
          <span className="text-white/90">
            {error ?? '서버 재연결 중...'}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
