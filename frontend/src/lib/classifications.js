import { t } from './i18n.js'
import aiClassifications from './ai-classifications.json'

export const CRITERIA = [
  {
    key: 'pat',
    name: 'Movement Pattern',
    label: 'Movement Pattern',
    icon: 'shuffle',
    options: [
      { value: 'push', label: 'Push', desc: 'Alejar resistencia del cuerpo (banca, press, flexiones)' },
      { value: 'pull', label: 'Pull', desc: 'Acercar peso hacia ti (dominadas, remos, jalones)' },
      { value: 'knee_dominant', label: 'Knee-dominant', desc: 'Dominante de rodilla (sentadillas, zancadas, prensa)' },
      { value: 'hip_dominant', label: 'Hip-dominant', desc: 'Dominante de cadera / Hinge (peso muerto, hip thrust, swing)' },
      { value: 'core', label: 'Core / Abdominal', desc: 'Estabilidad y trabajo del tronco' },
      { value: 'other', label: 'Other', desc: 'Otros movimientos / estiramientos' },
    ]
  },
  {
    key: 'jnt',
    name: 'Joint Involvement',
    label: 'Joint Involvement',
    icon: 'figureStrength',
    options: [
      { value: 'compound', label: 'Compound (Multi-joint)', desc: 'Multiarticular (dos o más articulaciones)' },
      { value: 'isolation', label: 'Isolation (Single-joint)', desc: 'Monoarticular (una sola articulación)' },
    ]
  },
  {
    key: 'kin',
    name: 'Kinetic Chain',
    label: 'Kinetic Chain',
    icon: 'link',
    options: [
      { value: 'closed', label: 'Closed Kinetic Chain', desc: 'Extremidades fijas, el cuerpo se desplaza' },
      { value: 'open', label: 'Open Kinetic Chain', desc: 'Torso fijo, las extremidades desplazan la carga' },
    ]
  },
  {
    key: 'cnt',
    name: 'Contraction Type',
    label: 'Contraction Type',
    icon: 'timer',
    options: [
      { value: 'dynamic', label: 'Dynamic', desc: 'Fase concéntrica y excéntrica con movimiento' },
      { value: 'isometric', label: 'Isometric', desc: 'Tensión estática sin cambio articular' },
    ]
  },
  {
    key: 'hrz',
    name: 'Session Hierarchy',
    label: 'Session Hierarchy',
    icon: 'trophy',
    options: [
      { value: 'main', label: 'Main / Core Lift', desc: 'Ejercicios centrales de alta demanda al inicio' },
      { value: 'accessory', label: 'Accessory', desc: 'Ejercicios complementarios o analíticos' },
    ]
  },
  {
    key: 'vel',
    name: 'Force & Velocity',
    label: 'Force & Velocity',
    icon: 'bolt',
    options: [
      { value: 'strength', label: 'Max Strength / Controlled', desc: 'Fuerza controlada o máxima carga' },
      { value: 'power', label: 'Plyometric / Power', desc: 'Movimientos explosivos y potencia' },
    ]
  },
  {
    key: 'nrg',
    name: 'Energy System',
    label: 'Energy System',
    icon: 'flame',
    options: [
      { value: 'alactic', label: 'Anaerobic Alactic', desc: 'Esfuerzos explosivos y cortos (0-10s)' },
      { value: 'lactic', label: 'Anaerobic Lactic', desc: 'Alta intensidad hipertrófica (15s-2min)' },
      { value: 'aerobic', label: 'Aerobic', desc: 'Media/baja intensidad sostenida con oxígeno' },
    ]
  },
  {
    key: 'lat',
    name: 'Laterality',
    label: 'Laterality',
    icon: 'scale',
    options: [
      { value: 'bilateral', label: 'Bilateral', desc: 'Ambos lados trabajan simétricamente' },
      { value: 'unilateral', label: 'Unilateral', desc: 'Un lado independiente / asimétrico' },
    ]
  },
  {
    key: 'pln',
    name: 'Movement Plane',
    label: 'Movement Plane',
    icon: 'target',
    options: [
      { value: 'sagittal', label: 'Sagittal Plane', desc: 'Hacia adelante y atrás (flexión/extensión)' },
      { value: 'frontal', label: 'Frontal Plane', desc: 'Movimientos laterales (abducción/aducción)' },
      { value: 'transverse', label: 'Transverse Plane', desc: 'Movimientos de rotación' },
    ]
  }
]

