import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import {
  statusToProgress,
  normalizeBacklogStatus,
  toApiBacklogStatus,
  formatBacklogStatus,
  formatDate,
  getReviewCreatedAt,
  changeImageSize,
  normalizeReviewScore,
} from "@/routes/account";

// mocks
vi.mock("react-router", async () => {
  const actual = await vi.importActual<typeof import("react-router")>("react-router");
  return {
    ...actual,
    Link: ({ to, children, ...props }: any) => <a href={to} {...props}>{children}</a>,
    useNavigate: () => vi.fn(),
  };
});

const mockGetStoredUser = vi.fn();
const mockGetInitials = vi.fn().mockReturnValue("P");
const mockGetMemberSinceLabel = vi.fn().mockReturnValue("2026");
const mockGetAllArticles = vi.fn();
const mockGetAllGames = vi.fn();
const mockGetGameGuides = vi.fn();

vi.mock("@/lib/auth", () => ({
  getStoredUser: () => mockGetStoredUser(),
  getInitials: (name: string) => mockGetInitials(name),
  getMemberSinceLabel: (user: unknown) => mockGetMemberSinceLabel(user),
  getToken: vi.fn(() => "tok"),
}));

vi.mock("@/lib/use-require-auth", () => ({
  useRequireAuth: () => true,
}));

vi.mock("@/lib/api", () => ({
  getAllArticles: () => mockGetAllArticles(),
  getFavoriteGames: vi.fn(async () => []),
  getReviews: vi.fn(async () => []),
  getPlaylistEntries: vi.fn(async () => []),
  getPlaylistGames: vi.fn(async () => []),
  getAllGames: () => mockGetAllGames(),
  getGameGuides: (id: string | number) => mockGetGameGuides(id),
  getUserLists: vi.fn(async () => []),
  getListGames: vi.fn(async () => []),
  createList: vi.fn(),
  updateList: vi.fn(),
  deleteList: vi.fn(),
  deleteReview: vi.fn(),
  removeFavoriteByGame: vi.fn(),
  removeFromPlaylist: vi.fn(),
  updatePlaylistEntryByGame: vi.fn(),
  updateReview: vi.fn(),
}));

import AccountPage from "@/routes/account";

describe("statusToProgress", () => {
  it("returns 100 for completed", () => expect(statusToProgress("completed")).toBe(100));
  it("returns 45 for playing", () => expect(statusToProgress("playing")).toBe(45));
  it("returns 0 for unknown", () => expect(statusToProgress("xyz")).toBe(0));
});

describe("normalizeBacklogStatus", () => {
  it("returns playing", () => expect(normalizeBacklogStatus("playing")).toBe("playing"));
  it("returns completed", () => expect(normalizeBacklogStatus("completed")).toBe("completed"));
  it("maps backlog to want_to_play", () => expect(normalizeBacklogStatus("backlog")).toBe("want_to_play"));
  it("defaults to want_to_play", () => expect(normalizeBacklogStatus("random")).toBe("want_to_play"));
});

describe("toApiBacklogStatus", () => {
  it("passes through want_to_play", () => expect(toApiBacklogStatus("want_to_play")).toBe("want_to_play"));
  it("passes through playing", () => expect(toApiBacklogStatus("playing")).toBe("playing"));
  it("passes through completed", () => expect(toApiBacklogStatus("completed")).toBe("completed"));
});

describe("formatBacklogStatus", () => {
  it('formats want_to_play as "Up Next"', () => expect(formatBacklogStatus("want_to_play")).toBe("Up Next"));
  it('formats playing as "Playing"', () => expect(formatBacklogStatus("playing")).toBe("Playing"));
  it('formats completed as "Completed"', () => expect(formatBacklogStatus("completed")).toBe("Completed"));
});

describe("formatDate", () => {
  it("returns locale date string for valid ISO", () => {
    const result = formatDate("2024-06-15T12:00:00Z");
    expect(result).not.toBe("Recently");
    expect(result.length).toBeGreaterThan(0);
  });
  it('returns "Recently" for undefined', () => expect(formatDate()).toBe("Recently"));
  it('returns "Recently" for invalid date', () => expect(formatDate("nope")).toBe("Recently"));
  it('returns "Recently" for empty string', () => expect(formatDate("")).toBe("Recently"));
});

