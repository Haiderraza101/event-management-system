const BASE_URL = 'https://app.ticketmaster.com/discovery/v2'
const API_KEY = import.meta.env.VITE_TICKETMASTER_API_KEY

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export function isApiConfigured() {
  return Boolean(API_KEY)
}

function buildUrl(path, params = {}) {
  const url = new URL(`${BASE_URL}${path}`)
  url.searchParams.set('apikey', API_KEY ?? '')
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    url.searchParams.set(key, value)
  })
  return url.toString()
}

async function readError(response) {
  try {
    const body = await response.json()
    if (body?.fault?.faultstring) return body.fault.faultstring
    if (Array.isArray(body?.errors) && body.errors[0]?.detail) return body.errors[0].detail
  } catch {
    return response.statusText
  }
  return response.statusText
}

async function request(path, params, signal) {
  if (!API_KEY) {
    throw new ApiError(
      'Ticketmaster API key is missing. Add VITE_TICKETMASTER_API_KEY to your .env file and restart the dev server.',
      0
    )
  }

  let response
  try {
    response = await fetch(buildUrl(path, params), { signal })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new ApiError('Network request failed. Check your internet connection.', 0)
  }

  if (response.status === 429) {
    throw new ApiError('Rate limit reached. Please wait a moment and try again.', 429)
  }

  if (!response.ok) {
    throw new ApiError(await readError(response), response.status)
  }

  return response.json()
}

function pickImage(images = []) {
  if (images.length === 0) return ''
  const wide = images
    .filter((image) => image.ratio === '16_9' && image.width >= 640)
    .sort((a, b) => a.width - b.width)
  if (wide.length > 0) return wide[0].url
  return [...images].sort((a, b) => b.width - a.width)[0].url
}

function readVenue(event) {
  const venue = event._embedded?.venues?.[0]
  if (!venue) return null
  return {
    name: venue.name ?? 'Venue to be announced',
    city: venue.city?.name ?? '',
    state: venue.state?.name ?? venue.state?.stateCode ?? '',
    country: venue.country?.name ?? '',
    address: venue.address?.line1 ?? '',
    postalCode: venue.postalCode ?? '',
    timezone: venue.timezone ?? '',
    url: venue.url ?? ''
  }
}

function readClassification(event) {
  const classification = event.classifications?.find((item) => item.primary) ?? event.classifications?.[0]
  if (!classification) return { segment: 'Other', genre: '', subGenre: '' }
  return {
    segment: classification.segment?.name ?? 'Other',
    genre: classification.genre?.name === 'Undefined' ? '' : classification.genre?.name ?? '',
    subGenre: classification.subGenre?.name === 'Undefined' ? '' : classification.subGenre?.name ?? ''
  }
}

function readPrices(event) {
  const range = event.priceRanges?.[0]
  if (!range) return null
  return { min: range.min, max: range.max, currency: range.currency }
}

export function normaliseEvent(event) {
  const start = event.dates?.start ?? {}
  return {
    id: event.id,
    name: event.name,
    image: pickImage(event.images),
    url: event.url ?? '',
    info: event.info ?? '',
    pleaseNote: event.pleaseNote ?? '',
    localDate: start.localDate ?? '',
    localTime: start.localTime ?? '',
    dateTime: start.dateTime ?? '',
    timeTba: Boolean(start.timeTBA || start.noSpecificTime),
    dateTba: Boolean(start.dateTBA || start.dateTBD),
    status: event.dates?.status?.code ?? 'onsale',
    venue: readVenue(event),
    classification: readClassification(event),
    priceRange: readPrices(event),
    promoter: event.promoter?.name ?? '',
    attractions: (event._embedded?.attractions ?? []).map((attraction) => ({
      id: attraction.id,
      name: attraction.name,
      image: pickImage(attraction.images),
      url: attraction.url ?? ''
    })),
    seatmap: event.seatmap?.staticUrl ?? '',
    salesStart: event.sales?.public?.startDateTime ?? '',
    salesEnd: event.sales?.public?.endDateTime ?? ''
  }
}

export async function searchEvents(params, signal) {
  const data = await request('/events.json', params, signal)
  const events = data._embedded?.events ?? []
  const page = data.page ?? { number: 0, totalPages: 0, totalElements: 0, size: 0 }
  return {
    events: events.map(normaliseEvent),
    page: {
      number: page.number ?? 0,
      totalPages: Math.min(page.totalPages ?? 0, 50),
      totalElements: page.totalElements ?? 0,
      size: page.size ?? 0
    }
  }
}

export async function fetchEventById(eventId, signal) {
  const data = await request(`/events/${encodeURIComponent(eventId)}.json`, {}, signal)
  return normaliseEvent(data)
}

export async function fetchSegments(signal) {
  const data = await request('/classifications.json', { size: 50 }, signal)
  const classifications = data._embedded?.classifications ?? []
  return classifications
    .map((item) => item.segment)
    .filter((segment) => segment && segment.name && segment.name !== 'Undefined')
    .map((segment) => ({ id: segment.id, name: segment.name }))
    .filter((segment, index, list) => list.findIndex((item) => item.id === segment.id) === index)
}
