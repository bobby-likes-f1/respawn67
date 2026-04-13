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
  time_to_beat_main?: number | null;
  time_to_beat_extras?: number | null;
  time_to_beat_completionist?: number | null;
};

export type PlaylistEntry = {
  id?: number;
  ID?: number;
  user_id: number;
  game_id: number;
  status: string;
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
  username?: string;
  game_id: number;
  score: number;
  text?: string | null;
  created_at?: string;
  updated_at?: string;
  CreatedAt?: string;
  UpdatedAt?: string;
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

export function getGameById(gameId: number | string) {
  return apiRequest<ApiGame>(`/games/${gameId}`).catch((err) => {
    console.error(`[API] Failed to fetch game ${gameId}:`, err);
    throw err;
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

export function updatePlaylistStatusByGame(userId: number, gameId: number, status: string) {
  return apiRequest<PlaylistEntry>(`/users/${userId}/playlist/game/${gameId}`, {
    method: "PUT",
    auth: true,
    body: { status },
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
