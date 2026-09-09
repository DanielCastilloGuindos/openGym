import { describe, it, expect } from 'vitest'
import {
  CDN_IMG_BASE,
  CDN_GIF_BASE,
  imgSrc,
  gifSrc,
  findOpenSourceExerciseMedia,
  EXDB
} from './exercises.js'

describe('open-source exercise media and animations', () => {
  it('defines valid open-source CDN endpoints', () => {
    expect(CDN_IMG_BASE).toContain('cdn.jsdelivr.net')
    expect(CDN_IMG_BASE).toContain('hasaneyldrm/exercises-dataset')
    expect(CDN_GIF_BASE).toContain('cdn.jsdelivr.net')
    expect(CDN_GIF_BASE).toContain('hasaneyldrm/exercises-dataset')
  })

  it('resolves imgSrc and gifSrc with open-source CDN URLs', () => {
    const ex = EXDB.find(e => e.gif && e.img)
    expect(ex).toBeDefined()
    const img = imgSrc(ex)
    const gif = gifSrc(ex)
    expect(img).toBe(CDN_IMG_BASE + ex.img)
    expect(gif).toBe(CDN_GIF_BASE + ex.gif)
  })

  it('matches open-source exercises by exact id', () => {
    const match = findOpenSourceExerciseMedia('0025')
    expect(match).toBeDefined()
    expect(match.id).toBe('0025')
    expect(match.gif).toBeTruthy()
    expect(match.img).toBeTruthy()
  })

  it('matches open-source exercises by English name', () => {
    const match = findOpenSourceExerciseMedia('barbell bench press')
    expect(match).toBeDefined()
    expect(match.gif).toBeTruthy()
  })

  it('matches open-source exercises by Spanish name or keywords', () => {
    const match = findOpenSourceExerciseMedia('press de banca')
    expect(match).toBeDefined()
    expect(match.gif).toBeTruthy()
  })

  it('matches squats and variations', () => {
    const match = findOpenSourceExerciseMedia('sentadilla')
    expect(match).toBeDefined()
    expect(match.gif).toBeTruthy()
  })

  it('handles non-matching or empty queries gracefully', () => {
    expect(findOpenSourceExerciseMedia('')).toBeNull()
    expect(findOpenSourceExerciseMedia(null)).toBeNull()
    expect(findOpenSourceExerciseMedia('xyznonexistentexercise12345')).toBeNull()
  })

  it('resolves media for custom exercises with open-source GIF/img', () => {
    const customEx = {
      id: 'c123',
      n: 'Mi Press Banca Personalizado',
      bp: 'chest',
      gif: '0025-EIeI8Vf.gif',
      img: '0025-EIeI8Vf.jpg',
      custom: true
    }
    expect(gifSrc(customEx)).toBe(CDN_GIF_BASE + '0025-EIeI8Vf.gif')
    expect(imgSrc(customEx)).toBe(CDN_IMG_BASE + '0025-EIeI8Vf.jpg')
  })

  it('preserves full URLs if custom exercise provides an external URL', () => {
    const customEx = {
      id: 'c456',
      n: 'External Exercise',
      gif: 'https://example.com/demo.gif',
      img: 'https://example.com/thumb.jpg'
    }
    expect(gifSrc(customEx)).toBe('https://example.com/demo.gif')
    expect(imgSrc(customEx)).toBe('https://example.com/thumb.jpg')
  })

  it('returns empty string when exercise has no media', () => {
    expect(gifSrc(null)).toBe('')
    expect(imgSrc(null)).toBe('')
    expect(gifSrc({})).toBe('')
    expect(imgSrc({})).toBe('')
  })
})

