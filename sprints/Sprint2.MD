# Sprint 2 

# Frontend

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


---

# Backend
We focused on building out the core user-facing features of the backend: playlists, favorites, reviews, authentication, and authorization. We also added unit testing suite covering repository and utility layers.

---

## Completed Work

### Authentication & Authorization
- Implemented signup and login endpoints with bcrypt password hashing and JWT token generation (24-hour expiry).
- Public routes (all GET endpoints) require no authentication.
- Write operations on games and reviews require a valid JWT token.
- Write operations on playlists, favorites, and user accounts verify that the logged-in user matches the resource owner (403 Forbidden otherwise).

### Playlist API
- Full CRUD for user playlists with status tracking (`want_to_play`, `playing`, `completed`, `abandoned`).
- Delete and update operations supported both by entry ID and by user+game ID combination.
- Endpoint to retrieve full game objects for a user's playlist.

### Favorites API
- Add and remove favorite games per user.
- Delete by entry ID or by user+game ID combination.
- Endpoint to retrieve full game objects for a user's favorites.

### Reviews API
- Create, read, update, and delete reviews with score (1–10) and optional text.
- Flexible query filtering: by user, by game, by both, or unfiltered.
- Update and delete by user+game combination.

### Games & Users API (Enhanced from Sprint 1)
- Full CRUD for games and users (added update and delete operations).
- Unique constraints enforced on username and email.
- `FindByEmail` added to support login flow.
 

---

## Backend API Documentation

Base URL: `http://localhost:8080/api/v1`

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/signup` | None | Create account. Body: `{username, email, password}` |
| POST | `/auth/login` | None | Login. Body: `{email, password}`. Returns JWT token |

### Users
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users/` | None | List all users |
| GET | `/users/:id` | None | Get user by ID |
| POST | `/users/` | Token | Create a user |
| PUT | `/users/:id` | Owner | Update user profile |
| DELETE | `/users/:id` | Owner | Delete user account |

### Games
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/games/` | None | List all games |
| GET | `/games/:id` | None | Get game by ID |
| POST | `/games/` | Token | Add a new game. Body: `{title, developer, release_year, genre, cover_image_url}` |
| PUT | `/games/:id` | Token | Update a game |
| DELETE | `/games/:id` | Token | Delete a game |

### Playlist
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users/:id/playlist/` | None | List user's playlist entries |
| GET | `/users/:id/playlist/games` | None | List full game objects in user's playlist |
| POST | `/users/:id/playlist/` | Owner | Add game to playlist. Body: `{game_id, status}` |
| PUT | `/users/:id/playlist/:entryId` | Owner | Update status by entry ID. Body: `{status}` |
| PUT | `/users/:id/playlist/game/:gameId` | Owner | Update status by game ID. Body: `{status}` |
| DELETE | `/users/:id/playlist/:entryId` | Owner | Remove by entry ID |
| DELETE | `/users/:id/playlist/game/:gameId` | Owner | Remove by game ID |

Status values: `want_to_play`, `playing`, `completed`, `abandoned`

### Favorites
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users/:id/favorites/` | None | List user's favorite entries |
| GET | `/users/:id/favorites/games` | None | List full game objects in user's favorites |
| POST | `/users/:id/favorites/` | Owner | Add a favorite. Body: `{game_id}` |
| DELETE | `/users/:id/favorites/:entryId` | Owner | Remove by entry ID |
| DELETE | `/users/:id/favorites/game/:gameId` | Owner | Remove by game ID |

### Reviews
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/reviews/` | None | List reviews. Optional query params: `?user_id=1&game_id=2` |
| GET | `/reviews/:id` | None | Get review by ID |
| POST | `/reviews/` | Token | Create review. Body: `{user_id, game_id, score, text}` |
| PUT | `/reviews/user/:user_id/game/:game_id` | Token | Update review. Body: `{score, text}` |
| DELETE | `/reviews/user/:user_id/game/:game_id` | Token | Delete review |

### Auth Levels
- **None** — Public, no token needed
- **Token** — Any valid JWT token (logged-in user)
- **Owner** — Valid JWT token where the token's user ID matches the `:id` in the URL

---

## Unit Tests

**88 total tests** across repositories and utilities. All tests use in-memory SQLite databases for isolation — each test gets a fresh database, no test affects another.

Run with: `go test ./... -v`

### Utils (13 tests)
- **Password hashing (5 tests):** Verifies bcrypt hashing produces non-plaintext output, correct passwords match, wrong and empty passwords are rejected, and same password produces different hashes due to salt.
- **JWT tokens (8 tests):** Verifies token generation, valid token returns correct user ID, different users get distinct tokens, invalid/empty/tampered/expired tokens are rejected, and wrong signing methods are blocked.

### Repositories (75 tests)
- **Games (9 tests):** Full CRUD coverage — create, get all, get all empty, get by ID, get by ID not found, update, update not found, delete, delete leaves others intact.
- **Users (13 tests):** Full CRUD + unique constraints — create, get all, get by ID, get by ID not found, find by email, find by email not found, duplicate email rejected, duplicate username rejected, update, update not found, delete, delete leaves others, find by email returns password hash.
- **Playlist (18 tests):** Create, get by user, get by user empty, user isolation, find by user+game, find not found, update by ID (verifies other fields preserved), update by user+game, update not found, delete by ID, delete by user+game, delete not found, hard delete allows re-add, delete doesn't affect other users, get games by user, get games empty, excludes deleted entries.
- **Favorites (16 tests):** Create, get by user, get by user empty, user isolation, find by user+game, find not found, delete by ID, delete by user+game, delete not found, hard delete allows re-add, delete doesn't affect other users, get games by user, get games empty, excludes deleted entries, doesn't return other users' games.
- **Reviews (19 tests):** Create with text, create without text, get by ID, get by ID not found, get all, filter by user, filter by game, filter by both, get empty, filter no match, update score, update text only, update not found, delete, delete doesn't affect others, multiple reviews same game.


---

## How to Run

From `apps/backend`: delete `respawn67.db` for a fresh start, then run `go run main.go`. Server starts at `http://localhost:8080`. To run all tests: `go test ./... -v`.