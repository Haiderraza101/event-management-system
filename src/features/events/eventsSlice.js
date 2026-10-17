import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit'
import { searchEvents, fetchEventById, fetchSegments } from '../../api/ticketmaster'
import { toApiDateTime } from '../../utils/format'

export const PAGE_SIZE = 12

export const DEFAULT_FILTERS = {
  keyword: '',
  segment: '',
  city: '',
  countryCode: '',
  startDate: '',
  endDate: '',
  sort: 'date,asc'
}

export const SORT_OPTIONS = [
  { value: 'date,asc', label: 'Soonest first' },
  { value: 'date,desc', label: 'Latest first' },
  { value: 'relevance,desc', label: 'Most relevant' },
  { value: 'name,asc', label: 'Name A to Z' }
]

function buildParams(filters, page) {
  return {
    size: PAGE_SIZE,
    page,
    sort: filters.sort,
    keyword: filters.keyword.trim(),
    segmentName: filters.segment,
    city: filters.city.trim(),
    countryCode: filters.countryCode,
    startDateTime: filters.startDate ? toApiDateTime(filters.startDate) : '',
    endDateTime: filters.endDate ? toApiDateTime(filters.endDate, true) : ''
  }
}

export const loadEvents = createAsyncThunk(
  'events/loadEvents',
  async (_, { getState, signal, rejectWithValue }) => {
    const { filters, page } = getState().events
    try {
      return await searchEvents(buildParams(filters, page), signal)
    } catch (error) {
      if (error.name === 'AbortError') throw error
      return rejectWithValue(error.message)
    }
  }
)

export const loadEventDetails = createAsyncThunk(
  'events/loadEventDetails',
  async (eventId, { signal, rejectWithValue }) => {
    try {
      return await fetchEventById(eventId, signal)
    } catch (error) {
      if (error.name === 'AbortError') throw error
      return rejectWithValue(error.message)
    }
  }
)

export const loadCategories = createAsyncThunk(
  'events/loadCategories',
  async (_, { signal, rejectWithValue }) => {
    try {
      return await fetchSegments(signal)
    } catch (error) {
      if (error.name === 'AbortError') throw error
      return rejectWithValue(error.message)
    }
  }
)

const initialState = {
  items: [],
  pageInfo: { number: 0, totalPages: 0, totalElements: 0, size: PAGE_SIZE },
  status: 'idle',
  error: null,
  filters: DEFAULT_FILTERS,
  page: 0,
  categories: [],
  categoriesStatus: 'idle',
  detailsById: {},
  detailsStatus: 'idle',
  detailsError: null
}

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    filterChanged(state, action) {
      const { key, value } = action.payload
      state.filters[key] = value
      state.page = 0
    },
    filtersReplaced(state, action) {
      state.filters = { ...DEFAULT_FILTERS, ...action.payload }
      state.page = 0
    },
    filtersCleared(state) {
      state.filters = DEFAULT_FILTERS
      state.page = 0
    },
    pageChanged(state, action) {
      state.page = action.payload
    }
  },
  extraReducers(builder) {
    builder
      .addCase(loadEvents.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(loadEvents.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload.events
        state.pageInfo = action.payload.page
      })
      .addCase(loadEvents.rejected, (state, action) => {
        if (action.meta.aborted) return
        state.status = 'failed'
        state.error = action.payload || 'Events could not be loaded.'
      })
      .addCase(loadEventDetails.pending, (state) => {
        state.detailsStatus = 'loading'
        state.detailsError = null
      })
      .addCase(loadEventDetails.fulfilled, (state, action) => {
        state.detailsStatus = 'succeeded'
        state.detailsById[action.payload.id] = action.payload
      })
      .addCase(loadEventDetails.rejected, (state, action) => {
        if (action.meta.aborted) return
        state.detailsStatus = 'failed'
        state.detailsError = action.payload || 'This event could not be loaded.'
      })
      .addCase(loadCategories.pending, (state) => {
        state.categoriesStatus = 'loading'
      })
      .addCase(loadCategories.fulfilled, (state, action) => {
        state.categoriesStatus = 'succeeded'
        state.categories = action.payload
      })
      .addCase(loadCategories.rejected, (state) => {
        state.categoriesStatus = 'failed'
      })
  }
})

export const { filterChanged, filtersReplaced, filtersCleared, pageChanged } = eventsSlice.actions

export const selectEvents = (state) => state.events.items
export const selectEventsStatus = (state) => state.events.status
export const selectEventsError = (state) => state.events.error
export const selectFilters = (state) => state.events.filters
export const selectPage = (state) => state.events.page
export const selectPageInfo = (state) => state.events.pageInfo
export const selectCategories = (state) => state.events.categories
export const selectDetailsStatus = (state) => state.events.detailsStatus
export const selectDetailsError = (state) => state.events.detailsError

export const selectEventById = (eventId) => (state) => state.events.detailsById[eventId]

export const selectActiveFilterCount = createSelector([selectFilters], (filters) =>
  Object.entries(filters).filter(
    ([key, value]) => key !== 'sort' && String(value).trim() !== ''
  ).length
)

export default eventsSlice.reducer
