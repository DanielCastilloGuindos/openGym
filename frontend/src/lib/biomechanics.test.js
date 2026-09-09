import { describe, it, expect } from 'vitest'
import { EXDB, exOr } from './exercises.js'
import { getBiomechanicalProfile, localizeVariant } from './biomechanics.js'

describe('biomechanics engine', () => {
  it('returns valid biomechanical profile for all 1324 exercises', () => {
    expect(EXDB.length).toBeGreaterThan(1300)
    for (const ex of EXDB) {
      const profile = getBiomechanicalProfile(ex)
      expect(profile).toBeDefined()
      expect(profile.variants).toBeInstanceOf(Array)
      expect(profile.variants.length).toBeGreaterThanOrEqual(1)

      for (const v of profile.variants) {
        expect(v.id).toBeTypeOf('string')
        expect(v.nameEn).toBeTypeOf('string')
        expect(v.focusEn).toBeTypeOf('string')
        expect(v.activation).toBeInstanceOf(Array)
        expect(v.activation.length).toBeGreaterThan(0)
        expect(v.cuesEn).toBeInstanceOf(Array)
        expect(v.cuesEn.length).toBeGreaterThan(0)

        const loc = localizeVariant(v)
        expect(loc.name).toBeTypeOf('string')
        expect(loc.focus).toBeTypeOf('string')
        expect(loc.cues).toBeInstanceOf(Array)
        expect(loc.activation[0].percent).toBeGreaterThan(0)
      }
    }
  })

  it('correctly maps incline bench press archetype', () => {
    // 0314: dumbbell incline bench press
    const inclineEx = exOr('0314')
    const profile = getBiomechanicalProfile(inclineEx)
    expect(profile.key).toBe('incline_press')
    expect(profile.variants.length).toBeGreaterThanOrEqual(2)
    const tucked = profile.variants.find(v => v.id.includes('tucked'))
    expect(tucked).toBeDefined()
    expect(tucked.advantageEn).toContain('Upper Pec')
  })

  it('correctly maps lat pulldown archetype', () => {
    // 2330: cable lat pulldown
    const latEx = exOr('2330')
    const profile = getBiomechanicalProfile(latEx)
    expect(profile.key).toBe('pulldown_pullup')
    expect(profile.variants.length).toBeGreaterThanOrEqual(2)
  })

  it('correctly maps squats archetype', () => {
    // 0043: barbell full squat
    const squatEx = exOr('0043')
    const profile = getBiomechanicalProfile(squatEx)
    expect(profile.key).toBe('squats')
    const quadBias = profile.variants.find(v => v.id.includes('heels') || v.id.includes('high-bar'))
    expect(quadBias).toBeDefined()
  })
})
