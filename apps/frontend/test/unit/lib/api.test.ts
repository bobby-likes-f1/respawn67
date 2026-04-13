import { describe, expect, it, vi, beforeEach } from "vitest";

// mock auth.getToken
vi.mock("@/lib/auth", () => ({
  getToken: vi.fn(() => "test-token"),
}));
import { getToken } from "@/lib/auth";
const getTokenMock = vi.mocked(getToken);

// fetch mock
const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

function jsonOk(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

function jsonErr(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

import {
  apiRequest,
  getAllGames,
  getGameById,
  getPlaylistEntries,
  getPlaylistGames,
  addToPlaylist,
  updatePlaylistStatusByGame,
  removeFromPlaylist,
  getFavoriteEntries,
  getFavoriteGames,
  addFavorite,
  removeFavoriteByGame,
  getReviews,
  createReview,
  updateReview,
  deleteReview,
} from "@/lib/api";

// apiRequest
describe("apiRequest", () => {
  it("makes GET request by default", async () => {
    fetchMock.mockResolvedValueOnce(jsonOk({ ok: true }));
    const res = await apiRequest("/test");
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0][1]?.method).toBe("GET");
  });

  it("adds auth header when auth=true", async () => {
    fetchMock.mockResolvedValueOnce(jsonOk({}));
    await apiRequest("/x", { auth: true });
    const headers = fetchMock.mock.calls[0][1]?.headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer test-token");
  });

  it("throws when auth=true but no token", async () => {
    getTokenMock.mockReturnValueOnce(null);
    await expect(apiRequest("/x", { auth: true })).rejects.toThrow("log in");
  });

  it("sends JSON body for POST", async () => {
    fetchMock.mockResolvedValueOnce(jsonOk({}));
    await apiRequest("/x", { method: "POST", body: { a: 1 } });
    expect(fetchMock.mock.calls[0][1]?.body).toBe('{"a":1}');
  });

  it("throws with server message on error", async () => {
    fetchMock.mockResolvedValueOnce(jsonErr(400, { message: "bad" }));
    await expect(apiRequest("/x")).rejects.toThrow("bad");
  });

  it("throws generic message when no error payload", async () => {
    fetchMock.mockResolvedValueOnce(jsonErr(500, {}));
    await expect(apiRequest("/x")).rejects.toThrow("Request failed");
  });

  it("returns parsed JSON on success", async () => {
    fetchMock.mockResolvedValueOnce(jsonOk({ id: 42 }));
    const data = await apiRequest<{ id: number }>("/x");
    expect(data.id).toBe(42);
  });
});

// game endpoints
describe("getAllGames", () => {
  it("returns array of games", async () => {
    fetchMock.mockResolvedValueOnce(jsonOk([{ id: 1, title: "A" }]));
    const games = await getAllGames();
    expect(games).toHaveLength(1);
  });

  it("returns empty array on null", async () => {
    fetchMock.mockResolvedValueOnce(jsonOk(null));
    const games = await getAllGames();
    expect(games).toEqual([]);
  });
});

describe("getGameById", () => {
  it("fetches game by id", async () => {
    fetchMock.mockResolvedValueOnce(jsonOk({ id: 5, title: "G" }));
    const game = await getGameById(5);
    expect(game.title).toBe("G");
  });

  it("re-throws on failure", async () => {
    fetchMock.mockResolvedValueOnce(jsonErr(404, { message: "not found" }));
    await expect(getGameById(999)).rejects.toThrow("not found");
  });
});

// playlist endpoints
describe("playlist endpoints", () => {
  it("getPlaylistEntries returns array", async () => {
    fetchMock.mockResolvedValueOnce(jsonOk([{ game_id: 1, status: "playing" }]));
    const entries = await getPlaylistEntries(1);
    expect(entries).toHaveLength(1);
  });

  it("getPlaylistGames returns empty on null", async () => {
    fetchMock.mockResolvedValueOnce(jsonOk(null));
    expect(await getPlaylistGames(1)).toEqual([]);
  });

  it("addToPlaylist sends POST with body", async () => {
    fetchMock.mockResolvedValueOnce(jsonOk({ game_id: 2, status: "want_to_play" }));
    await addToPlaylist(1, 2);
    expect(fetchMock.mock.calls[0][1]?.method).toBe("POST");
  });

  it("updatePlaylistStatusByGame sends PUT", async () => {
    fetchMock.mockResolvedValueOnce(jsonOk({}));
    await updatePlaylistStatusByGame(1, 2, "completed");
    expect(fetchMock.mock.calls[0][1]?.method).toBe("PUT");
  });

  it("removeFromPlaylist sends DELETE", async () => {
    fetchMock.mockResolvedValueOnce(jsonOk({ message: "ok" }));
    await removeFromPlaylist(1, 2);
    expect(fetchMock.mock.calls[0][1]?.method).toBe("DELETE");
  });
});

// favorite endpoints
describe("favorite endpoints", () => {
  it("getFavoriteEntries returns array", async () => {
    fetchMock.mockResolvedValueOnce(jsonOk([{ game_id: 1 }]));
    const favs = await getFavoriteEntries(1);
    expect(favs).toHaveLength(1);
  });

  it("getFavoriteGames returns empty on null", async () => {
    fetchMock.mockResolvedValueOnce(jsonOk(null));
    expect(await getFavoriteGames(1)).toEqual([]);
  });

  it("addFavorite sends POST", async () => {
    fetchMock.mockResolvedValueOnce(jsonOk({ game_id: 3 }));
    await addFavorite(1, 3);
    expect(fetchMock.mock.calls[0][1]?.method).toBe("POST");
  });

  it("removeFavoriteByGame sends DELETE", async () => {
    fetchMock.mockResolvedValueOnce(jsonOk({ message: "ok" }));
    await removeFavoriteByGame(1, 3);
    expect(fetchMock.mock.calls[0][1]?.method).toBe("DELETE");
  });
});

// review endpoints
describe("review endpoints", () => {
  it("getReviews builds query string", async () => {
    fetchMock.mockResolvedValueOnce(jsonOk([]));
    await getReviews({ userId: 1, gameId: 2 });
    expect(fetchMock.mock.calls[0][0]).toContain("user_id=1");
    expect(fetchMock.mock.calls[0][0]).toContain("game_id=2");
  });

  it("getReviews with no filters calls /reviews/", async () => {
    fetchMock.mockResolvedValueOnce(jsonOk([]));
    await getReviews({});
    expect(fetchMock.mock.calls[0][0]).toContain("/reviews/");
  });

  it("createReview sends POST", async () => {
    fetchMock.mockResolvedValueOnce(jsonOk({ id: 1 }));
    await createReview({ user_id: 1, game_id: 2, score: 8, text: "great" });
    expect(fetchMock.mock.calls[0][1]?.method).toBe("POST");
  });

  it("updateReview sends PUT", async () => {
    fetchMock.mockResolvedValueOnce(jsonOk({}));
    await updateReview(1, 2, { score: 9 });
    expect(fetchMock.mock.calls[0][1]?.method).toBe("PUT");
  });

  it("deleteReview sends DELETE", async () => {
    fetchMock.mockResolvedValueOnce(jsonOk({ message: "ok" }));
    await deleteReview(1, 2);
    expect(fetchMock.mock.calls[0][0]).toContain("/reviews/user/1/game/2");
  });

  it("getReviews returns empty on null", async () => {
    fetchMock.mockResolvedValueOnce(jsonOk(null));
    expect(await getReviews({})).toEqual([]);
  });
});
