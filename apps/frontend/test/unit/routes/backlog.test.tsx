import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  normalizeStatus,
  toApiStatus,
  inferProgress,
  inferPriority,
  mapBacklogGames,
  formatStatusLabel,
} from "@/routes/backlog";

// mocks
vi.mock("react-router", async () => {
  const actual = await vi.importActual<typeof import("react-router")>("react-router");
  return {
    ...actual,
    Link: ({ to, children, ...props }: any) => <a href={to} {...props}>{children}</a>,
    useNavigate: () => vi.fn(),
  };
});

vi.mock("@/lib/use-require-auth", () => ({
  useRequireAuth: () => true,
}));

const mockGetStoredUser = vi.fn(() => ({
  id: 1,
  username: "Neo",
  email: "neo@matrix.io",
}));

vi.mock("@/lib/auth", () => ({
  getStoredUser: () => mockGetStoredUser(),
}));

vi.mock("@/lib/api", () => ({
  getPlaylistEntries: vi.fn(async () => []),
  getPlaylistGames: vi.fn(async () => []),
  updatePlaylistStatusByGame: vi.fn(),
  removeFromPlaylist: vi.fn(),
}));

import BacklogPage from "@/routes/backlog";

describe("normalizeStatus", () => {
  it('returns "playing" for playing', () => expect(normalizeStatus("playing")).toBe("playing"));
  it('returns "completed" for completed', () => expect(normalizeStatus("completed")).toBe("completed"));
  it('returns "want_to_play" for backlog', () => expect(normalizeStatus("backlog")).toBe("want_to_play"));
  it('defaults to "want_to_play"', () => expect(normalizeStatus("xyz")).toBe("want_to_play"));
});

describe("toApiStatus", () => {
  it("passes through the status", () => expect(toApiStatus("playing")).toBe("playing"));
});

describe("inferProgress", () => {
  it("returns 100 for completed", () => expect(inferProgress("completed")).toBe(100));
  it("returns 45 for playing", () => expect(inferProgress("playing")).toBe(45));
  it("returns 0 for want_to_play", () => expect(inferProgress("want_to_play")).toBe(0));
});

describe("inferPriority", () => {
  it('returns "Done" for completed', () => expect(inferPriority("completed")).toBe("Done"));
  it('returns "High" for playing', () => expect(inferPriority("playing")).toBe("High"));
  it('returns "Medium" for want_to_play', () => expect(inferPriority("want_to_play")).toBe("Medium"));
});

describe("mapBacklogGames", () => {
  const entries = [
    { game_id: 1, user_id: 1, status: "playing" },
    { game_id: 2, user_id: 1, status: "completed" },
  ];
  const games = [
    { id: 1, title: "Game A" },
    { id: 2, title: "Game B" },
    { id: 3, title: "Game C" },
  ] as any[];

  it("maps games with statuses from entries", () => {
    const result = mapBacklogGames(entries, games);
    expect(result).toHaveLength(3);
    expect(result[0].status).toBe("playing");
    expect(result[1].status).toBe("completed");
  });

  it("defaults to want_to_play when no entry", () => {
    const result = mapBacklogGames(entries, games);
    expect(result[2].status).toBe("want_to_play");
  });

  it("sets progress based on status", () => {
    const result = mapBacklogGames(entries, games);
    expect(result[0].progress).toBe(45);
    expect(result[1].progress).toBe(100);
    expect(result[2].progress).toBe(0);
  });

  it("includes title from game", () => {
    const result = mapBacklogGames(entries, games);
    expect(result[0].title).toBe("Game A");
  });

  it("uses genre as platform fallback", () => {
    const gamesWithGenre = [{ id: 1, title: "A", genre: "RPG" }] as any[];
    const result = mapBacklogGames([], gamesWithGenre);
    expect(result[0].platform).toBe("RPG");
  });

  it("returns empty array for empty inputs", () => {
    expect(mapBacklogGames([], [])).toEqual([]);
  });
});

describe("formatStatusLabel", () => {
  it('returns "Up Next" for want_to_play', () => expect(formatStatusLabel("want_to_play")).toBe("Up Next"));
  it('returns "Playing" for playing', () => expect(formatStatusLabel("playing")).toBe("Playing"));
  it('returns "Completed" for completed', () => expect(formatStatusLabel("completed")).toBe("Completed"));
});

// backlog page component
describe("BacklogPage", () => {
  it("renders the page title", async () => {
    render(<BacklogPage />);
    expect(await screen.findByText("My Backlog")).toBeInTheDocument();
  });

  it("renders stat boxes", async () => {
    render(<BacklogPage />);
    expect(await screen.findByText("Total Games")).toBeInTheDocument();
    expect(screen.getByText(/Currently Playing/i)).toBeInTheDocument();
  });

  it("renders tab navigation", async () => {
    render(<BacklogPage />);
    expect(await screen.findByRole("tab", { name: /All Games/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Playing/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Completed/i })).toBeInTheDocument();
  });

  it("renders search input", async () => {
    render(<BacklogPage />);
    expect(await screen.findByPlaceholderText(/Search/i)).toBeInTheDocument();
  });

  it("renders Pick for me button", async () => {
    render(<BacklogPage />);
    expect(await screen.findByRole("button", { name: /Pick for me/i })).toBeInTheDocument();
  });
});
