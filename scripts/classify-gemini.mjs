import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const envPath = join(root, '.env')
const exDataPath = join(root, 'frontend', 'src', 'lib', 'exercises-data.js')
const aiClsPath = join(root, 'frontend', 'src', 'lib', 'ai-classifications.json')

// Load environment variables from .env
function loadEnv() {
  if (!existsSync(envPath)) return
  const raw = readFileSync(envPath, 'utf8')
  for (const line of raw.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq !== -1) {
      const key = trimmed.slice(0, eq).trim()
      const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
      if (key && !process.env[key]) {
        process.env[key] = val
      }
    }
  }
}

loadEnv()

const CRITERIA_DEFINITIONS = `
You are an expert biomechanist, kinesiologist, and strength & conditioning specialist.
For each exercise provided, you must classify it according to these 9 strict criteria with valid enum values:

1. "pat" (Movement Pattern):
   - "push" (Push / Empuje: chest press, overhead press, push-ups, dips, triceps extension)
   - "pull" (Pull / Tracción: pull-ups, rows, lat pulldowns, curls, face pulls)
   - "knee_dominant" (Knee dominant / Dominante de rodilla: squats, lunges, leg press, leg extension, step-ups)
   - "hip_dominant" (Hip dominant / Dominante de cadera: deadlifts, hip thrust, good mornings, leg curls, swings)
   - "core" (Core / Abdominal stability / Tronco: planks, crunches, sit-ups, leg raises, pallof)
   - "other" (Other / Mobility / Stretching)

2. "jnt" (Joint Involvement):
   - "compound" (Multi-joint / Multiarticular: 2 or more joints moving)
   - "isolation" (Single-joint / Monoarticular: 1 joint moving)

3. "kin" (Kinetic Chain):
   - "closed" (Closed Kinetic Chain / Cadena cerrada: distal limb is fixed, body moves, e.g. squats, push-ups, pull-ups, dips)
   - "open" (Open Kinetic Chain / Cadena abierta: torso fixed, distal limb moves freely, e.g. bench press, leg extension, bicep curl, pulldowns)

4. "cnt" (Contraction Type):
   - "dynamic" (Dynamic / Concentrica y excentrica)
   - "isometric" (Isometric / Static hold: planks, wall sit, static holds)

5. "hrz" (Session Hierarchy):
   - "main" (Main / Core Lift: high neuromuscular demand compound exercise, barbell/dumbbell/bodyweight foundations)
   - "accessory" (Accessory / Analitico: secondary, isolation, or finishing exercises)

6. "vel" (Force & Velocity):
   - "strength" (Controlled force / Max strength: standard hypertrophy/strength tempo)
   - "power" (Power / Plyometric / Explosive: jumps, throws, olympic lifts, sprints, clap push-ups)

7. "nrg" (Energy System):
   - "alactic" (Anaerobic Alactic / ATP-CP: short explosive power <= 10s)
   - "lactic" (Anaerobic Lactic / Glycolytic: 15s to 2min resistance sets)
   - "aerobic" (Aerobic / Oxidative: cardio, running, cycling, rowing, sustained low/moderate intensity)

8. "lat" (Laterality):
   - "bilateral" (Bilateral: both sides execute the movement symmetrically together)
   - "unilateral" (Unilateral: single arm, single leg, alternating or asymmetric movement)

9. "pln" (Movement Plane):
   - "sagittal" (Sagittal plane: flexion/extension, forward/backward)
   - "frontal" (Frontal plane: abduction/adduction, lateral movements, jumping jacks)
   - "transverse" (Transverse plane: rotation, twists, diagonal crossovers)
`

async function callGemini(batch, model = 'gemini-2.5-flash') {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.VITE_GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined in .env or environment!')
  }

  const prompt = `${CRITERIA_DEFINITIONS}

Classify the following array of exercises and return a JSON array containing objects with this exact structure:
[
  {
    "id": "exercise id",
    "pat": "push" | "pull" | "knee_dominant" | "hip_dominant" | "core" | "other",
    "jnt": "compound" | "isolation",
    "kin": "closed" | "open",
    "cnt": "dynamic" | "isometric",
    "hrz": "main" | "accessory",
    "vel": "strength" | "power",
    "nrg": "alactic" | "lactic" | "aerobic",
    "lat": "bilateral" | "unilateral",
    "pln": "sagittal" | "frontal" | "transverse"
  }
]

Exercises to classify:
${JSON.stringify(batch.map(e => ({ id: e.id, name: e.n, bodyPart: e.bp, target: e.tg, equipment: e.eq, secondaryMuscles: e.sm })), null, 2)}
`

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        response_mime_type: 'application/json'
      }
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    if (model !== 'gemini-1.5-flash' && response.status === 404) {
      console.log(`[Gemini] Model ${model} not available, retrying with gemini-1.5-flash...`)
      return callGemini(batch, 'gemini-1.5-flash')
    }
    throw new Error(`Gemini API error (HTTP ${response.status}): ${errorText}`)
  }

  const data = await response.json()
  const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!textContent) {
    throw new Error('Empty response received from Gemini API')
  }

  try {
    return JSON.parse(textContent)
  } catch (err) {
    throw new Error(`Failed to parse JSON response from Gemini: ${err.message}\nRaw text: ${textContent}`)
  }
}