describe("getReviewCreatedAt", () => {
  it("returns created_at when present", () => {
    expect(getReviewCreatedAt({ user_id: 1, game_id: 1, score: 5, created_at: "2024-01-01" } as any)).toBe("2024-01-01");
  });
  it("falls back to CreatedAt", () => {
    expect(getReviewCreatedAt({ user_id: 1, game_id: 1, score: 5, CreatedAt: "2024-02-02" } as any)).toBe("2024-02-02");
  });
  it("returns undefined when neither present", () => {
    expect(getReviewCreatedAt({ user_id: 1, game_id: 1, score: 5 } as any)).toBeUndefined();
  });
});

describe("changeImageSize (account)", () => {
  it("replaces size token", () => {
    expect(changeImageSize("https://img.com/t_thumb/x.webp", "cover_big")).toContain("t_cover_big");
  });
  it("returns fallback for null", () => {
    expect(changeImageSize(null, "cover_big")).toContain("igdb");
  });
  it("returns fallback for undefined", () => {
    expect(changeImageSize(undefined, "cover_big")).toContain("igdb");
  });
});

describe("normalizeReviewScore", () => {
  it("clamps to min 1", () => expect(normalizeReviewScore(-5)).toBe(1));
  it("clamps to max 10", () => expect(normalizeReviewScore(15)).toBe(10));
  it("rounds to integer", () => expect(normalizeReviewScore(7.6)).toBe(8));
  it("keeps valid score", () => expect(normalizeReviewScore(5)).toBe(5));
});

// account page component
describe("AccountPage", () => {
  beforeEach(() => {
    mockGetStoredUser.mockReturnValue({
      id: 1,
      username: "Neo",
      email: "neo@matrix.io",
      createdAt: "2024-01-01T00:00:00Z",
    });
    mockGetAllGames.mockResolvedValue([
      {
        id: 7,
        title: "Elden Ring",
        cover_image_url: "https://images.igdb.com/igdb/image/upload/t_cover_small/co1.webp",
      },
    ]);
    mockGetAllArticles.mockResolvedValue([
      {
        id: 11,
        user_id: 1,
        title: "My article",
        content: "A draft of useful community notes.",
        created_at: "2026-04-28T12:00:00Z",
      },
    ]);
    mockGetGameGuides.mockResolvedValue([
      {
        id: 21,
        game_id: 7,
        user_id: 1,
        title: "My guide",
        content: "A route that belongs to the signed-in user.",
        created_at: "2026-04-29T12:00:00Z",
      },
    ]);
  });

  it("renders profile header with username", async () => {
    render(<AccountPage />);
    expect(await screen.findByText("Neo")).toBeInTheDocument();
  });

  it("renders member since label", async () => {
    render(<AccountPage />);
    expect(await screen.findByText(/2026/)).toBeInTheDocument();
  });

  it("renders tab navigation", async () => {
    render(<AccountPage />);
    expect(await screen.findByRole("tab", { name: /Profile/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Reviews/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Writing/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Backlog/i })).toBeInTheDocument();
  });

  it("renders favourite games heading", async () => {
    render(<AccountPage />);
    expect(await screen.findByText("Favorite Games")).toBeInTheDocument();
  });

  it("shows editable articles and guides on the writing tab", async () => {
    render(<AccountPage />);

    fireEvent.click(await screen.findByRole("tab", { name: /Writing/i }));

    expect(await screen.findByRole("link", { name: /My article/i })).toHaveAttribute(
      "href",
      "/articles/11",
    );
    expect(screen.getByRole("link", { name: /My guide/i })).toHaveAttribute(
      "href",
      "/games/7/community/guides/21",
    );
    expect(screen.getByRole("link", { name: /Edit/i })).toHaveAttribute(
      "href",
      "/games/7/community/guides/21/edit",
    );
  });
});
