# Sprint 3 — Backend

We focused on building the **Game Lists** feature (user-created, named collections of games — the Letterboxd "Lists" equivalent), a **Game Duration** system (how-long-to-beat data), and a series of data model improvements including foreign key constraints, expanded fields, and repository refactoring.

---

## Frontend

We focused on expanding the platform with custom game lists, public user profiles, gameplay hours tracking, community reviews, and time-to-beat integration. We also added new reusable UI components, extended the API layer significantly, and updated the unit test suite to cover all new routes.

### Completed Work

#### Custom Game Lists
- Built a full **game lists** feature allowing users to create, browse, edit, and delete curated game lists with real-time cover image previews and game counts.
- Implemented the **list detail page** (`/lists/:id`) with owner-level controls for adding and removing games via a searchable dialog, editing list metadata, and deleting lists.
- Lists display the **owner username**, game count, and a like button (placeholder — backend not yet implemented).
- Added global list browsing with **search, sort (newest / most liked / most games), and tab filtering** (All Lists vs My Lists).

#### Public User Profiles
- Created a **public profile page** (`/users/:id`) displaying any user's favorites, backlog preview, reviews, and custom lists — all fetched from the live API.
- Viewers visiting their own profile are **automatically redirected** to `/account`.
- Profile page renders tabbed sections (Profile, Reviews, Lists) with full backlog status indicators and hours tracking.

#### Backlog Hours Tracking
- Added **hours played tracking** across both the `/backlog` and `/account` routes with a slider-based log-hours dialog.
- Implemented **automatic status transitions**: logging hours on a `want_to_play` game moves it to `playing`; reaching the estimated total marks it `completed`.
- Progress bars now reflect **actual hours played** from the backend rather than static status-based estimates.
- Removed the deprecated `abandoned` status — the system now uses three states: `want_to_play`, `playing`, `completed`.
- Updated the `updatePlaylistStatusByGame` API call to `updatePlaylistEntryByGame`, accepting both `status` and `hours_played` in a single payload.

#### Game Pages & Catalogue Enhancements
- Integrated **time-to-beat data** from the backend's nested `duration` object (Main Story, Main + Extras, Completionist) into the game detail page with dedicated badge cards.
- Replaced hardcoded game descriptions with **real `description` field** data from the API.
- Added a **Community Reviews** section to individual game pages, showing all reviews from other users with enriched usernames and scores.
- Replaced the hardcoded review sidebar on the **games catalogue** page with **live community reviews** fetched from the API, enriched with usernames and game titles.
- Game catalog cards now display **real time-to-beat hours** from the duration API instead of derived mock values.

#### New UI Components
- Added **Dialog** component (Radix UI primitive) for modal interactions across list create/edit, game add, and hours logging workflows.
- Added **Slider** component (Radix UI primitive) for the hours-played input in the backlog.

#### API Layer Expansion
- Added API wrappers for **Game Lists**: `getAllLists`, `getListById`, `getListItems`, `getListGames`, `getUserLists`, `createList`, `updateList`, `deleteList`, `addGameToList`, `removeGameFromList`.
- Added API wrappers for **Users**: `getUserById`, `getAllUsers`, `getPublicUserLists`.
- Added API wrappers for **Reviews**: `getPublicReviews`, `getGameReviews`.
- Added API wrapper for **Game Duration**: `setGameDuration`.
- Extended `ApiGame` type with `description`, `duration` (nested), and flat `time_to_beat_*` fields.
- Extended `PlaylistEntry` type with `hours_played`, `created_at`, and `updated_at`.

### Frontend Route Documentation

| Route | Auth Required | Description |
|---|---|---|
| `/` | None | Landing home dashboard |
| `/login` | None | User authentication login |
| `/signup` | None | User account creation |
| `/games` | None | Global game catalog with filtering, browsing, and community reviews |
| `/games/:id` | None | Dynamic game detail with time-to-beat, community reviews, and user interactions |
| `/account` | Token | User profile, statistics, backlog preview, lists, and reviews |
| `/backlog` | Token | User-specific backlog with hours tracking, status management, and progress bars |
| `/users/:id` | None | Public user profile with favorites, backlog, reviews, and lists |
| `/lists` | None | Global game list browser with search, sort, and create |
| `/lists/:id` | None | List detail with game grid, add/remove (owner), and like button |

