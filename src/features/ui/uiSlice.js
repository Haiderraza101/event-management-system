import { createSlice, nanoid } from '@reduxjs/toolkit'

const initialState = {
  toasts: []
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toastPushed: {
      reducer(state, action) {
        state.toasts.push(action.payload)
      },
      prepare(message, tone = 'info') {
        return { payload: { id: nanoid(), message, tone } }
      }
    },
    toastDismissed(state, action) {
      state.toasts = state.toasts.filter((toast) => toast.id !== action.payload)
    },
    toastsCleared(state) {
      state.toasts = []
    }
  }
})

export const { toastPushed, toastDismissed, toastsCleared } = uiSlice.actions

export const selectToasts = (state) => state.ui.toasts

export default uiSlice.reducer
