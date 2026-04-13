# Sprint 2 Report

## Frontend
We focused on building out the core user-facing features of the frontend: authentication, user profiles, game catalogue, dynamic game pages, and full integration with the live backend API. We also improved the overall UI/UX through responsive layout updates and unit testing.

### Completed Work

#### Authentication & Accounts
- Implemented **signup** and **login** pages with robust form validation and JWT token management syncing with the backend.
- Added **session persistence** across routes so components react to authentication state.
- Introduced a dynamic **Get Started** call-to-action button that adapts based on user login status.
- Created an interactive **account** profile page displaying user information and basic gaming statistics.

#### Game Pages & Catalogue
- Built the **games catalogue** page acting as a mirror to "films" pages, featuring complete scrolling game lists, updated responsive layouts, and individual ID-specific linking.
- Implemented dynamic **game details routing** (`/game/:id`) showcasing comprehensive title data such as ratings, time-to-beat badges, and genre logic.
- Managed **state handlers** for allowing users to dynamically review and manage custom game states specific to their account.

#### List and Backend Integration
- Fetched and rendered **live game lists** from the API database directly into the global games page.
- Populated **user statistics**, active **backlog states** (played, wanting to play, currently playing), and **wishlist** data dynamically directly onto the profiles and `/backlog` route via API endpoints.

#### General Maintenance & Styling
- Refactored the initial **home route** into cleaner, dedicated component directories.
- Updated **UI color palettes** and text opacity to ensure strong visual consistency spanning the Navigation bar, Recent Activity, and Favorite Games sections.
- Discarded and cleaned up invalid "Log Game" button process paths.

### Frontend Route Documentation

| Route | Auth Required | Description |
|---|---|---|
| `/` | None | Landing home dashboard |
| `/login` | None | User authentication login |
| `/signup` | None | User account creation |
| `/games` | None | Global game catalog with filtering and browsing |
| `/game/:id` | None | Dynamic specific game detail display card |
| `/account` | Token | User profile and statistics |
| `/backlog` | Token | User-specific game playlist states and lists |

*Note: Auth levels indicate whether a valid JWT session token is required to actively fetch/display specific page data.*

### Unit Tests

#### Vitest + Testing Library Suite
Built a full frontend unit test suite with Vitest + Testing Library covering:
- **Utilities** (`utils.ts`): class merge behavior and edge cases
- **Auth/Session logic** (`auth.ts`): signup/login flows, session management, token/user retrieval helpers
- **API wrappers** (`api.ts`): request building, auth headers, error handling, and endpoint wrappers
- **Protected routes** (`use-require-auth.ts`): protected-route behavior and redirect path
- **Shared UI components** (`game-card.tsx`, `navbar.tsx`): rendering game data, guest vs logged-in states, route-aware links
- **App shell and routing** (`root.tsx`, `routes.ts`): layout, navigation, app shell behavior, error boundaries
- **Route files** (`app/routes`): route helpers, data mapping, and page-level wiring

**Current result: 211 tests passing across 16 test files**

Run unit tests with:
```
cd apps/frontend && npx vitest run
```

Run with coverage report:
```
cd apps/frontend && npx vitest run --coverage
open apps/frontend/coverage/index.html
```

#### Cypress E2E Tests
Comprehensive Cypress test coverage for authentication flows verifying critical login functionality:

- ✅ should render the login form with all fields (passed)
- ✅ should show validation error for empty email (passed)
- ✅ should show validation error for empty password (passed)
- ✅ should successfully login with valid credentials (passed)
- ✅ should display error message on login failure (passed)
- ✅ should have a signup link (passed)

Run E2E tests with:
```
cd apps/frontend && npm run e2e
```

### How to Run
From `apps/frontend/`:

Run `npm install && npm run dev`. The client starts natively on http://localhost:5173.
