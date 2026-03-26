import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { changeImageSize, transformGameData } from "@/routes/games";

// mocks
vi.mock("react-router", async () => {
  const actual = await vi.importActual<typeof import("react-router")>("react-router");
  return {
    ...actual,
    Link: ({ to, children, ...props }: any) => <a href={to} {...props}>{children}</a>,
    useNavigate: () => vi.fn(),
  };
});

vi.mock("@/lib/api", () => ({
  getAllGames: vi.fn(async () => []),
}));

import GamesPage from "@/routes/games";

describe("changeImageSize (games)", () => {
  it("replaces size token", () => {
    expect(changeImageSize("https://img.com/t_thumb/x.webp", "1080p")).toContain("t_1080p");
  });
  it("returns placeholder for null", () => {
    expect(changeImageSize(null, "1080p")).toContain("placeholder");
  });
  it("returns placeholder for undefined", () => {
    expect(changeImageSize(undefined, "1080p")).toContain("placeholder");
  });
});

describe("transformGameData", () => {
  const game = {
    id: 7,
    title: "Elden Ring",
    developer: "FromSoftware",
    cover_image_url: "https://img.com/t_thumb/co1.webp",
  } as any;

  it("transforms API game to UI format", () => {
    const result = transformGameData(game);
    expect(result.title).toBe("Elden Ring");
    expect(result.id).toBe(7);
  });

  it("computes deterministic rating", () => {
    const result = transformGameData(game);
    expect(result.rating).toBe(Number((8 + (7 % 20) / 10).toFixed(1)));
  });

  it("computes deterministic timeToBeat", () => {
    const result = transformGameData(game);
    expect(result.timeToBeat).toBe(12 + (7 % 24));
  });

  it("uses developer as platform when present", () => {
    const result = transformGameData(game);
    expect(result.platform).toEqual(["FromSoftware"]);
  });

  it('defaults platform to ["PC"] when no developer', () => {
    const result = transformGameData({ ...game, developer: undefined });
    expect(result.platform).toEqual(["PC"]);
  });

  it("uses cover_image_url for image", () => {
    const result = transformGameData(game);
    expect(result.image).toBe(game.cover_image_url);
  });

  it("uses empty string when no cover", () => {
    const result = transformGameData({ ...game, cover_image_url: null });
    expect(result.image).toBe("");
  });
});

// games page component
describe("GamesPage", () => {
  it("renders spotlight section", async () => {
    render(<GamesPage />);
    expect(await screen.findByText("Spotlight")).toBeInTheDocument();
  });

  it("renders Top Rated Games heading", async () => {
    render(<GamesPage />);
    expect(await screen.findByText("Top Rated Games")).toBeInTheDocument();
  });

  it("renders View More Games button", async () => {
    render(<GamesPage />);
    expect(await screen.findByRole("button", { name: /View More Games/i })).toBeInTheDocument();
  });

  it("renders fallback mock games on API failure", async () => {
    render(<GamesPage />);
    expect(await screen.findByText("Hades II")).toBeInTheDocument();
  });
});
