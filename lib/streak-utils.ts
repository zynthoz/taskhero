// Helper function to calculate streak multiplier
export function getStreakMultiplier(streak: number): number {
  if (streak >= 30) return 2.0
  if (streak >= 14) return 1.5
  if (streak >= 7) return 1.2
  return 1.0
}

// Helper function to get streak multiplier display text
export function getStreakMultiplierText(streak: number): string {
  const multiplier = getStreakMultiplier(streak)
  if (multiplier === 1.0) return ''
  return `${multiplier}x`
}

// Helper function to get streak tier
export function getStreakTier(streak: number): 'none' | 'bronze' | 'silver' | 'gold' {
  if (streak >= 30) return 'gold'
  if (streak >= 14) return 'silver'
  if (streak >= 7) return 'bronze'
  return 'none'
}
