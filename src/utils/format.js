const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function parseLocalDate(localDate) {
  if (!localDate) return null
  const [year, month, day] = localDate.split('-').map(Number)
  if (!year || !month || !day) return null
  return new Date(year, month - 1, day)
}

export function formatDateShort(localDate) {
  const date = parseLocalDate(localDate)
  if (!date) return 'Date TBA'
  return `${MONTHS[date.getMonth()].slice(0, 3)} ${date.getDate()}, ${date.getFullYear()}`
}

export function formatDateLong(localDate) {
  const date = parseLocalDate(localDate)
  if (!date) return 'Date to be announced'
  return `${WEEKDAYS[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`
}

export function formatTime(localTime) {
  if (!localTime) return ''
  const [rawHours, minutes] = localTime.split(':')
  const hours = Number(rawHours)
  if (Number.isNaN(hours)) return ''
  const suffix = hours >= 12 ? 'PM' : 'AM'
  const display = hours % 12 === 0 ? 12 : hours % 12
  return `${display}:${minutes} ${suffix}`
}

export function formatDateBadge(localDate) {
  const date = parseLocalDate(localDate)
  if (!date) return { month: 'TBA', day: '--' }
  return { month: MONTHS[date.getMonth()].slice(0, 3).toUpperCase(), day: String(date.getDate()) }
}

export function formatLocation(venue) {
  if (!venue) return 'Location to be announced'
  return [venue.city, venue.state, venue.country].filter(Boolean).join(', ') || venue.name
}

export function formatPrice(priceRange) {
  if (!priceRange) return ''
  const { min, max, currency } = priceRange
  const symbol = currency === 'USD' ? '$' : `${currency} `
  if (min === max) return `${symbol}${min.toFixed(0)}`
  return `${symbol}${min.toFixed(0)} – ${symbol}${max.toFixed(0)}`
}

export function isPastEvent(event) {
  if (event.dateTime) return new Date(event.dateTime).getTime() < Date.now()
  const date = parseLocalDate(event.localDate)
  if (!date) return false
  date.setHours(23, 59, 59, 999)
  return date.getTime() < Date.now()
}

export function daysUntil(localDate) {
  const date = parseLocalDate(localDate)
  if (!date) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((date.getTime() - today.getTime()) / 86400000)
}

export function countdownLabel(localDate) {
  const days = daysUntil(localDate)
  if (days === null) return ''
  if (days < 0) return 'Finished'
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  if (days < 7) return `In ${days} days`
  if (days < 30) return `In ${Math.round(days / 7)} weeks`
  return `In ${Math.round(days / 30)} months`
}

export function toApiDateTime(date) {
  if (!date) return ''
  const value = typeof date === 'string' ? new Date(`${date}T00:00:00`) : date
  if (Number.isNaN(value.getTime())) return ''
  return `${value.toISOString().split('.')[0]}Z`
}

export function statusLabel(status) {
  const map = {
    onsale: { text: 'On sale', tone: 'success' },
    offsale: { text: 'Off sale', tone: 'default' },
    cancelled: { text: 'Cancelled', tone: 'danger' },
    postponed: { text: 'Postponed', tone: 'warn' },
    rescheduled: { text: 'Rescheduled', tone: 'warn' }
  }
  return map[status] ?? { text: status, tone: 'default' }
}