export function classifyExercise(ex) {
  if (!ex) return {}
  // If the exercise already has pre-assigned classification fields, return them
  if (ex.pat && ex.jnt && ex.kin && ex.cnt && ex.hrz && ex.vel && ex.nrg && ex.lat && ex.pln) {
    return {
      pat: ex.pat,
      jnt: ex.jnt,
      kin: ex.kin,
      cnt: ex.cnt,
      hrz: ex.hrz,
      vel: ex.vel,
      nrg: ex.nrg,
      lat: ex.lat,
      pln: ex.pln,
    }
  }

  // If classified by Gemini AI and saved to ai-classifications.json
  const ai = ex.id && aiClassifications ? aiClassifications[ex.id] : null
  if (ai && ai.pat && ai.jnt && ai.kin && ai.cnt && ai.hrz && ai.vel && ai.nrg && ai.lat && ai.pln) {
    return {
      pat: ai.pat,
      jnt: ai.jnt,
      kin: ai.kin,
      cnt: ai.cnt,
      hrz: ai.hrz,
      vel: ai.vel,
      nrg: ai.nrg,
      lat: ai.lat,
      pln: ai.pln,
    }
  }

  const n = (ex.n || '').toLowerCase()
  const bp = (ex.bp || '').toLowerCase()
  const tg = (ex.tg || '').toLowerCase()
  const eq = (ex.eq || '').toLowerCase()
  const mg = (ex.mg || '').toLowerCase()
  const sm = (ex.sm || []).map(s => s.toLowerCase())
  const st = (ex.st || []).join(' ').toLowerCase()

  // 1. Movement Pattern
  let pat = 'push'
  const isKnee = tg === 'quads' || n.includes('squat') || n.includes('lunge') || n.includes('leg press') ||
    n.includes('step-up') || n.includes('step up') || n.includes('leg extension') || n.includes('sissy') ||
    n.includes('split squat') || n.includes('jump squat') || n.includes('hack squat')
  const isHip = tg === 'glutes' || tg === 'hamstrings' || n.includes('deadlift') || n.includes('hip thrust') ||
    n.includes('bridge') || n.includes('swing') || n.includes('good morning') || n.includes('hyperextension') ||
    n.includes('back extension') || n.includes('leg curl') || n.includes('rdl') || n.includes('pull through') ||
    n.includes('kickback') || n.includes('glute-ham') || n.includes('romanian')
  const isPull = bp === 'back' || tg === 'lats' || tg === 'upper back' || tg === 'biceps' || tg === 'traps' ||
    n.includes('pull') || n.includes('row') || n.includes('chin') || n.includes('curl') || n.includes('shrug') ||
    n.includes('rear delt') || n.includes('face pull') || n.includes('pulldown')
  const isPush = bp === 'chest' || bp === 'shoulders' || tg === 'delts' || tg === 'pectorals' || tg === 'triceps' ||
    n.includes('press') || n.includes('push') || n.includes('dip') || n.includes('triceps extension') ||
    n.includes('front raise') || n.includes('lateral raise') || n.includes('pushdown')

  if (isKnee) pat = 'knee_dominant'
  else if (isHip) pat = 'hip_dominant'
  else if (isPull) pat = 'pull'
  else if (isPush) pat = 'push'
  else if (bp === 'waist' || tg === 'abs') pat = 'core'
  else pat = 'other'

  // 2. Joint Involvement
  const isCompound = (
    n.includes('squat') || n.includes('deadlift') || n.includes('press') || n.includes('push-up') || n.includes('push up') ||
    n.includes('pull-up') || n.includes('pull up') || n.includes('chin-up') || n.includes('chin up') || n.includes('row') ||
    n.includes('dip') || n.includes('lunge') || n.includes('clean') || n.includes('snatch') || n.includes('jerk') ||
    n.includes('step-up') || n.includes('step up') || n.includes('leg press') || n.includes('thruster') || n.includes('burpee') ||
    n.includes('pulldown') || n.includes('bench') || bp === 'cardio'
  ) && !n.includes('wrist') && !n.includes('finger') && !n.includes('raise') && !n.includes('curl') && !n.includes('fly') &&
    !n.includes('extension') && !n.includes('kickback') && !n.includes('shrug')
  const jnt = isCompound ? 'compound' : 'isolation'

  // 3. Kinetic Chain
  const isClosed = (
    eq === 'body weight' || n.includes('squat') || n.includes('deadlift') || n.includes('push-up') || n.includes('push up') ||
    n.includes('pull-up') || n.includes('pull up') || n.includes('chin-up') || n.includes('chin up') || n.includes('dip') ||
    n.includes('lunge') || n.includes('plank') || n.includes('bridge') || n.includes('jump') || n.includes('step-up') ||
    n.includes('handstand') || n.includes('burpee') || n.includes('calf raise') || n.includes('incline push')
  ) && !n.includes('pulldown') && !n.includes('seated') && !n.includes('lying dumbbell') && !n.includes('cable')
  const kin = isClosed ? 'closed' : 'open'

  // 4. Contraction Type
  const isIso = n.includes('hold') || n.includes('plank') || n.includes('static') || n.includes('isometric') ||
    n.includes('lever') || (n.includes('sit') && n.includes('wall')) || n.includes('bridge hold') || n.includes('hang') ||
    (n.includes('stand') && n.includes('hold'))
  const cnt = isIso ? 'isometric' : 'dynamic'

  // 5. Hierarchy
  const isMain = jnt === 'compound' && (
    eq.includes('barbell') || eq.includes('olympic') || eq.includes('trap bar') || eq.includes('dumbbell') || eq.includes('body weight')
  ) && (
    n.includes('squat') || n.includes('deadlift') || n.includes('bench press') || n.includes('overhead press') ||
    n.includes('military press') || n.includes('shoulder press') || n.includes('pull-up') || n.includes('chin-up') ||
    n.includes('barbell row') || n.includes('clean') || n.includes('snatch') || n.includes('dip') || n.includes('push-up')
  )
  const hrz = isMain ? 'main' : 'accessory'

  // 6. Force & Velocity
  const isPower = n.includes('jump') || n.includes('hop') || n.includes('plyo') || n.includes('explosive') ||
    n.includes('clean') || n.includes('snatch') || n.includes('jerk') || n.includes('throw') || n.includes('slam') ||
    n.includes('clap') || n.includes('sprint') || n.includes('swing') || n.includes('speed') || n.includes('bound')
  const vel = isPower ? 'power' : 'strength'

  // 7. Energy System
  let nrg = 'lactic'
  if (
    bp === 'cardio' || eq.includes('bike') || eq.includes('ergometer') || eq.includes('skierg') ||
    eq.includes('elliptical') || eq.includes('stepmill') || n.includes('run') || n.includes('jog') ||
    n.includes('walk') || n.includes('cycle') || n.includes('rowing') || n.includes('swim')
  ) {
    nrg = 'aerobic'
  } else if (isPower || n.includes('1rm') || n.includes('heavy') || n.includes('max')) {
    nrg = 'alactic'
  } else {
    nrg = 'lactic'
  }

  // 8. Laterality / Symmetry
  const isUni = n.includes('single') || n.includes('one arm') || n.includes('one leg') || n.includes('one-arm') ||
    n.includes('one-leg') || n.includes('1 arm') || n.includes('1 leg') || n.includes('unilateral') ||
    n.includes('alternate') || n.includes('alternating') || n.includes('lunge') || n.includes('split squat') ||
    n.includes('step-up') || n.includes('step up') || n.includes('side') || n.includes('cross') ||
    n.includes('pistol') || n.includes('single-arm') || n.includes('single-leg') || n.includes('archer')
  const lat = isUni ? 'unilateral' : 'bilateral'

  // 9. Movement Plane
  let pln = 'sagittal'
  if (
    n.includes('lateral') || n.includes('side') || n.includes('abduction') || n.includes('adduction') ||
    n.includes('jumping jack') || n.includes('wide-grip pull') || n.includes('side bend') || n.includes('side plank') ||
    tg === 'abductors' || tg === 'adductors'
  ) {
    pln = 'frontal'
  } else if (
    n.includes('twist') || n.includes('rotat') || n.includes('russian') || n.includes('woodchop') ||
    n.includes('pallof') || n.includes('cross body') || n.includes('cross-body') || n.includes('diagonal') ||
    n.includes('windshield') || n.includes('torso rotation')
  ) {
    pln = 'transverse'
  } else {
    pln = 'sagittal'
  }

  return { pat, jnt, kin, cnt, hrz, vel, nrg, lat, pln }
}

