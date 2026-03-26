import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { changeImageSize, toUiGameData } from "@/routes/game.$id";

// mocks
vi.mock("react-router", async () => {
  const actual = await vi.importActual<typeof import("react-router")>("react-router");
  return {
    ...actual,
    Link: ({ to, children, ...props }: any) => <a href={to} {...props}>{children}</a>,
    useNavigate: () => vi.fn(),
    useLoaderData: () => ({
      gameData: {
        id: 10,
        title: "Celeste",
        genre: "Platformer, Indie",
        developer: "Extremely OK Games",
        release_year: 2018,
        cover_image_url: "https://images.igdb.com/igdb/image/upload/t_cover_small/co1.webp",
      },
      id: "10",
    }),
  };
});

vi.mock("@/lib/auth", () => ({
  getStoredUser: vi.fn(() => null),
  getToken: vi.fn(() => null),
}));

vi.mock("@/lib/api", () => ({
  getFavoriteEntries: vi.fn(async () => []),
  getPlaylistEntries: vi.fn(async () => []),
  getReviews: vi.fn(async () => []),
  addFavorite: vi.fn(),
  removeFavoriteByGame: vi.fn(),
  addToPlaylist: vi.fn(),
  removeFromPlaylist: vi.fn(),
  createReview: vi.fn(),
  updateReview: vi.fn(),
  deleteReview: vi.fn(),
  getGameById: vi.fn(),
}));

import GameDetailsPage from "@/routes/game.$id";

describe("changeImageSize (game.$id)", () => {
  it("replaces size token", () => {
    expect(changeImageSize("https://img.com/t_thumb/x.webp", "720p")).toContain("t_720p");
  });
  it("returns placeholder for null", () => {
    expect(changeImageSize(null, "720p")).toContain("placeholder");
  });
  it("returns placeholder for undefined", () => {
    expect(changeImageSize(undefined, "720p")).toContain("placeholder");
  });
});

describe("toUiGameData", () => {
  const apiGame = {
    id: 10,
    title: "Celeste",
    genre: "Platformer, Indie",
    developer: "Extremely OK Games",
    release_year: 2018,
    cover_image_url: "https://images.igdb.com/igdb/image/upload/t_cover_small/co1.webp",
  };

  it("converts API game to UI format", () => {
    const result = toUiGameData(apiGame, "1");
    expect(result.title).toBe("Celeste");
    expect(result.developer).toBe("Extremely OK Games");
    expect(result.year).toBe("2018");
  });

  it("falls back to mock data when game is null", () => {
    const result = toUiGameData(null, "1");
    expect(result.title).toBe("Outer Wilds");
  });

  it("uses Unknown Studio when developer is null", () => {
    const result = toUiGameData({ ...apiGame, developer: null }, "1");
    expect(result.developer).toBe("Unknown Studio");
  });

  it("uses TBA when release_year is null", () => {
    const result = toUiGameData({ ...apiGame, release_year: null }, "1");
    expect(result.year).toBe("TBA");
  });

  it("splits genres by comma and uppercases", () => {
    const result = toUiGameData(apiGame, "1");
    expect(result.genres).toContain("PLATFORMER");
    expect(result.genres).toContain("INDIE");
  });

  it("defaults to ACTION when genre is null", () => {
    const result = toUiGameData({ ...apiGame, genre: null }, "1");
    expect(result.genres).toContain("ACTION");
  });

  it("changes cover to 720p for banner", () => {
    const result = toUiGameData(apiGame, "1");
    expect(result.bannerImage).toContain("t_720p");
  });

  it("changes cover to cover_big for poster", () => {
    const result = toUiGameData(apiGame, "1");
    expect(result.posterImage).toContain("t_cover_big");
  });
});

// game details page component
describe("GameDetailsPage", () => {
  it("renders game title from loader data", async () => {
    render(<GameDetailsPage />);
    expect(await screen.findByText("Celeste")).toBeInTheDocument();
  });

  it("renders developer name", async () => {
    render(<GameDetailsPage />);
    expect(await screen.findByText("Extremely OK Games")).toBeInTheDocument();
  });

  it("renders year", async () => {
    render(<GameDetailsPage />);
    expect(await screen.findByText("2018")).toBeInTheDocument();
  });

  it("renders genre badges", async () => {
    render(<GameDetailsPage />);
    expect(await screen.findByText("PLATFORMER")).toBeInTheDocument();
  });

  it("shows sign-in prompt for unauthenticated users", async () => {
    render(<GameDetailsPage />);
    expect(await screen.findByText("Sign In")).toBeInTheDocument();
  });
});
