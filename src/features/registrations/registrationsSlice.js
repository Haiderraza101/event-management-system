import { createSelector, createSlice } from '@reduxjs/toolkit'
import { readJSON } from '../../utils/storage'
import { isPastEvent } from '../../utils/format'

export const REGISTRATIONS_KEY = 'registrations'

function loadRegistrations() {
  const stored = readJSON(REGISTRATIONS_KEY, {})
  return stored && typeof stored === 'object' && !Array.isArray(stored) ? stored : {}
}

const initialState = {
  byUser: loadRegistrations()
}

const registrationsSlice = createSlice({
  name: 'registrations',
  initialState,
  reducers: {
    registrationAdded: {
      reducer(state, action) {
        const { userId, registration } = action.payload
        const existing = state.byUser[userId] ?? []
        if (existing.some((item) => item.eventId === registration.eventId)) return
        state.byUser[userId] = [...existing, registration]
      },
      prepare(userId, event) {
        return {
          payload: {
            userId,
            registration: {
              eventId: event.id,
              registeredAt: new Date().toISOString(),
              event
            }
          }
        }
      }
    },
    registrationRemoved(state, action) {
      const { userId, eventId } = action.payload
      const existing = state.byUser[userId] ?? []
      state.byUser[userId] = existing.filter((item) => item.eventId !== eventId)
    },
    registrationsClearedForUser(state, action) {
      delete state.byUser[action.payload]
    }
  }
})

export const { registrationAdded, registrationRemoved, registrationsClearedForUser } =
  registrationsSlice.actions

const selectRegistrationMap = (state) => state.registrations.byUser
const selectUserId = (state) => state.auth.user?.id ?? null

export const selectMyRegistrations = createSelector(
  [selectRegistrationMap, selectUserId],
  (byUser, userId) => {
    if (!userId) return []
    return [...(byUser[userId] ?? [])].sort((a, b) => {
      const left = a.event.localDate || ''
      const right = b.event.localDate || ''
      return left.localeCompare(right)
    })
  }
)

export const selectRegisteredEventIds = createSelector([selectMyRegistrations], (registrations) =>
  registrations.map((item) => item.eventId)
)

export const selectIsRegistered = (eventId) =>
  createSelector([selectRegisteredEventIds], (ids) => ids.includes(eventId))

export const selectRegistrationSplit = createSelector([selectMyRegistrations], (registrations) => {
  const upcoming = []
  const completed = []
  registrations.forEach((registration) => {
    if (isPastEvent(registration.event)) completed.push(registration)
    else upcoming.push(registration)
  })
  return { upcoming, completed: completed.reverse() }
})

export default registrationsSlice.reducer
