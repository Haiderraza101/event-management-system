import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit'
import { writeJSON } from '../utils/storage'
import {
  REGISTRATIONS_KEY,
  registrationAdded,
  registrationRemoved,
  registrationsClearedForUser
} from '../features/registrations/registrationsSlice'

export const listenerMiddleware = createListenerMiddleware()

listenerMiddleware.startListening({
  matcher: isAnyOf(registrationAdded, registrationRemoved, registrationsClearedForUser),
  effect: (_action, listenerApi) => {
    writeJSON(REGISTRATIONS_KEY, listenerApi.getState().registrations.byUser)
  }
})