// Helper to get localized labels
export function getCriteriaLabel(criterionKey) {
  const c = CRITERIA.find(x => x.key === criterionKey)
  return c ? t(c.label) : criterionKey
}

export function getOptionLabel(criterionKey, value) {
  const c = CRITERIA.find(x => x.key === criterionKey)
  if (!c) return value
  const opt = c.options.find(o => o.value === value)
  return opt ? t(opt.label) : value
}

// Return formatted list of classifications for display
export function getExerciseClassifications(ex) {
  const cls = classifyExercise(ex)
  return CRITERIA.map(c => ({
    key: c.key,
    name: c.name,
    label: t(c.label),
    icon: c.icon,
    value: cls[c.key],
    valueLabel: getOptionLabel(c.key, cls[c.key])
  }))
}

// Filter predicate for multiple criteria filters
export function matchesClassificationFilters(ex, filters = {}) {
  const cls = classifyExercise(ex)
  for (const [key, val] of Object.entries(filters)) {
    if (val && cls[key] !== val) {
      return false
    }
  }
  return true
}

// Compares candidateEx against sourceEx across the 9 biomechanical criteria
export function computeVariantSimilarity(candidateEx, sourceEx) {
  if (!candidateEx || !sourceEx) {
    return { score: 0, matchCount: 0, totalCount: 9, percentage: 0, isExact: false, matchingKeys: [], differingKeys: [] }
  }

  const candCls = classifyExercise(candidateEx)
  const srcCls = classifyExercise(sourceEx)

  let matchCount = 0
  const matchingKeys = []
  const differingKeys = []

  CRITERIA.forEach(c => {
    if (candCls[c.key] && srcCls[c.key] && candCls[c.key] === srcCls[c.key]) {
      matchCount++
      matchingKeys.push(c.key)
    } else {
      differingKeys.push(c.key)
    }
  })

  // Biomechanical weights:
  // Each matching category out of 9 gives 10 points.
  // Movement pattern (pat) matching gives +15 extra points.
  // Same body part (bp) gives +20 points.
  // Same target muscle (tg) gives +30 points.
  let score = matchCount * 10
  if (candCls.pat && srcCls.pat && candCls.pat === srcCls.pat) score += 15
  if (candidateEx.bp && sourceEx.bp && candidateEx.bp === sourceEx.bp) score += 20
  if (candidateEx.tg && sourceEx.tg && candidateEx.tg === sourceEx.tg) score += 30

  const isExact = matchCount === CRITERIA.length

  return {
    score,
    matchCount,
    totalCount: CRITERIA.length,
    percentage: Math.round((matchCount / CRITERIA.length) * 100),
    isExact,
    matchingKeys,
    differingKeys
  }
}