*Note: Auth levels indicate whether a valid JWT session token is required to actively fetch/display specific page data. Owner-level write operations (create/edit/delete lists, log hours) require the token's user ID to match the resource owner.*

### Unit Tests

#### Vitest + Testing Library Suite
Extended the frontend unit test suite with new test files covering Sprint 3 features:
- **Public user profile** (`user.$id.test.tsx`): loading state rendering, profile data display, tab structure verification
- **List detail page** (`list.$id.test.tsx`): list metadata rendering, game list display, owner username resolution
- **Lists page** (`lists.test.tsx`): global list rendering, username enrichment across list cards
- **Backlog status transitions** (`backlog.test.tsx`): new tests for progress updates on status change (completed → 100%, want_to_play → 0%)
- **Account status helpers** (`account.test.tsx`): updated tests removing `abandoned` status, verifying `want_to_play` normalization and "Up Next" formatting
- **API wrappers** (`api.test.ts`): updated `updatePlaylistEntryByGame` test for new payload shape

**Current result: 213 tests passing across 19 test files** (1 pre-existing test needs update for time-to-beat refactor)

Run unit tests with:
```
cd apps/frontend && npx vitest run
```

Run with coverage report:
```
cd apps/frontend && npx vitest run --coverage
open apps/frontend/coverage/index.html
```

### How to Run
From `apps/frontend/`:

Run `npm install && npm run dev`. The client starts natively on http://localhost:5173.

## Backend

