# Eventide — Event Management System

A React single page application for discovering live events, registering for them and managing
personal bookings. All event data is fetched live from the **Ticketmaster Discovery API v2**.

Built for Web Programming — Assignment 3.

---

## Tech Stack

| Concern | Choice |
| --- | --- |
| UI library | React 18 |
| State management | Redux Toolkit (`configureStore`, `createSlice`, `createAsyncThunk`, `createSelector`, listener middleware) |
| Routing | React Router v6 |
| Build tool | Vite 5 |
| Data source | Ticketmaster Discovery API v2 |
| Styling | Hand written CSS with design tokens, light and dark themes |

---

## Features

### Authentication
- Registration, login and logout, simulated entirely on the frontend.
- Registration collects name, email and password, with live field validation and a password
  strength meter.
- Duplicate email addresses are rejected.
- Session and accounts persist in local storage, so a page refresh keeps the user signed in.
- `/my-events` is behind a protected route that remembers the intended destination and returns
  the user there after login.

### Event Exploration
- Browse events with a responsive card grid and loading skeletons.
- Keyword search with a 450 ms debounce so typing does not hammer the API.
- Category strip built from the live `/classifications` endpoint.
- Filter panel for category, city, country, start date, end date and sort order.
- Quick date ranges: today, this weekend, next 7 days, next 30 days.
- Pagination with condensed page numbers.
- Every filter and the current page are mirrored in the URL query string, so any search can be
  bookmarked or shared.

### Event Details
- Full bleed banner, name, date, time, venue, address, city, country and category.
- Price range, sales window, promoter and status (on sale, postponed, cancelled).
- Lineup of associated attractions, seating map where the API provides one.
- Direct link to the venue in Google Maps and to the official Ticketmaster listing.

### Registration
- A signed in user can register for an event from either the listing or the details page.
- Duplicate registration is prevented inside the reducer itself.
- Toast feedback confirms every registration and cancellation.
- Cancelling always asks for confirmation first.
- Registrations are keyed by user id, so two accounts on the same browser never see each
  other's bookings.

### My Events
- Summary tiles for total registrations, upcoming count and the next event.
- Separate **Upcoming** and **Completed** tabs, split by comparing the event date against now.
- Cancellation available on upcoming registrations.

---

## Getting Started

### 1. Get a Ticketmaster API key

Register at [developer.ticketmaster.com](https://developer.ticketmaster.com/) and copy the
**Consumer Key** from your app. The free tier allows 5,000 requests per day at 2 requests
per second.

### 2. Install and run

```bash
npm install
cp .env.example .env
```

Open `.env` and set your key:

```
VITE_TICKETMASTER_API_KEY=your_consumer_key_here
```

Then start the dev server:

```bash
npm run dev
```

The app runs at http://localhost:5173.

If the key is missing the app still loads and shows a banner explaining what to do.

### 3. Production build

```bash
npm run build
npm run preview
```

---

## Available Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Produce a production build in `dist/` |
| `npm run preview` | Serve the production build locally |

---

## Project Structure

```
src/
├── api/
│   └── ticketmaster.js        Discovery API client, error handling, response normalisation
├── app/
│   ├── store.js               configureStore and reducer registration
│   └── listeners.js           Listener middleware that persists registrations
├── components/                Reusable presentational and container components
│   ├── CategoryStrip.jsx      Scrollable category chips
│   ├── ConfirmDialog.jsx      Accessible confirmation modal
│   ├── EventCard.jsx          Single event card
│   ├── EventGrid.jsx          Responsive grid plus loading skeletons
│   ├── FilterPanel.jsx        Category, city, country, date and sort controls
│   ├── Layout.jsx             Shell with navbar, footer, toasts and skip link
│   ├── Navbar.jsx             Navigation with auth aware user menu
│   ├── Pagination.jsx         Condensed pagination
│   ├── ProtectedRoute.jsx     Route guard for authenticated pages
│   ├── RegistrationButton.jsx Register, cancel and login prompt states
│   ├── SearchBar.jsx          Search input with clear control
│   ├── SetupNotice.jsx        Missing API key banner
│   └── ToastHost.jsx          Toast notifications
├── features/
│   ├── auth/authSlice.js
│   ├── events/eventsSlice.js
│   ├── registrations/registrationsSlice.js
│   └── ui/uiSlice.js
├── hooks/
│   ├── useDebounce.js
│   └── useDocumentTitle.js
├── pages/
│   ├── Events.jsx
│   ├── EventDetails.jsx
│   ├── Login.jsx
│   ├── MyEvents.jsx
│   ├── NotFound.jsx
│   └── Register.jsx
├── styles/index.css           Design tokens, base styles and utilities
└── utils/
    ├── format.js              Date, time, price and location formatting
    ├── storage.js             Guarded local storage helpers
    └── validate.js            Form validation rules
```

---

## Redux Store Shape

```js
{
  auth:          { user, status, error },
  events:        { items, pageInfo, status, error, filters, page,
                   categories, categoriesStatus,
                   detailsById, detailsStatus, detailsError },
  registrations: { byUser: { [userId]: [{ eventId, registeredAt, event }] } },
  ui:            { toasts: [{ id, message, tone }] }
}
```

**Async thunks:** `registerUser`, `loginUser`, `loadEvents`, `loadEventDetails`, `loadCategories`.

**Why registrations store a full event snapshot:** My Events can render instantly without
re-fetching every booked event one by one, which also keeps the app well inside the API quota.

**Why a listener middleware:** persistence is a side effect, so it lives outside the reducers
and keeps them pure.

---

## Routes

| Path | View | Access |
| --- | --- | --- |
| `/` | Redirects to `/events` | Public |
| `/events` | Event listing, search and filters | Public |
| `/events/:eventId` | Event details | Public |
| `/login` | Login | Public |
| `/register` | Registration | Public |
| `/my-events` | Registered events | Protected |
| `*` | Not found | Public |

---

## API Endpoints Used

| Endpoint | Purpose |
| --- | --- |
| `GET /discovery/v2/events.json` | Search and list events |
| `GET /discovery/v2/events/{id}.json` | Single event details |
| `GET /discovery/v2/classifications.json` | Category segments |

Query parameters used: `apikey`, `keyword`, `segmentName`, `city`, `countryCode`,
`startDateTime`, `endDateTime`, `sort`, `size`, `page`.

The client aborts in flight requests when filters change, surfaces rate limit (429) and network
failures as readable messages, and caps pagination at the 50 page depth the API allows.

---

## Notes and Limitations

- Authentication is a frontend simulation. Accounts live in local storage and passwords are only
  obfuscated, never securely hashed. This is by design for the assignment and is not suitable
  for production.
- Registrations are stored per browser. Clearing site data removes them.
- The Ticketmaster free tier allows 5,000 requests per day at 2 requests per second.
- `.env` is listed in `.gitignore` and the API key is never committed.

---

## Development History

The repository was built incrementally. Feature work happened on branches which were merged
into `main` through pull requests:

| PR | Branch | Scope |
| --- | --- | --- |
| #1 | `feature/authentication` | Auth slice, login, registration, protected routes |
| #2 | `feature/event-discovery` | API client, events slice, listing, search, filters, details |
| #3 | `feature/event-registration` | Registrations slice, register and cancel, My Events |
