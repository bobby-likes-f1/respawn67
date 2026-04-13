import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { changeImageSize, toCatalogueGame } from "@/routes/catalogue";

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

import CataloguePage from "@/routes/catalogue";

describe("changeImageSize (catalogue)", () => {
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

describe("toCatalogueGame", () => {
  const game = {
    id: 5,
    title: "Hollow Knight",
    genre: "Metroidvania, Platformer",
    developer: "Team Cherry",
    release_year: 2017,
    cover_image_url: "https://images.igdb.com/igdb/image/upload/t_cover_small/co1.webp",
  };

  it("extracts primary genre from comma-separated list", () => {
    const result = toCatalogueGame(game);
    expect(result.genre).toBe("Metroidvania");
  });

  it("computes decade from release year", () => {
    const result = toCatalogueGame(game);
    expect(result.decade).toBe("2010s");
  });

  it("returns deterministic rating based on id", () => {
    const result = toCatalogueGame(game);
    expect(result.rating).toBe(Number((8 + (5 % 20) / 10).toFixed(1)));
  });

  it("defaults genre to Action when null", () => {
    const result = toCatalogueGame({ ...game, genre: null });
    expect(result.genre).toBe("Action");
  });

  it("changes cover URL to 1080p", () => {
    const result = toCatalogueGame(game);
    expect(result.image).toContain("t_1080p");
  });

  it("returns deterministic timeToBeat based on id", () => {
    const result = toCatalogueGame(game);
    expect(result.timeToBeat).toBe(12 + (5 % 24));
  });

  it("falls back release_year when null", () => {
    const noYear = { ...game, release_year: null };
    const result = toCatalogueGame(noYear);
    expect(result.decade).toMatch(/\d{4}s/);
  });
});

// catalogue page component
describe("CataloguePage", () => {
  it("renders page heading", async () => {
    render(<CataloguePage />);
    expect(await screen.findByText("Game Catalogue")).toBeInTheDocument();
  });

  it("renders search input", async () => {
    render(<CataloguePage />);
    expect(await screen.findByPlaceholderText(/Search games/i)).toBeInTheDocument();
  });

  it("renders sort dropdown", async () => {
    render(<CataloguePage />);
    expect(await screen.findByText("Title (A-Z)")).toBeInTheDocument();
  });

  it("renders fallback catalogue games", async () => {
    render(<CataloguePage />);
    expect(await screen.findByText("Hades II")).toBeInTheDocument();
  });
});
