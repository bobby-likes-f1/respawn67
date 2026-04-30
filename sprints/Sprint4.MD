# Sprint 4 — Frontend

We focused on shipping the Articles feature set and building a Cypress E2E suite that validates real user flows end-to-end.

### Completed Work

#### Articles Tab
- Added a full Articles navigation path with routes for browse, write, view, and edit (`/articles`, `/articles/write`, `/articles/:id`, `/articles/:id/edit`).
- Implemented the **articles index** with API-driven content, author name enrichment, and client-side search across title, content, and author.
- Built the **article detail** view with formatted rendering (headings, bullets, paragraphs), author profile linking, and readable publish dates.
- Added **owner-only actions** on article detail for edit/delete, including a confirmation dialog and redirect after deletion.
- Created a **write flow** with auth gating, validation rules, live preview, and publishing feedback before redirecting.
- Implemented an **edit flow** that verifies article ownership, loads existing content, and shows success/error states before returning to the article view.
- Expanded the **API layer** with `getAllArticles`, `getArticleById`, `createArticle`, `updateArticle`, and `deleteArticle`.

#### Community Guides
- Added **community guides** functionality with new guide creation and detail pages under the game community routes.
- Implemented a **guide creation flow** with validation, author gating, and post-submit navigation back to the guide view.
- Built a **guide detail page** that renders full guide content with author attribution and publish date context.

#### Community Page Updates
- Refreshed the **community page** content to surface guides, discussions, and contributor activity more clearly.
- Improved page layout and interaction flow to make community browsing faster and more intuitive.

#### API Layer Expansion
- Extended articles API with `getAllArticles`, `getArticleById`, `createArticle`, `updateArticle`, and `deleteArticle`.
- Added guides API wrappers for `getGameGuides`, `createGuide`, `updateGuide`, and `deleteGuide`.
- Extended `ApiGuide` type to include id, game_id, user_id, title, content, and timestamps.
- Maintained fallback logic in `getArticleById` for network resilience when API is temporarily unavailable.

#### Cypress Testing Suite
- Configured Cypress E2E settings for the Vite app (`baseUrl: http://localhost:5173`, viewport 1280x720, screenshots on failure, video off).
- Added global support hooks to ignore known hydration and dynamic import exceptions during runs.
- Wrote an **account like flow** test: login, like a game, verify liked state, visit Articles, and log out.
- Wrote an **account + article flow** test: login, like a game, publish a unique article, open it, then log out.
- Tests rely on **real UI navigation and form interactions**, validating behavior from the user's perspective.

### Frontend Route Documentation

| Route | Auth Required | Description |
|---|---|---|
| `/` | None | Landing home dashboard |
| `/login` | None | User authentication login |
| `/signup` | None | User account creation |
| `/games` | None | Global game catalog with filtering, browsing, and community reviews |
| `/games/:id` | None | Dynamic game detail with time-to-beat, community reviews, and user interactions |
| `/games/:id/community` | None | Game community hub with reviews, guides, and discussions |
| `/games/:id/community/guides/new` | Token | Create a new guide for a game (author gated) |
| `/games/:id/community/guides/:guideId` | None | View a published guide with full content and author info |
| `/games/:id/community/guides/:guideId/edit` | Token | Edit an existing guide (author gated) |
| `/account` | Token | User profile, statistics, backlog preview, lists, and reviews |
| `/backlog` | Token | User-specific backlog with hours tracking, status management, and progress bars |
| `/users/:id` | None | Public user profile with favorites, backlog, reviews, and lists |
| `/lists` | None | Global game list browser with search, sort, and create |
| `/lists/:id` | None | List detail with game grid, add/remove (owner), and like button |
| `/articles` | None | Browse all community articles with search |
| `/articles/write` | Token | Create and publish a new article |
| `/articles/:id` | None | Read a published article with author attribution |
| `/articles/:id/edit` | Token | Edit an existing article (author gated) |
| `/community` | None | Community hub with recent activity, guides, and discussions |

*Note: Auth levels indicate whether a valid JWT session token is required to actively fetch/display specific page data. Owner-level write operations (create/edit/delete articles, guides, lists) require the token's user ID to match the resource owner.*

### Unit Tests

