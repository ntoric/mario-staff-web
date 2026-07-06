import { useEffect, useState } from 'react'
import { Timer } from 'lucide-react'

export function OrderTimer({
  createdAt,
  active = true,
  light = false,
}: {
  createdAt: string
  active?: boolean
  light?: boolean
}) {
  const [elapsed, setElapsed] = useState('00:00:00')

  useEffect(() => {
    if (!active) return

    const update = () => {
      const start = new Date(createdAt).getTime()
      const diff = Math.max(0, Date.now() - start)
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setElapsed(
        `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      )
    }

    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [createdAt, active])

  if (!active) return null

  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
        light ? 'text-white/90' : 'text-primary'
      }`}
    >
      <Timer size={11} />
      {elapsed}
    </span>
  )
}