function loadExercises() {
  const code = readFileSync(exDataPath, 'utf8')
  const match = code.match(/export const EXDB\s*=\s*(\[[\s\S]*\])/)
  if (!match) {
    throw new Error('Could not parse EXDB from exercises-data.js')
  }
  return JSON.parse(match[1])
}

function loadStoredClassifications() {
  if (existsSync(aiClsPath)) {
    try {
      return JSON.parse(readFileSync(aiClsPath, 'utf8'))
    } catch {
      return {}
    }
  }
  return {}
}

function saveClassifications(data) {
  writeFileSync(aiClsPath, JSON.stringify(data, null, 2), 'utf8')
}

async function runClassification(options = {}) {
  const { force = false, limit = Infinity, batchSize = 25 } = options
  loadEnv()

  const currentKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.VITE_GEMINI_API_KEY
  if (!currentKey) {
    console.error('\n❌ Error: GEMINI_API_KEY is not set in .env or environment.')
    console.error('Please add GEMINI_API_KEY=your_gemini_api_key in the .env file in the project root.\n')
    return { success: false, reason: 'missing_api_key' }
  }

  console.log('[Gemini Classifier] Loading exercises and existing classifications...')
  const exercises = loadExercises()
  const existing = force ? {} : loadStoredClassifications()

  const pending = exercises.filter(ex => {
    if (force) return true
    const cl = existing[ex.id]
    if (!cl) return true
    const required = ['pat', 'jnt', 'kin', 'cnt', 'hrz', 'vel', 'nrg', 'lat', 'pln']
    return required.some(k => !cl[k])
  }).slice(0, limit)

  if (pending.length === 0) {
    console.log(`[Gemini Classifier] ✨ All ${exercises.length} exercises are already classified in ai-classifications.json. Nothing to do.`)
    return { success: true, processed: 0, total: exercises.length }
  }

  console.log(`[Gemini Classifier] Found ${pending.length} unclassified exercises (Total: ${exercises.length}). Processing in batches of ${batchSize}...`)

  let processedCount = 0
  for (let i = 0; i < pending.length; i += batchSize) {
    const batch = pending.slice(i, i + batchSize)
    console.log(`[Gemini Classifier] 🔄 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(pending.length / batchSize)} (${batch.length} exercises)...`)

    try {
      const results = await callGemini(batch)
      if (Array.isArray(results)) {
        for (const item of results) {
          if (item && item.id) {
            existing[item.id] = {
              pat: item.pat,
              jnt: item.jnt,
              kin: item.kin,
              cnt: item.cnt,
              hrz: item.hrz,
              vel: item.vel,
              nrg: item.nrg,
              lat: item.lat,
              pln: item.pln,
              classifiedAt: new Date().toISOString(),
              by: 'gemini'
            }
            processedCount++
          }
        }
        saveClassifications(existing)
        console.log(`[Gemini Classifier] ✅ Batch completed. Saved ${processedCount}/${pending.length} classified exercises.`)
      }
    } catch (err) {
      console.error(`[Gemini Classifier] ⚠️ Error processing batch: ${err.message}`)
      await new Promise(r => setTimeout(r, 2000))
    }

    if (i + batchSize < pending.length) {
      await new Promise(r => setTimeout(r, 1000))
    }
  }

  console.log(`\n🎉 [Gemini Classifier] Complete! Total classified: ${Object.keys(existing).length}/${exercises.length}.\n`)
  return { success: true, processed: processedCount, total: exercises.length }
}

const args = process.argv.slice(2)
const isCron = args.includes('--cron')
const isForce = args.includes('--force')
const limitIndex = args.indexOf('--limit')
const limit = limitIndex !== -1 ? parseInt(args[limitIndex + 1], 10) : Infinity

let intervalMinutes = 60
const cronIndex = args.indexOf('--cron')
if (cronIndex !== -1 && args[cronIndex + 1] && !isNaN(parseInt(args[cronIndex + 1], 10))) {
  intervalMinutes = parseInt(args[cronIndex + 1], 10)
}

if (isCron) {
  console.log(`[Gemini Classifier Cron] ⏰ Starting periodic daemon (interval: ${intervalMinutes} minutes)...`)
  runClassification({ force: isForce, limit }).catch(console.error)

  setInterval(() => {
    console.log(`\n[Gemini Classifier Cron] ⏰ Triggering scheduled check at ${new Date().toLocaleTimeString()}...`)
    runClassification({ force: isForce, limit }).catch(console.error)
  }, intervalMinutes * 60 * 1000)
} else {
  runClassification({ force: isForce, limit })
    .then(res => {
      if (!res.success && res.reason === 'missing_api_key') {
        process.exitCode = 1
      }
    })
    .catch(err => {
      console.error(err)
      process.exitCode = 1
    })
}
