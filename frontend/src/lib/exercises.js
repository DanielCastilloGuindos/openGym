import { EXDB } from './exercises-data.js'
import { USER_EXERCISE_MUSCLE_OVERRIDES, exerciseMuscleMetadataFor } from './exercise-muscle-batch-1.js'
import { t, getVersion, exerciseNameSearchText, getLang } from './i18n-core.js'
import { classifyExercise } from './classifications.js'
import EX_ES from './exercises-es.js'

export { EXDB }

export const exName = idOrEx => {
  if (!idOrEx) return ''
  const ex = typeof idOrEx === 'string' ? EXIDX[idOrEx] : idOrEx
  if (!ex) return typeof idOrEx === 'string' ? idOrEx : ''
  if (getLang() === 'es' && EX_ES[ex.id]) return EX_ES[ex.id]
  return ex.nameEn || ex.n
}

// The generated dataset remains the compatibility/raw export. The runtime catalogue applies
// owner-approved muscle metadata as a narrow overlay, so imports and historical tests that rely
// on the upstream shape keep working while EXIDX and pickers see the corrected model.
const catalogueExercise = ex => {
  const metadata = exerciseMuscleMetadataFor(ex?.id)
  if (!Object.keys(metadata).length) return ex
  const out = { ...ex, ...metadata }
  const user = USER_EXERCISE_MUSCLE_OVERRIDES[ex?.id] || {}
  // A future dataset row may carry explicit arrays of its own; preserve those over generated
  // defaults unless the owner has deliberately supplied a correction for the same field.
  for (const key of ['primaries', 'secondaries']) {
    if (Object.prototype.hasOwnProperty.call(ex, key) && !Object.prototype.hasOwnProperty.call(user, key)) out[key] = ex[key]
  }
  if (Array.isArray(out.primaries)) out.primaries = [...out.primaries]
  if (Array.isArray(out.secondaries)) out.secondaries = [...out.secondaries]
  return out
}

export const CATALOGUE = EXDB.map(catalogueExercise)

// The generated dataset already supplies secondary muscles for most exercises. Keep the
// handful of conservative catalogue additions that are useful to the muscle map here so a
// dataset refresh does not erase them. Values follow the dataset's existing alias vocabulary.
const SECONDARY_ADDITIONS = {
  '0027': ['rear deltoids'], // barbell bent over row
  '0293': ['rear deltoids'], // dumbbell bent over row
  '0499': ['rear deltoids'], // inverted row
  '0861': ['rear deltoids'], // cable seated row
}

// Secondary muscles for an exercise, with the small conservative additions applied as an
// overlay. The raw dataset is never mutated - consumers that want the pristine catalogue
// (export, print, import) keep reading EXDB untouched, while the muscle map sees the
// enriched list. Values follow the dataset's existing alias vocabulary.
export const smOf = ex => {
  const base = Array.isArray(ex?.sm) ? ex.sm : (ex?.sm ? [ex.sm] : [])
  return [...new Set([...base, ...(SECONDARY_ADDITIONS[ex?.id] || [])])]
}

export const EXIDX = {}
CATALOGUE.forEach(e => {
  let enName = e.n
  e.nameEn = enName
  Object.defineProperty(e, 'n', {
    get() {
      if (getLang() === 'es' && EX_ES[e.id]) {
        return EX_ES[e.id]
      }
      return enName
    },
    set(v) {
      enName = v
    },
    configurable: true,
    enumerable: true
  })
  Object.assign(e, classifyExercise(e))
  EXIDX[e.id] = e
})
export const BODYPARTS = [...new Set(CATALOGUE.map(e => e.bp))].sort()

// Equipment options present in a given list of exercises, most common first (issue #6).
// Deriving them from the *already filtered* list keeps the chip row short and means
// every body-part × equipment combination on screen has results behind it.
export function equipmentOf(list) {
  const c = {}
  list.forEach(e => { if (e.eq) c[e.eq] = (c[e.eq] || 0) + 1 })
  return Object.keys(c).sort((a, b) => c[b] - c[a] || (a < b ? -1 : 1))
}

// Custom (user-created) exercises live in synced state S.customEx (issue #11) and are
// merged into the id index here so every EXIDX[id] lookup keeps working unchanged.
let customIds = []
export function registerCustom(list) {
  customIds.forEach(id => {
    delete EXIDX[id]
    const builtIn = CATALOGUE.find(ex => ex.id === id)
    if (builtIn) EXIDX[id] = builtIn
  })
  customIds = (list || []).map(e => e.id)
  ;(list || []).forEach(e => {
    Object.assign(e, classifyExercise(e))
    EXIDX[e.id] = e
  })
}
// Full searchable catalogue — customs first so your own exercises are easy to find.
export const allExercises = st => [...(st.customEx || []), ...CATALOGUE]