Extended the frontend unit test suite to cover Sprint 4 features:
- **Articles functionality**: browse page rendering, article detail view, author enrichment, create/edit/delete flows
- **Community guides**: guide creation, detail rendering, author-only edit/delete actions
- **API integration**: articles and guides API wrapper tests with error handling

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

To run Cypress E2E tests:
```
cd apps/frontend && npx cypress open
```
Or run headless:
```
cd apps/frontend && npx cypress run
```
# Sprint 4 — Backend

We focused on building the features like Articles, Community Hub, Guides and Average Rating.

---


We focused on expanding the platform with a game-specific community hub, guides (game-scoped walkthroughs), articles, and automatic average rating tracking. All new features follow the existing layered architecture (routes -> services -> repositories -> models) and are covered by repository-level unit tests.

### Articles API
- Implemented a full **Articles** feature for platform-level written content (news, editorials, spotlights) — separate from game-specific guides.
- New `Article` model with `user_id`, `title`, and `content` fields.
- Full CRUD with JWT ownership verification — users can only edit or delete their own articles.
- Public read endpoints require no authentication.

### Guides API (Game-Scoped)
- Implemented a **Guides** feature for game-specific user-authored content (walkthroughs, tips, boss guides).
- New `Guide` model — same shape as `Article` but scoped to a game via a `game_id` foreign key. Stored in a separate `guides` table to keep game-scoped and platform-level content cleanly separated.
- Full CRUD nested under `/games/:id/guides` with JWT ownership verification.
- Public read endpoints return all guides for a given game.

### Game Community Hub
- New aggregate endpoint `GET /games/:id/community` that returns everything needed to render a game's community page in a single API call.
- The response is assembled from four targeted queries in the repository layer and combined in the service layer into a single `GameCommunityHub` struct.
- **Rating distribution** — a `GROUP BY score` query on the reviews table, fanned out into a fixed map of all 10 score buckets (scores with no reviews are included as `0` so the frontend can always render a complete bar chart without null-checking).
- **All reviews** — full review list for the game reusing the existing `ReviewsRepository`.
- **Lists containing the game** — joins `game_lists` to `game_list_items` to find every curated list that includes this game.
- **Playlist users** — joins `playlists` to `users` returning a lightweight struct (user ID, username, status, hours played) for every user who has the game in their backlog.

### Average Rating Tracking
- `Game` model now tracks `average_rating` (float, nullable) and `review_count` (int) as denormalized fields, updated automatically on every review create, update, and delete via `UpdateGameRating()`.
- Rating is computed in a single aggregation query (`SELECT AVG(score), COUNT(*) FROM reviews WHERE game_id = ?`) and written back to the game row, keeping reads fast with no join required.
- Both fields are returned on all game GET responses.

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
| GET | `/games/` | None | List all games (includes duration, average_rating, review_count) |
| GET | `/games/:id` | None | Get game by ID (includes duration, average_rating, review_count) |
| POST | `/games/` | Token | Add a new game. Body: `{title, description, developer, publisher, release_date, genre, cover_image_url}` |
| PUT | `/games/:id` | Token | Update a game |
| DELETE | `/games/:id` | Token | Delete a game |

### Game Duration
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| PUT | `/games/:id/duration` | Token | Create or update duration. Body: `{main_story_hours, main_plus_sides_hours, completionist_hours}` |
| DELETE | `/games/:id/duration` | Token | Remove duration data for a game |

### Guides (NEW)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/games/:id/guides` | None | List all guides for a game |
| POST | `/games/:id/guides` | Token | Create a guide. Body: `{title, content}` |
| PUT | `/games/:id/guides/:guideId` | Owner | Update your guide. Body: `{title, content}` |
| DELETE | `/games/:id/guides/:guideId` | Owner | Delete your guide |

### Game Community Hub (NEW)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/games/:id/community` | None | Returns aggregate community data for a game |

Response shape:
```json
{
  "average_rating": 8.0,
  "review_count": 2,
  "rating_distribution": {
    "1": 0, "2": 0, "3": 0, "4": 0, "5": 0,
    "6": 0, "7": 1, "8": 0, "9": 1, "10": 0
  },
  "reviews": [ ...all reviews for the game... ],
  "lists": [ ...GameList objects containing this game... ],
  "playlist_users": [
    { "user_id": 1, "username": "alice", "status": "completed", "hours_played": 42 },
    { "user_id": 2, "username": "bob",   "status": "playing",   "hours_played": 10 }
  ]
}
```

