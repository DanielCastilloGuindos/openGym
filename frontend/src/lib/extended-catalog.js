let extendedPromise = null
let extendedCatalog = null
let extendedDetails = null

/**
 * Lazy loads the extended exercise catalog (4,741 exercises).
 * Cached in memory once loaded so subsequent searches are instant.
 */
export async function getExtendedCatalog() {
  if (extendedCatalog) return extendedCatalog
  if (!extendedPromise) {
    extendedPromise = fetch('/exercises_extended_catalog.json')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(data => {
        extendedCatalog = data
        return data
      })
      .catch(err => {
        console.error('Failed to load extended catalog:', err)
        extendedPromise = null
        return []
      })
  }
  return extendedPromise
}

/**
 * Loads instructions and tips for an extended exercise on demand.
 */
export async function getExtendedDetails(id) {
  if (extendedDetails && extendedDetails[id]) return extendedDetails[id]
  try {
    if (!extendedDetails) {
      const res = await fetch('/exercises_extended_details.json')
      if (res.ok) {
        extendedDetails = await res.json()
      }
    }
    return extendedDetails ? extendedDetails[id] : null
  } catch (err) {
    console.error('Failed to load extended exercise details:', err)
    return null
  }
}
