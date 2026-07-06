export function getTableGridCols(width: number): number {
  if (width < 400) return 2
  if (width < 600) return 3
  if (width < 900) return 4
  if (width < 1200) return 5
  return 6
}

export function useBreakpoint() {
  if (typeof window === 'undefined') return 'mobile'
  const w = window.innerWidth
  if (w >= 1200) return 'desktop'
  if (w >= 600) return 'tablet'
  return 'mobile'
}