### Playlist
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users/:id/playlist/` | None | List user's playlist entries |
| GET | `/users/:id/playlist/games` | None | List full game objects in user's playlist |
| POST | `/users/:id/playlist/` | Owner | Add game. Body: `{game_id, status, hours_played}` |
| PUT | `/users/:id/playlist/:entryId` | Owner | Update status by entry ID. Body: `{status}` |
| PUT | `/users/:id/playlist/game/:gameId` | Owner | Update status by game ID. Body: `{status}` |
| DELETE | `/users/:id/playlist/:entryId` | Owner | Remove by entry ID |
| DELETE | `/users/:id/playlist/game/:gameId` | Owner | Remove by game ID |

### Favorites
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users/:id/favorites/` | None | List user's favorites |
| GET | `/users/:id/favorites/games` | None | List full game objects in favorites |
| POST | `/users/:id/favorites/` | Owner | Add a favorite. Body: `{game_id}` |
| DELETE | `/users/:id/favorites/:entryId` | Owner | Remove by entry ID |
| DELETE | `/users/:id/favorites/game/:gameId` | Owner | Remove by game ID |

### Reviews
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/reviews/` | None | List reviews. Optional: `?user_id=1&game_id=2` |
| GET | `/reviews/:id` | None | Get review by ID |
| POST | `/reviews/` | Token | Create review. Body: `{user_id, game_id, score, text}` |
| PUT | `/reviews/user/:user_id/game/:game_id` | Token | Update review. Body: `{score, text}` |
| DELETE | `/reviews/user/:user_id/game/:game_id` | Token | Delete review |

### Game Lists
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/lists/` | None | Browse all lists |
| GET | `/lists/:listId` | None | Get a list by ID |
| GET | `/lists/:listId/items` | None | Get list item entries |
| GET | `/lists/:listId/games` | None | Get full game objects in a list |
| GET | `/users/:id/lists/` | None | Get all lists by a user |
| POST | `/users/:id/lists/` | Owner | Create a list. Body: `{name, description}` |
| PUT | `/users/:id/lists/:listId` | Owner | Update list. Body: `{name, description}` |
| DELETE | `/users/:id/lists/:listId` | Owner | Delete list (cascades items) |
| POST | `/users/:id/lists/:listId/items` | Owner | Add a game. Body: `{game_id}` |
| DELETE | `/users/:id/lists/:listId/items/:itemId` | Owner | Remove item by ID |
| DELETE | `/users/:id/lists/:listId/games/:gameId` | Owner | Remove game from list |

### Articles (NEW)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/articles/` | None | List all articles |
| GET | `/articles/:id` | None | Get article by ID |
| POST | `/articles/` | Token | Create an article. Body: `{title, content}` |
| PUT | `/articles/:id` | Owner | Update your article. Body: `{title, content}` |
| DELETE | `/articles/:id` | Owner | Delete your article |

### Auth Levels
- **None** - Public, no token needed
- **Token** - Any valid JWT token (logged-in user)
- **Owner** - Valid JWT where the token's user ID matches the resource owner

---

## Unit Tests

**16 new tests** added across 2 new test files. All tests use in-memory SQLite for isolation.

Run with: `go test ./... -v`

### Guides Repository (8 tests)
- Create guide, get by ID, get by ID not found
- Get all guides for a game, get for game with no guides
- Update guide, delete guide, delete non-existent guide, hard delete allows recreate

### Community Repository (8 tests)
- **Rating distribution:** all 10 buckets present, missing scores filled as 0, isolated by game, no reviews returns all-zero map
- **Lists containing game:** returns correct lists, empty when none, isolated by game
- **Playlist users:** correct users and fields returned, empty when none, isolated by game

---

## How to Run

From `apps/backend`: delete `respawn67.db` for a fresh start, then run `go run main.go`. Server starts at `http://localhost:8080`. To run all tests: `go test ./... -v`.
