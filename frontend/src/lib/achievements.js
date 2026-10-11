import { streakWeeks } from './history.js'
import { t } from './i18n.js'

export const ACHIEVEMENT_DEFINITIONS = [
  // 1. Rachas (Streaks)
  {
    id: 'streak_2',
    category: 'streak',
    icon: 'flame',
    color: '#ff9800',
    title: 'Spark of Habit',
    desc: 'Maintain a 2-week workout streak',
    threshold: 2,
    progress: (stats) => stats.streak,
  },
  {
    id: 'streak_4',
    category: 'streak',
    icon: 'flame',
    color: '#ff5722',
    title: 'Monthly Momentum',
    desc: 'Maintain a 4-week workout streak',
    threshold: 4,
    progress: (stats) => stats.streak,
  },
  {
    id: 'streak_8',
    category: 'streak',
    icon: 'bolt',
    color: '#f44336',
    title: 'Iron Discipline',
    desc: 'Maintain an 8-week workout streak',
    threshold: 8,
    progress: (stats) => stats.streak,
  },
  {
    id: 'streak_12',
    category: 'streak',
    icon: 'crown',
    color: '#e91e63',
    title: 'Unstoppable Devotion',
    desc: 'Maintain a 12-week workout streak',
    threshold: 12,
    progress: (stats) => stats.streak,
  },

  // 2. Sesiones completadas (Workouts)
  {
    id: 'workouts_1',
    category: 'workouts',
    icon: 'sparkles',
    color: '#4caf50',
    title: 'First Step',
    desc: 'Log and complete your first workout',
    threshold: 1,
    progress: (stats) => stats.totalWorkouts,
  },
  {
    id: 'workouts_10',
    category: 'workouts',
    icon: 'dumbbell',
    color: '#2196f3',
    title: 'Double Digits',
    desc: 'Complete 10 workouts',
    threshold: 10,
    progress: (stats) => stats.totalWorkouts,
  },
  {
    id: 'workouts_50',
    category: 'workouts',
    icon: 'shield',
    color: '#3f51b5',
    title: 'Dedicated Athlete',
    desc: 'Complete 50 workouts',
    threshold: 50,
    progress: (stats) => stats.totalWorkouts,
  },
  {
    id: 'workouts_100',
    category: 'workouts',
    icon: 'trophy',
    color: '#ffb300',
    title: 'Century Club',
    desc: 'Complete 100 workouts',
    threshold: 100,
    progress: (stats) => stats.totalWorkouts,
  },

  // 3. Volumen acumulado (Volume Milestones)
  {
    id: 'vol_10k',
    category: 'volume',
    icon: 'barbell',
    color: '#00bcd4',
    title: '10 Ton Mover',
    desc: 'Lift 10,000 kg total cumulative volume',
    threshold: 10000,
    progress: (stats) => stats.totalVolumeKg,
  },
  {
    id: 'vol_50k',
    category: 'volume',
    icon: 'rocket',
    color: '#9c27b0',
    title: 'Titan Lifter',
    desc: 'Lift 50,000 kg total cumulative volume',
    threshold: 50000,
    progress: (stats) => stats.totalVolumeKg,
  },
  {
    id: 'vol_100k',
    category: 'volume',
    icon: 'crown',
    color: '#e040fb',
    title: 'Mega Ton Legend',
    desc: 'Lift 100,000 kg total cumulative volume',
    threshold: 100000,
    progress: (stats) => stats.totalVolumeKg,
  },

  // 4. Récords Personales (PRs)
  {
    id: 'prs_1',
    category: 'prs',
    icon: 'medal',
    color: '#ff9800',
    title: 'Breaking Boundaries',
    desc: 'Achieve your first Personal Record (PR)',
    threshold: 1,
    progress: (stats) => stats.prCount,
  },
  {
    id: 'prs_10',
    category: 'prs',
    icon: 'medal',
    color: '#ffb300',
    title: 'Record Breaker',
    desc: 'Collect 10 Personal Records across your lifts',
    threshold: 10,
    progress: (stats) => stats.prCount,
  },
  {
    id: 'prs_25',
    category: 'prs',
    icon: 'trophy',
    color: '#ffd700',
    title: 'Hall of Fame',
    desc: 'Collect 25 Personal Records across your lifts',
    threshold: 25,
    progress: (stats) => stats.prCount,
  },
]

/**
 * Calculates current user training statistics.
 */
export function calculateUserStats(S) {
  const workouts = S?.workouts || []
  const streak = streakWeeks(S || {})
  const totalWorkouts = workouts.length

  let totalVolumeKg = 0
  const isLb = (S?.unit || 'kg') === 'lb'
  const LB_TO_KG = 0.45359237

  for (const w of workouts) {
    const vol = Number(w.vol) || 0
    totalVolumeKg += isLb ? vol * LB_TO_KG : vol
  }

  // Count distinct PRs achieved or registered in exWeights
  const exWeights = S?.exWeights || {}
  const prCount = Object.keys(exWeights).length

  return {
    streak,
    totalWorkouts,
    totalVolumeKg: Math.round(totalVolumeKg),
    prCount,
  }
}

/**
 * Evaluates all achievements and returns their status and progress.
 */
export function evaluateAchievements(S) {
  const stats = calculateUserStats(S)
  return ACHIEVEMENT_DEFINITIONS.map(def => {
    const cur = def.progress(stats)
    const pct = Math.min(100, Math.round((cur / def.threshold) * 100))
    const unlocked = cur >= def.threshold
    return {
      ...def,
      current: cur,
      percentage: pct,
      unlocked,
    }
  })
}

/**
 * Check newly unlocked achievements after a workout is finished.
 */
export function checkNewAchievements(prevS, nextS) {
  const prevAch = evaluateAchievements(prevS)
  const nextAch = evaluateAchievements(nextS)
  const prevUnlocked = new Set(prevAch.filter(a => a.unlocked).map(a => a.id))
  return nextAch.filter(a => a.unlocked && !prevUnlocked.has(a.id))
}
