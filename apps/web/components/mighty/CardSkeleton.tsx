'use client'

interface Props {
  count?: number
}

export function CardSkeleton({ count = 10 }: Props) {
  return (
    <div className="flex items-end justify-center gap-[-20px]">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="w-[72px] h-[108px] rounded-lg bg-white/5 border border-white/10 animate-pulse"
          style={{
            transform: `rotate(${(i - count / 2) * 3}deg)`,
            marginLeft: i === 0 ? 0 : -24,
            zIndex: i,
          }}
        />
      ))}
    </div>
  )
}
