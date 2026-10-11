import { MOBILE, isAndroid } from './mobile.js'

let HealthConnectNative = null

async function getPlugin() {
  if (HealthConnectNative) return HealthConnectNative
  if (!MOBILE) return null
  const android = await isAndroid()
  if (!android) return null

  try {
    const { registerPlugin } = await import('@capacitor/core')
    HealthConnectNative = registerPlugin('HealthConnect')
    return HealthConnectNative
  } catch (err) {
    console.warn('HealthConnect plugin unavailable:', err)
    return null
  }
}

/**
 * Checks if Health Connect is available on the device.
 */
export async function isHealthConnectAvailable() {
  const plugin = await getPlugin()
  if (!plugin) return false
  try {
    const res = await plugin.isAvailable()
    return !!res?.available
  } catch {
    return false
  }
}

/**
 * Opens Health Connect permissions / settings screen.
 */
export async function openHealthConnectSettings() {
  const plugin = await getPlugin()
  if (!plugin) return
  try {
    await plugin.openHealthConnectSettings()
  } catch (err) {
    console.warn('Failed to open Health Connect settings:', err)
  }
}

/**
 * Syncs a completed workout with Health Connect.
 */
export async function syncWorkoutToHealthConnect(workout, unit = 'kg') {
  const plugin = await getPlugin()
  if (!plugin) return null

  try {
    const startTime = workout.start || (new Date(workout.d)).getTime()
    const endTime = workout.end || (startTime + 3600 * 1000)
    const isLb = unit === 'lb'
    const volKg = isLb ? (workout.vol || 0) * 0.45359237 : (workout.vol || 0)

    // Rough estimation of active calories: ~5-6 kcal per min of strength training
    const durationMin = Math.max(1, (endTime - startTime) / 60000)
    const calories = Math.round(durationMin * 5.5)

    return await plugin.syncWorkoutSession({
      title: workout.name || 'Strength Training',
      startTime,
      endTime,
      calories,
      volumeKg: Math.round(volKg),
    })
  } catch (err) {
    console.warn('Failed to sync workout with Health Connect:', err)
    return null
  }
}

/**
 * Syncs logged body weight with Health Connect.
 */
export async function syncBodyWeightToHealthConnect(weight, unit = 'kg', dateISO = null) {
  const plugin = await getPlugin()
  if (!plugin) return null

  try {
    const weightKg = unit === 'lb' ? weight * 0.45359237 : weight
    const time = dateISO ? (new Date(dateISO)).getTime() : Date.now()

    return await plugin.syncBodyWeight({
      weightKg: Math.round(weightKg * 10) / 10,
      time,
    })
  } catch (err) {
    console.warn('Failed to sync bodyweight with Health Connect:', err)
    return null
  }
}
