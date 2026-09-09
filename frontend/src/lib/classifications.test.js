import { describe, it, expect } from 'vitest'
import { classifyExercise, matchesClassificationFilters, CRITERIA, getExerciseClassifications, getCriteriaLabel, getOptionLabel } from './classifications.js'
import { EXDB } from './exercises-data.js'

describe('classifications', () => {
  it('has 9 classification criteria defined', () => {
    expect(CRITERIA).toHaveLength(9)
    const keys = CRITERIA.map(c => c.key)
    expect(keys).toEqual(['pat', 'jnt', 'kin', 'cnt', 'hrz', 'vel', 'nrg', 'lat', 'pln'])
  })

  it('classifies squats properly', () => {
    const squat = EXDB.find(e => e.n.includes('barbell full squat') || e.n.includes('barbell squat') || e.n === 'squat') || {
      n: 'barbell squat', bp: 'upper legs', tg: 'quads', eq: 'barbell'
    }
    const c = classifyExercise(squat)
    expect(c.pat).toBe('knee_dominant')
    expect(c.jnt).toBe('compound')
    expect(c.kin).toBe('closed')
    expect(c.cnt).toBe('dynamic')
    expect(c.hrz).toBe('main')
    expect(c.vel).toBe('strength')
    expect(c.lat).toBe('bilateral')
    expect(c.pln).toBe('sagittal')
  })

  it('classifies bench press properly', () => {
    const bench = EXDB.find(e => e.n.includes('barbell bench press') || e.n === 'bench press') || {
      n: 'barbell bench press', bp: 'chest', tg: 'pectorals', eq: 'barbell'
    }
    const c = classifyExercise(bench)
    expect(c.pat).toBe('push')
    expect(c.jnt).toBe('compound')
    expect(c.cnt).toBe('dynamic')
    expect(c.hrz).toBe('main')
    expect(c.lat).toBe('bilateral')
    expect(c.pln).toBe('sagittal')
  })

  it('classifies deadlift properly', () => {
    const deadlift = EXDB.find(e => e.n.includes('barbell deadlift') || e.n === 'deadlift') || {
      n: 'barbell deadlift', bp: 'upper legs', tg: 'glutes', eq: 'barbell'
    }
    const c = classifyExercise(deadlift)
    expect(c.pat).toBe('hip_dominant')
    expect(c.jnt).toBe('compound')
    expect(c.kin).toBe('closed')
    expect(c.cnt).toBe('dynamic')
    expect(c.hrz).toBe('main')
    expect(c.lat).toBe('bilateral')
    expect(c.pln).toBe('sagittal')
  })

  it('classifies pull-up properly', () => {
    const pullup = EXDB.find(e => e.n === 'pull-up' || e.n === 'pull up' || e.n.includes('pull-up')) || {
      n: 'pull-up', bp: 'back', tg: 'lats', eq: 'body weight'
    }
    const c = classifyExercise(pullup)
    expect(c.pat).toBe('pull')
    expect(c.jnt).toBe('compound')
    expect(c.kin).toBe('closed')
    expect(c.cnt).toBe('dynamic')
  })

  it('classifies lateral raises in frontal plane and isolation', () => {
    const latRaise = EXDB.find(e => e.n.includes('dumbbell lateral raise') || e.n.includes('lateral raise')) || {
      n: 'dumbbell lateral raise', bp: 'shoulders', tg: 'delts', eq: 'dumbbell'
    }
    const c = classifyExercise(latRaise)
    expect(c.jnt).toBe('isolation')
    expect(c.pln).toBe('frontal')
  })

  it('classifies russian twists in transverse plane', () => {
    const twist = EXDB.find(e => e.n.includes('russian twist')) || {
      n: 'russian twist', bp: 'waist', tg: 'abs', eq: 'body weight'
    }
    const c = classifyExercise(twist)
    expect(c.pln).toBe('transverse')
  })

  it('classifies planks as isometric', () => {
    const plank = EXDB.find(e => e.n.includes('plank')) || {
      n: 'front plank', bp: 'waist', tg: 'abs', eq: 'body weight'
    }
    const c = classifyExercise(plank)
    expect(c.cnt).toBe('isometric')
  })

  it('filters exercises by multiple classification criteria', () => {
    const ex = {
      id: 'test-1',
      n: 'barbell bench press',
      bp: 'chest',
      tg: 'pectorals',
      eq: 'barbell',
      pat: 'push',
      jnt: 'compound',
      kin: 'open',
      cnt: 'dynamic',
      hrz: 'main',
      vel: 'strength',
      nrg: 'lactic',
      lat: 'bilateral',
      pln: 'sagittal'
    }

    expect(matchesClassificationFilters(ex, {})).toBe(true)
    expect(matchesClassificationFilters(ex, { pat: 'push' })).toBe(true)
    expect(matchesClassificationFilters(ex, { pat: 'pull' })).toBe(false)
    expect(matchesClassificationFilters(ex, { pat: 'push', jnt: 'compound' })).toBe(true)
    expect(matchesClassificationFilters(ex, { pat: 'push', jnt: 'isolation' })).toBe(false)
  })

  it('returns formatted classifications for display', () => {
    const ex = EXDB[0]
    const list = getExerciseClassifications(ex)
    expect(list).toHaveLength(9)
    expect(list[0]).toHaveProperty('key')
    expect(list[0]).toHaveProperty('label')
    expect(list[0]).toHaveProperty('value')
    expect(list[0]).toHaveProperty('valueLabel')
  })
})
