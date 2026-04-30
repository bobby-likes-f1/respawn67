import { getToken } from "@/lib/auth";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== "undefined"
    ? "/api/v1" // client-side: use proxy
    : "http://localhost:8080/api/v1"); // server-side: call backend directly

type ApiRequestOptions = {
  method?: string;
  auth?: boolean;
  body?: unknown;
  headers?: HeadersInit;
};

type ApiErrorPayload = {
  message?: unknown;
};

export type ApiGame = {
  id: number;
  title: string;
  genre?: string | null;
  developer?: string | null;
  release_year?: number | null;
  cover_image_url?: string | null;
  description?: string | null;
  average_rating?: number | null;
  review_count?: number | null;
  duration?: {
    main_story_hours?: number;
    main_plus_sides_hours?: number;
    completionist_hours?: number;
  } | null;
  time_to_beat_main?: number | null;
  time_to_beat_extra?: number | null;
  time_to_beat_complete?: number | null;
};

export type PlaylistEntry = {
  id?: number;
  ID?: number;
  user_id: number;
  game_id: number;
  status: string;
  hours_played?: number;
  created_at?: string;
  updated_at?: string;
};

export type FavoriteEntry = {
  id?: number;
  ID?: number;
  user_id: number;
  game_id: number;
};

export type ApiReview = {
  id?: number;
  ID?: number;
  user_id: number;
  game_id: number;
  score: number;
  text?: string | null;
  created_at?: string;
  updated_at?: string;
  CreatedAt?: string;
  UpdatedAt?: string;
};

export type ApiPlaylistUser = {
  user_id: number;
  username: string;
  status: string;
  hours_played: number;
};

export type ApiGuide = {
  id: number;
  game_id: number;
  user_id: number;
  title: string;
  content: string;
  created_at?: string;
  updated_at?: string;
  CreatedAt?: string;
  UpdatedAt?: string;
};

export type ApiArticle = {
  id: number;
  user_id: number;
  user?: {
    id: number;
    username: string;
  };
  title: string;
  content: string;
  created_at?: string;
  updated_at?: string;
  CreatedAt?: string;
  UpdatedAt?: string;
};

export type ApiGameCommunityHub = {
  average_rating: number | null;
  review_count: number;
  rating_distribution: Record<string, number>;
  reviews: ApiReview[];
  lists: ApiGameList[];
  playlist_users: ApiPlaylistUser[];
};

function getErrorMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object") {
    const message = (payload as ApiErrorPayload).message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  return fallback;
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { method = "GET", auth = false, body, headers } = options;

  let mergedHeaders: HeadersInit = {
    ...(body ? { "Content-Type": "application/json" } : {}),
    ...headers,
  };

  if (auth) {
    const token = getToken();
    if (!token) {
      throw new Error("You need to log in first");
    }
    mergedHeaders = {
      ...mergedHeaders,
      Authorization: `Bearer ${token}`,
    };
  }

  const url = `${API_BASE_URL}${path}`;
  console.log(`[API] ${method} ${url}`);

  const response = await fetch(url, {
    method,
    headers: mergedHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = (await response
    .json()
    .catch(() => ({}))) as unknown;

  if (!response.ok) {
    console.error(`[API] Error ${response.status} from ${url}:`, data);
    throw new Error(getErrorMessage(data, "Request failed"));
  }

  return data as T;
}

export function getAllGames() {
  return apiRequest<ApiGame[]>("/games/").then((result) => result || []);
}

export type ApiUser = {
  id: number;
  username: string;
  email: string;
};

export function getUserById(userId: number | string) {
  return apiRequest<ApiUser>(`/users/${userId}`);
}

export function getAllUsers() {
  return apiRequest<ApiUser[]>("/users/").then((result) => result || []);
}

export function getPublicUserLists(userId: number) {
  return apiRequest<ApiGameList[]>(`/users/${userId}/lists/`).then(
    (result) => result || [],
  );
}

export function getPublicReviews(filters: { userId?: number; gameId?: number }) {
  const params = new URLSearchParams();
  if (filters.userId) params.set("user_id", String(filters.userId));
  if (filters.gameId) params.set("game_id", String(filters.gameId));
  const suffix = params.toString();
  const path = suffix ? `/reviews/?${suffix}` : "/reviews/";
  return apiRequest<ApiReview[]>(path).then((result) => result || []);
}

export function getGameReviews(gameId: number) {
  return getPublicReviews({ gameId });
}

export function getGameById(gameId: number | string) {
  return apiRequest<ApiGame>(`/games/${gameId}`).catch((err) => {
    console.error(`[API] Failed to fetch game ${gameId}:`, err);
    throw err;
  });
}

export function getGameCommunityHub(gameId: number | string) {
  return apiRequest<ApiGameCommunityHub>(`/games/${gameId}/community`).then((result) => ({
    average_rating: result.average_rating ?? null,
    review_count: result.review_count ?? 0,
    rating_distribution: result.rating_distribution ?? {},
    reviews: result.reviews ?? [],
    lists: result.lists ?? [],
    playlist_users: result.playlist_users ?? [],
  }));
}

export function getGameGuides(gameId: number | string) {
  return apiRequest<ApiGuide[]>(`/games/${gameId}/guides/`).then((result) => result || []);
}

export function createGuide(
  gameId: number | string,
  payload: { title: string; content: string },
) {
  return apiRequest<ApiGuide>(`/games/${gameId}/guides/`, {
    method: "POST",
    auth: true,
    body: payload,
  });
}

export function updateGuide(
  gameId: number | string,
  guideId: number | string,
  payload: { title: string; content: string },
) {
  return apiRequest<ApiGuide>(`/games/${gameId}/guides/${guideId}`, {
    method: "PUT",
    auth: true,
    body: payload,
  });
}

export function deleteGuide(gameId: number | string, guideId: number | string) {
  return apiRequest<{ message: string }>(`/games/${gameId}/guides/${guideId}`, {
    method: "DELETE",
    auth: true,
  });
}

export function getAllArticles() {
  return apiRequest<ApiArticle[]>("/articles/").then((result) => result || []);
}

export async function getArticleById(articleId: number | string) {
  try {
    return await apiRequest<ApiArticle>(`/articles/${articleId}`);
  } catch {
    const articles = await getAllArticles();
    const normalizedId = Number(articleId);
    const article = articles.find((entry) => entry.id === normalizedId);

    if (!article) {
      throw new Error("Article not found");
    }

    return article;
  }
}

export function createArticle(payload: { title: string; content: string }) {
  return apiRequest<ApiArticle>("/articles/", {
    method: "POST",
    auth: true,
    body: payload,
  });
}

export function updateArticle(
  articleId: number | string,
  payload: { title: string; content: string },
) {
  return apiRequest<ApiArticle>(`/articles/${articleId}`, {
    method: "PUT",
    auth: true,
    body: payload,
  });
}

export function deleteArticle(articleId: number | string) {
  return apiRequest<{ message: string }>(`/articles/${articleId}`, {
    method: "DELETE",
    auth: true,
  });
}

export function setGameDuration(
  gameId: number,
  data: {
    main_story_hours: number;
    main_plus_sides_hours: number;
    completionist_hours: number;
  },
) {
  return apiRequest<ApiGame>(`/games/${gameId}/duration`, {
    method: "POST",
    body: JSON.stringify(data),
    auth: true,
  });
}

export function getPlaylistEntries(userId: number) {
  return apiRequest<PlaylistEntry[]>(`/users/${userId}/playlist/`, { auth: true }).then(
    (result) => result || [],
  );
}

export function getPlaylistGames(userId: number) {
  return apiRequest<ApiGame[]>(`/users/${userId}/playlist/games`, { auth: true }).then(
    (result) => result || [],
  );
}

export function addToPlaylist(userId: number, gameId: number, status = "want_to_play") {
  return apiRequest<PlaylistEntry>(`/users/${userId}/playlist/`, {
    method: "POST",
    auth: true,
    body: { game_id: gameId, status },
  });
}

export function updatePlaylistEntryByGame(
  userId: number,
  gameId: number,
  payload: { status?: string; hours_played?: number },
) {
  return apiRequest<PlaylistEntry>(`/users/${userId}/playlist/game/${gameId}`, {
    method: "PUT",
    auth: true,
    body: payload,
  });
}

export function removeFromPlaylist(userId: number, gameId: number) {
  return apiRequest<{ message: string }>(`/users/${userId}/playlist/game/${gameId}`, {
    method: "DELETE",
    auth: true,
  });
}

export function getFavoriteEntries(userId: number) {
  return apiRequest<FavoriteEntry[]>(`/users/${userId}/favorites/`, { auth: true }).then(
    (result) => result || [],
  );
}

export function getFavoriteGames(userId: number) {
  return apiRequest<ApiGame[]>(`/users/${userId}/favorites/games`, { auth: true }).then(
    (result) => result || [],
  );
}

export function addFavorite(userId: number, gameId: number) {
  return apiRequest<FavoriteEntry>(`/users/${userId}/favorites/`, {
    method: "POST",
    auth: true,
    body: { game_id: gameId },
  });
}

export function removeFavoriteByGame(userId: number, gameId: number) {
  return apiRequest<{ message: string }>(`/users/${userId}/favorites/game/${gameId}`, {
    method: "DELETE",
    auth: true,
  });
}

export function getReviews(filters: { userId?: number; gameId?: number }) {
  const params = new URLSearchParams();
  if (filters.userId) {
    params.set("user_id", String(filters.userId));
  }
  if (filters.gameId) {
    params.set("game_id", String(filters.gameId));
  }

  const suffix = params.toString();
  const path = suffix ? `/reviews/?${suffix}` : "/reviews/";

  return apiRequest<ApiReview[]>(path, { auth: true }).then((result) => result || []);
}

export function createReview(payload: {
  user_id: number;
  game_id: number;
  score: number;
  text?: string;
}) {
  return apiRequest<ApiReview>("/reviews/", {
    method: "POST",
    auth: true,
    body: payload,
  });
}

export function getReviewById(reviewId: number | string) {
  return apiRequest<ApiReview>(`/reviews/${reviewId}`);
}

export function updateReview(
  userId: number,
  gameId: number,
  payload: { score?: number; text?: string },
) {
  return apiRequest<ApiReview>(`/reviews/user/${userId}/game/${gameId}`, {
    method: "PUT",
    auth: true,
    body: payload,
  });
}

export function deleteReview(userId: number, gameId: number) {
  return apiRequest<{ message: string }>(`/reviews/user/${userId}/game/${gameId}`, {
    method: "DELETE",
    auth: true,
  });
}

// ── Game Lists ──

export type ApiGameList = {
  id: number;
  user_id: number;
  name: string;
  description?: string | null;
  // Enriched client-side fields (not from API)
  username?: string;
  like_count?: number;
  liked_by_me?: boolean;
  game_count?: number;
};

export type ApiGameListItem = {
  id: number;
  list_id: number;
  game_id: number;
};

export function getAllLists() {
  return apiRequest<ApiGameList[]>("/lists/").then((result) => result || []);
}

export function getListById(listId: number | string) {
  return apiRequest<ApiGameList>(`/lists/${listId}`);
}

export function getListItems(listId: number | string) {
  return apiRequest<ApiGameListItem[]>(`/lists/${listId}/items`).then(
    (result) => result || [],
  );
}

export function getListGames(listId: number | string) {
  return apiRequest<ApiGame[]>(`/lists/${listId}/games`).then(
    (result) => result || [],
  );
}

export function getUserLists(userId: number) {
  return apiRequest<ApiGameList[]>(`/users/${userId}/lists/`, { auth: true }).then(
    (result) => result || [],
  );
}

export function createList(
  userId: number,
  payload: { name: string; description?: string },
) {
  return apiRequest<ApiGameList>(`/users/${userId}/lists/`, {
    method: "POST",
    auth: true,
    body: payload,
  });
}

export function updateList(
  userId: number,
  listId: number,
  payload: { name: string; description?: string | null },
) {
  return apiRequest<ApiGameList>(`/users/${userId}/lists/${listId}`, {
    method: "PUT",
    auth: true,
    body: payload,
  });
}

export function deleteList(userId: number, listId: number) {
  return apiRequest<{ message: string }>(`/users/${userId}/lists/${listId}`, {
    method: "DELETE",
    auth: true,
  });
}

export function addGameToList(
  userId: number,
  listId: number,
  gameId: number,
) {
  return apiRequest<ApiGameListItem>(
    `/users/${userId}/lists/${listId}/items`,
    {
      method: "POST",
      auth: true,
      body: { game_id: gameId },
    },
  );
}

export function removeGameFromList(
  userId: number,
  listId: number,
  gameId: number,
) {
  return apiRequest<{ message: string }>(
    `/users/${userId}/lists/${listId}/games/${gameId}`,
    {
      method: "DELETE",
      auth: true,
    },
  );
}

// ── List Likes (placeholder — backend not yet implemented) ──

export async function likeList(_listId: number): Promise<void> {
  // TODO: POST /lists/:listId/like once backend is ready
  console.warn("[API] likeList is a placeholder — backend not implemented yet");
}

export async function unlikeList(_listId: number): Promise<void> {
  // TODO: DELETE /lists/:listId/like once backend is ready
  console.warn("[API] unlikeList is a placeholder — backend not implemented yet");
}