function searchableText(value) {
  if (Array.isArray(value)) return value.map(searchableText).join(' ')
  if (value == null) return ''
  try { return String(value) } catch { return '' }
}

/** Case-insensitive search over built-in and legacy custom exercise metadata. */
function isSubsequence(needle, hay) {
  let i = 0
  for (const ch of hay) {
    if (ch === needle[i]) i++
    if (i === needle.length) return true
  }
  return false
}

// Fuzzy match score for one exercise against a query. Best hits: exact field match, then
// field prefix, then word-boundary starts, then substrings (closer to the start scores
// better), and finally typo-tolerant ordered subsequences. Fields are weighted - the name
// dominates, target/equipment matter, muscles and description are supporting evidence.
// 0 means no match, so matchesExerciseSearch stays a boolean filter while the picker can
// rank results by score.
export function searchScore(exercise, query) {
  const needle = searchableText(query).toLowerCase().trim()
  if (!needle) return 1
  const source = exercise && typeof exercise === 'object' ? exercise : {}
  const fields = [['n', 100], ['tg', 40], ['eq', 40], ['sm', 30], ['muscleGroups', 30], ['primaries', 30], ['secondaries', 30], ['desc', 10], ['cues', 10]]
  // Token-level matching: every query word must match somewhere (any order), so
  // "press bench" finds "Bench Press". The score sums each token's best hit.
  const tokens = needle.split(/[^a-z0-9]+/).filter(Boolean)
  if (!tokens.length) return 0
  let total = 0
  for (const token of tokens) {
    let best = 0
    for (const [field, weight] of fields) {
      const hay = searchableText(source[field]).toLowerCase()
      if (!hay) continue
      if (hay === token) best = Math.max(best, weight * 4)
      else if (hay.startsWith(token)) best = Math.max(best, weight * 3)
      const idx = hay.indexOf(token)
      if (idx > 0) best = Math.max(best, weight * 2 - Math.min(idx, 20) * 0.5)
      if (hay.split(/[^a-z0-9]+/).some(w => w.startsWith(token))) best = Math.max(best, weight * 2.5)
      if (isSubsequence(token, hay)) best = Math.max(best, weight + Math.max(0, 10 - (hay.length - token.length)))
    }
    if (!best) return 0 // every token must match
    total += best
  }
  return total
}

export function matchesExerciseSearch(exercise, query) {
  return searchScore(exercise, query) > 0
}

// Media normally sits next to the app (img/ and gif/, mounted into the web container).
// Defaults to the official open-source Exercise Dataset CDN (hasaneyldrm/exercises-dataset)
// so that demonstration animations work out of the box anywhere without local asset server.
export const CDN_IMG_BASE = 'https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@7455efae41b330c265e7cd4b78dfa848e7ce5ebd/images/'
export const CDN_GIF_BASE = 'https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@7455efae41b330c265e7cd4b78dfa848e7ce5ebd/videos/'

const ENV = import.meta.env || {}
const IMG_BASE = ENV.VITE_IMG_BASE || CDN_IMG_BASE
const GIF_BASE = ENV.VITE_GIF_BASE || CDN_GIF_BASE
const isFullUrl = u => typeof u === 'string' && (u.startsWith('http://') || u.startsWith('https://') || u.startsWith('data:') || u.startsWith('blob:'))

export const imgSrc = ex => {
  if (!ex) return ''
  const img = ex.img || ex.gif
  if (!img) return ''
  return isFullUrl(img) ? img : IMG_BASE + img
}

export const gifSrc = ex => {
  if (!ex) return ''
  const gif = ex.gif || ex.img
  if (!gif) return ''
  return isFullUrl(gif) ? gif : GIF_BASE + gif
}

/**
 * Finds an open-source exercise with animated demonstration GIF
 * matching a name or keywords in Spanish or English.
 */
