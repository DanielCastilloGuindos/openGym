import { describe, it, expect } from 'vitest'
import { calculateUserStats, evaluateAchievements, checkNewAchievements } from './achievements.js'

describe('achievements system', () => {
  it('calculates initial stats for empty state', () => {
    const s = { workouts: [], exWeights: {}, unit: 'kg' }
    const stats = calculateUserStats(s)
    expect(stats.totalWorkouts).toBe(0)
    expect(stats.totalVolumeKg).toBe(0)
    expect(stats.prCount).toBe(0)
  })

  it('evaluates unlocked achievements when thresholds are met', () => {
    const s = {
      workouts: [
        { id: '1', d: '2026-10-10', vol: 5000 },
        { id: '2', d: '2026-10-11', vol: 6000 },
      ],
      exWeights: { '0025': { w: 100 } },
      unit: 'kg',
    }
    const ach = evaluateAchievements(s)
    const firstStep = ach.find(a => a.id === 'workouts_1')
    const mover = ach.find(a => a.id === 'vol_10k')
    const pr1 = ach.find(a => a.id === 'prs_1')

    expect(firstStep?.unlocked).toBe(true)
    expect(mover?.unlocked).toBe(true)
    expect(pr1?.unlocked).toBe(true)

    const hundred = ach.find(a => a.id === 'workouts_100')
    expect(hundred?.unlocked).toBe(false)
    expect(hundred?.percentage).toBe(2)
  })

  it('detects newly unlocked achievements between states', () => {
    const prev = { workouts: [], exWeights: {} }
    const next = {
      workouts: [{ id: '1', d: '2026-10-10', vol: 2000 }],
      exWeights: { '0025': { w: 100 } },
    }
    const newly = checkNewAchievements(prev, next)
    const ids = newly.map(a => a.id)
    expect(ids).toContain('workouts_1')
    expect(ids).toContain('prs_1')
  })
})
