const PREFIX = 'eventide:'

export function readJSON(key, fallback) {
  try {
    const raw = window.localStorage.getItem(PREFIX + key)
    if (raw === null) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function writeJSON(key, value) {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    return
  }
}

export function removeKey(key) {
  try {
    window.localStorage.removeItem(PREFIX + key)
  } catch {
    return
  }
}