### Game Lists API
- Implemented a full **Lists** feature allowing users to create, update, and delete named game collections (e.g., "Games I want to play this summer", "Best RPGs of all time").
- Two new models: `GameList` (owned by a user, with name and optional description) and `GameListItem` (join table linking a list to a game).
- Full CRUD for both lists and list items, with duplicate prevention (same game can't appear twice in a list, but can appear across multiple lists).
- Public browsing endpoints for viewing any user's lists and their contents.
- Owner-only write endpoints with JWT ownership verification — users can only modify their own lists.
- Cascading delete: removing a list automatically deletes all its items first.

### Game Duration (How Long to Beat)
- New `GameDuration` model as a separate table with a one-to-one relationship to `Game`, storing `main_story_hours`, `main_plus_sides_hours`, and `completionist_hours`.
- **Upsert endpoint** (`PUT /games/:id/duration`) — creates or updates duration data in a single call; the frontend doesn't need to know if a duration entry already exists.
- Duration data is automatically **preloaded** on all game queries (`GetAll`, `GetGameByID`, and all join queries from playlists, favorites, and lists) via GORM's `Preload("Duration")`.

### Data Model Improvements
- Added **foreign key constraints** across all models (`Playlist`, `Favorite`, `Review`, `GameList`, `GameListItem`, `GameDuration`) linking back to `User` and `Game` via GORM's `foreignKey` tag.
- Expanded the **Game** model with new fields: `description`, `publisher`, `release_date` (stored as a string in `YYYY-MM-DD` format for simplicity with SQLite).
- Expanded the **User** model with a `bio` field.
- Expanded the **Playlist** model with an `hours_played` field.
- Added `created_at` and `updated_at` timestamps to all model JSON responses.

### Repository Refactoring
- Replaced raw SQL join queries in `FavoritesRepository`, `PlaylistRepository`, and `GameListRepository` with GORM query builder (`.Joins().Where().Find()`), enabling `Preload("Duration")` to work on all game-returning queries.
- Removed unnecessary `deleted_at IS NULL` checks in queries since all repositories use hard deletes (`Unscoped().Delete()`).

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
| GET | `/games/` | None | List all games (includes duration) |
| GET | `/games/:id` | None | Get game by ID (includes duration) |
| POST | `/games/` | Token | Add a new game. Body: `{title, description, developer, publisher, release_date, genre, cover_image_url}` |
| PUT | `/games/:id` | Token | Update a game |
| DELETE | `/games/:id` | Token | Delete a game |

### Game Duration (New)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| PUT | `/games/:id/duration` | Token | Create or update duration. Body: `{main_story_hours, main_plus_sides_hours, completionist_hours}` |
| DELETE | `/games/:id/duration` | Token | Remove duration data for a game |

Duration is also returned automatically as a nested `duration` object on all game GET responses.

### Playlist
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users/:id/playlist/` | None | List user's playlist entries |
| GET | `/users/:id/playlist/games` | None | List full game objects in user's playlist (includes duration) |
| POST | `/users/:id/playlist/` | Owner | Add game to playlist. Body: `{game_id, status, hours_played}` |
| PUT | `/users/:id/playlist/:entryId` | Owner | Update status by entry ID. Body: `{status}` |
| PUT | `/users/:id/playlist/game/:gameId` | Owner | Update status by game ID. Body: `{status}` |
| DELETE | `/users/:id/playlist/:entryId` | Owner | Remove by entry ID |
| DELETE | `/users/:id/playlist/game/:gameId` | Owner | Remove by game ID |

Status values: `want_to_play`, `playing`, `completed`, `abandoned`

### Favorites
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users/:id/favorites/` | None | List user's favorite entries |
| GET | `/users/:id/favorites/games` | None | List full game objects in user's favorites (includes duration) |
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

### Game Lists (NEW)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/lists/` | None | Browse all lists |
| GET | `/lists/:listId` | None | Get a list by ID |
| GET | `/lists/:listId/items` | None | Get list item entries |
| GET | `/lists/:listId/games` | None | Get full game objects in a list (includes duration) |
| GET | `/users/:id/lists/` | None | Get all lists by a user |
| POST | `/users/:id/lists/` | Owner | Create a new list. Body: `{name, description}` |
| PUT | `/users/:id/lists/:listId` | Owner | Update list. Body: `{name, description}` |
| DELETE | `/users/:id/lists/:listId` | Owner | Delete list (cascades items) |
| POST | `/users/:id/lists/:listId/items` | Owner | Add a game to a list. Body: `{game_id}` |
| DELETE | `/users/:id/lists/:listId/items/:itemId` | Owner | Remove item by ID |
| DELETE | `/users/:id/lists/:listId/games/:gameId` | Owner | Remove game from list |

### Auth Levels
- **None** — Public, no token needed
- **Token** — Any valid JWT token (logged-in user)
- **Owner** — Valid JWT token where the token's user ID matches the `:id` in the URL

---

## Unit Tests

**123 total tests** across repositories and utilities. All tests use in-memory SQLite databases for isolation — each test gets a fresh database, no test affects another.

Run with: `go test ./... -v`

### Utils (13 tests)
- **Password hashing (5 tests):** Verifies bcrypt hashing produces non-plaintext output, correct passwords match, wrong and empty passwords are rejected, and same password produces different hashes due to salt.
- **JWT tokens (8 tests):** Verifies token generation, valid token returns correct user ID, different users get distinct tokens, invalid/empty/tampered/expired tokens are rejected, and wrong signing methods are blocked.

### Repositories (110 tests)
- **Games (17 tests):** Full CRUD coverage plus duration upsert (create and update), duration preloading via `GetGameByID`, duration delete, duration not-found, and duration isolation between games.
- **Users (13 tests):** Full CRUD + unique constraints — create, get all, get by ID, find by email, duplicate email/username rejected, update, delete, password hash retrieval.
- **Playlist (18 tests):** Create (with hours_played), get by user, user isolation, find by user+game, update by ID and by user+game, delete by ID and by user+game, hard delete allows re-add, get games by user (with duration preload), excludes deleted entries.
- **Favorites (15 tests):** Create, get by user, user isolation, find by user+game, delete by ID and by user+game, hard delete allows re-add, get games by user (with duration preload), excludes deleted entries, doesn't return other users' games.
- **Reviews (16 tests):** Create with/without text, get by ID, get all, filter by user/game/both, update score/text, delete, multiple reviews same game.
- **Game Lists (31 tests):** List CRUD — create (with/without description), get by ID, get by user, get all, update, delete, user isolation. Item CRUD — add item, get items by list, find item, remove by ID, remove by list+game, hard delete allows re-add, game can appear in multiple lists, get full game objects by list (with duration preload), excludes deleted items, bulk delete items by list, cross-list isolation.

---

## How to Run

From `apps/backend`: delete `respawn67.db` for a fresh start, then run `go run main.go`. Server starts at `http://localhost:8080`. To run all tests: `go test ./... -v`.