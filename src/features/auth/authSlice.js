import { createAsyncThunk, createSlice, nanoid } from '@reduxjs/toolkit'
import { readJSON, writeJSON, removeKey } from '../../utils/storage'

const ACCOUNTS_KEY = 'accounts'
const SESSION_KEY = 'session'

function obfuscate(password) {
  return window.btoa(unescape(encodeURIComponent(`ev:${password}`)))
}

function loadAccounts() {
  const accounts = readJSON(ACCOUNTS_KEY, [])
  return Array.isArray(accounts) ? accounts : []
}

function toPublicUser(account) {
  return { id: account.id, name: account.name, email: account.email, joinedAt: account.joinedAt }
}

function settle(value, delay = 420) {
  return new Promise((resolve) => window.setTimeout(() => resolve(value), delay))
}

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async ({ name, email, password }, { rejectWithValue }) => {
    const accounts = loadAccounts()
    const normalisedEmail = email.trim().toLowerCase()

    if (accounts.some((account) => account.email === normalisedEmail)) {
      return rejectWithValue('An account with this email already exists.')
    }

    const account = {
      id: nanoid(),
      name: name.trim(),
      email: normalisedEmail,
      secret: obfuscate(password),
      joinedAt: new Date().toISOString()
    }

    writeJSON(ACCOUNTS_KEY, [...accounts, account])
    const user = toPublicUser(account)
    writeJSON(SESSION_KEY, user.id)
    return settle(user)
  }
)

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    const accounts = loadAccounts()
    const normalisedEmail = email.trim().toLowerCase()
    const account = accounts.find((item) => item.email === normalisedEmail)

    if (!account || account.secret !== obfuscate(password)) {
      return rejectWithValue('Incorrect email or password.')
    }

    const user = toPublicUser(account)
    writeJSON(SESSION_KEY, user.id)
    return settle(user)
  }
)

function restoreSession() {
  const sessionId = readJSON(SESSION_KEY, null)
  if (!sessionId) return null
  const account = loadAccounts().find((item) => item.id === sessionId)
  return account ? toPublicUser(account) : null
}

const initialState = {
  user: restoreSession(),
  status: 'idle',
  error: null
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loggedOut(state) {
      state.user = null
      state.status = 'idle'
      state.error = null
      removeKey(SESSION_KEY)
    },
    authErrorCleared(state) {
      state.error = null
    }
  },
  extraReducers(builder) {
    builder
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.user = action.payload
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'Registration failed. Please try again.'
      })
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.user = action.payload
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'Login failed. Please try again.'
      })
  }
})

export const { loggedOut, authErrorCleared } = authSlice.actions

export const selectCurrentUser = (state) => state.auth.user
export const selectIsAuthenticated = (state) => Boolean(state.auth.user)
export const selectAuthStatus = (state) => state.auth.status
export const selectAuthError = (state) => state.auth.error

export default authSlice.reducer