export function findOpenSourceExerciseMedia(query) {
  if (!query || typeof query !== 'string') return null
  const q = query.trim().toLowerCase()
  if (!q) return null

  // 1. Direct match by ID
  if (EXIDX[q] && (EXIDX[q].gif || EXIDX[q].img)) return EXIDX[q]

  // 2. Exact name match (Spanish or English)
  const exact = CATALOGUE.find(e => {
    const es = (EX_ES[e.id] || '').toLowerCase()
    const en = (e.nameEn || e.n || '').toLowerCase()
    return es === q || en === q
  })
  if (exact && (exact.gif || exact.img)) return exact

  // 3. Substring match if query is sufficiently specific (>= 4 chars)
  if (q.length >= 4) {
    const sub = CATALOGUE.find(e => {
      const es = (EX_ES[e.id] || '').toLowerCase()
      const en = (e.nameEn || e.n || '').toLowerCase()
      return es.includes(q) || en.includes(q)
    })
    if (sub && (sub.gif || sub.img)) return sub
  }

  // 4. Token-based word scoring
  const clean = q.replace(/[^a-z0-9áéíóúñ]+/gi, ' ').trim()
  const stopWords = new Set(['con', 'de', 'del', 'la', 'el', 'los', 'las', 'en', 'para', 'y', 'a', 'the', 'with', 'and', 'for', 'in', 'on', 'at'])
  const words = clean.split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w))
  if (!words.length) return null

  let best = null
  let bestScore = 0
  for (const e of CATALOGUE) {
    if (!e.gif && !e.img) continue
    const es = (EX_ES[e.id] || '').toLowerCase()
    const en = (e.nameEn || e.n || '').toLowerCase()
    const target = `${es} ${en} ${e.tg || ''} ${e.bp || ''}`.toLowerCase()
    let score = 0
    for (const w of words) {
      if (target.includes(w)) {
        if (es.includes(w) || en.includes(w)) {
          score += 2
        } else {
          score += 1
        }
      }
    }
    if (score > bestScore && score >= Math.min(2, words.length * 2)) {
      bestScore = score
      best = e
    }
  }
  return best
}

// Cardio exercises log time + speed instead of weight × reps.
export const isCardio = idOrEx => (typeof idOrEx === 'string' ? EXIDX[idOrEx] : idOrEx)?.bp === 'cardio'

// Exercises the dataset already knows carry no external load (issue #32) — a quarter of the
// catalogue. This seeds the `bw` flag on a fresh config so a push-up never asks for a weight
// nobody was going to enter. It is only the default: the flag lives on the config, so a dip
// done with a belt can turn it off and a custom exercise can turn it on.
// Equipment with no meaningful load in kg: your own body, or a band whose "weight" is a colour.
// Both default to the bodyweight model (one reps stepper, progression in reps then sets); the
// per-exercise Bodyweight switch still overrides it either way (issue #39).
const BODYWEIGHT_EQ = new Set(['body weight', 'band', 'resistance band'])
export const isBodyweightEq = idOrEx =>
  BODYWEIGHT_EQ.has((typeof idOrEx === 'string' ? EXIDX[idOrEx] : idOrEx)?.eq)

// An id that resolves to nothing — a plan file built against a different exercise dataset,
// a custom exercise deleted on another device before the sync arrived — still has to
// render. A placeholder keeps it visible (and removable) instead of taking the whole view
// down on the first `ex.n`.
export const exOr = id => EXIDX[id] ||
  { id, n: t('Unknown exercise'), bp: '', tg: '', eq: '', sm: [], st: [], missing: true }

// Normalizes text by lowercasing and stripping diacritics/accents (e.g. "elevação" -> "elevacao")
export const normalizeStr = s => (s || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()

// Multi-token, accent-insensitive and multilingual exercise search.
// Matches when all whitespace-separated words in the query appear anywhere in the exercise's
// name, equipment, target muscle, body part (both in English and translated to active language),
// secondary muscles or description.
//
// The haystack is built once per exercise and cached: NFD-normalising ~1300 catalogue entries
// on every keystroke costs ~8ms on a desktop and several times that on a phone. The cache key
// is the i18n version (bumped by every setLang), so switching language rebuilds the translated
// terms. Custom exercises are re-cached automatically — the store clones state on update, so an
// edited exercise arrives as a new object the WeakMap has never seen.
const corpusCache = new WeakMap()

function corpusOf(e) {
  const v = getVersion()
  const hit = corpusCache.get(e)
  if (hit && hit.v === v) return hit.s
  const sm = Array.isArray(e?.sm) ? e.sm : []
  const s = normalizeStr([
    exerciseNameSearchText(e),
    e?.tg || '', t(e?.tg || ''),
    e?.eq || '', t(e?.eq || ''),
    e?.bp || '', t(e?.bp || ''),
    ...sm, ...sm.map(m => t(m)),
    e?.desc || ''
  ].join(' '))
  corpusCache.set(e, { v, s })
  return s
}

export function matchExercise(e, query) {
  if (!query) return true
  const tokens = normalizeStr(query).split(/\s+/).filter(Boolean)
  if (!tokens.length) return true
  if (!e || typeof e !== 'object') return false
  const corpus = corpusOf(e)
  return tokens.every(tok => corpus.includes(tok))
}
