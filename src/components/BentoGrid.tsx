import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

export type BentoSpan = '1x1' | '2x1' | '1x2' | '2x2' | 'full'

const SPAN_CLASSES: Record<BentoSpan, string> = {
  '1x1': 'bento-span-1x1',
  '2x1': 'bento-span-2x1',
  '1x2': 'bento-span-1x2',
  '2x2': 'bento-span-2x2',
  full: 'bento-span-full',
}

const VARIANT_CLASSES = {
  default: 'bento-tile',
  accent: 'bento-tile bento-tile-accent',
  hero: 'bento-tile-hero',
  dark: 'bento-tile-dark',
  inset: 'bento-tile-inset',
} as const

export function BentoGrid({
  children,
  className = '',
  cols = 2,
}: {
  children: ReactNode
  className?: string
  cols?: 2 | 3
}) {
  return (
    <div
      className={`bento-grid ${cols === 3 ? 'bento-grid-3' : ''} ${className}`}
    >
      {children}
    </div>
  )
}

export function BentoTile({
  children,
  span = '1x1',
  variant = 'default',
  className = '',
  onClick,
}: {
  children: ReactNode
  span?: BentoSpan
  variant?: keyof typeof VARIANT_CLASSES
  className?: string
  onClick?: () => void
}) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`${SPAN_CLASSES[span]} ${VARIANT_CLASSES[variant]} ${onClick ? 'bento-tile-interactive text-left' : ''} ${className}`}
    >
      {children}
    </Tag>
  )
}

export function BentoStat({
  label,
  value,
  icon: Icon,
  iconColor,
  iconBg = 'clay-accent',
}: {
  label: string
  value: string
  icon: LucideIcon
  iconColor?: string
  iconBg?: string
}) {
  return (
    <>
      <div className={`w-9 h-9 md:w-10 md:h-10 rounded-2xl flex items-center justify-center mb-2 md:mb-3 shrink-0 ${iconBg}`}>
        <Icon size={18} style={iconColor ? { color: iconColor } : undefined} className={!iconColor ? 'text-primary' : undefined} />
      </div>
      <p className="text-[11px] md:text-xs text-gray500 font-medium leading-tight">{label}</p>
      <p className="text-base md:text-lg font-extrabold text-dark mt-0.5 leading-tight">{value}</p>
    </>
  )
}

export function BentoHeroStat({
  label,
  value,
  sublabel,
}: {
  label: string
  value: string
  sublabel?: string
}) {
  return (
    <div className="flex flex-col justify-center h-full">
      <p className="text-white/60 text-sm font-medium">{label}</p>
      <p className="text-white text-[28px] md:text-[36px] font-extrabold mt-1 tracking-tight leading-none">
        {value}
      </p>
      {sublabel && (
        <p className="text-white/50 text-xs mt-2 font-medium">{sublabel}</p>
      )}
    </div>
  )
}
