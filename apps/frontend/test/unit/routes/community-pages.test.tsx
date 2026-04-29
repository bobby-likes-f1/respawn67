import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

let loaderData: unknown;

vi.mock("react-router", async () => {
  const actual = await vi.importActual<typeof import("react-router")>("react-router");
  return {
    ...actual,
    Link: ({ to, children, ...props }: any) => (
      <a href={to} {...props}>
        {children}
      </a>
    ),
    useLoaderData: () => loaderData,
  };
});

vi.mock("@/lib/auth", () => ({
  getStoredUser: () => ({ id: 1, username: "s-arkal" }),
}));

vi.mock("@/lib/api", () => ({
  getAllArticles: vi.fn(async () => []),
  getAllGames: vi.fn(async () => []),
  getAllLists: vi.fn(async () => []),
  getAllUsers: vi.fn(async () => []),
  getPublicReviews: vi.fn(async () => []),
  getGameById: vi.fn(async () => null),
  getGameCommunityHub: vi.fn(async () => null),
  getGameGuides: vi.fn(async () => []),
}));

import CommunityPage from "@/routes/community";
import GameUserReviewPage from "@/routes/game.$gameId.reviews.$userId";
import GameCommunityPage from "@/routes/game.$id.community";

const article = {
  id: 5,
  user_id: 1,
  title: "Why list culture matters for discovery",
  content: "Community lists turn a catalogue into a conversation.",
  created_at: "2026-04-28T12:00:00Z",
};

const game = {
  id: 7,
  title: "Elden Ring",
  description: "A world full of strange routes and stranger bosses.",
  genre: "RPG",
  developer: "FromSoftware",
  release_year: 2022,
  cover_image_url: "https://images.igdb.com/igdb/image/upload/t_cover_small/co1.webp",
  average_rating: 9.2,
  review_count: 8,
};

describe("CommunityPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    loaderData = {
      articles: [
        article,
        {
          id: 6,
          user_id: 2,
          title: "Review notes that actually help",
          content: "Short reviews are useful when they name the kind of player.",
        },
      ],
      games: [game],
      lists: [{ id: 4, user_id: 1, name: "Boss Prep", description: "Routes and builds." }],
      reviews: [{ user_id: 2, game_id: 7, score: 9, text: "Tough, readable, brilliant." }],
      usernameById: { 1: "s-arkal", 2: "rccar344" },
      hasDataError: false,
    };
  });

  it("renders community metrics, featured articles, game hubs, reviews, and lists", () => {
    render(<CommunityPage />);

    expect(screen.getByRole("heading", { name: /Follow the players/i })).toBeInTheDocument();
    expect(screen.getByText("Community Articles")).toBeInTheDocument();
    expect(screen.getByText(article.title)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /s-arkal/i })).toHaveAttribute("href", "/users/1");
    expect(screen.getAllByRole("link", { name: /Elden Ring/i })[0]).toHaveAttribute(
      "href",
      "/games/7/community",
    );
    expect(screen.getByText("Recent Reviews")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Open Review/i })).toHaveAttribute(
      "href",
      "/games/7/reviews/2",
    );
    expect(screen.getByText("Community Lists")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Boss Prep/i })).toHaveAttribute("href", "/lists/4");
  });
});

describe("GameCommunityPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    loaderData = {
      id: "7",
      gameData: game,
      guides: [
        {
          id: 21,
          game_id: 7,
          user_id: 1,
          title: "First ten hours route",
          content: "Start south, gather flask upgrades, and avoid rushing Stormveil.",
          created_at: "2026-04-29T12:00:00Z",
        },
        {
          id: 22,
          game_id: 7,
          user_id: 2,
          title: "Spoiler-light build planning",
          content: "Pick one damage stat and upgrade one main weapon.",
        },
      ],
      usernameById: { 1: "s-arkal", 2: "rccar344" },
      hasDataError: false,
      community: {
        average_rating: 8.7,
        review_count: 2,
        rating_distribution: { "10": 1, "8": 1 },
        reviews: [{ user_id: 2, game_id: 7, score: 10, text: "Peak exploration." }],
        lists: [{ id: 9, user_id: 2, name: "Soulslike Starter Kit", description: "" }],
        playlist_users: [
          { user_id: 1, username: "s-arkal", status: "playing", hours_played: 12 },
          { user_id: 2, username: "rccar344", status: "completed", hours_played: 8 },
        ],
      },
    };
  });

  it("puts guides first while still rendering reviews, lists, rating pulse, and activity", () => {
    render(<GameCommunityPage />);

    expect(screen.getByRole("heading", { name: "Elden Ring Community" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Community Guides" })).toBeInTheDocument();
    expect(screen.getByText("First ten hours route")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Edit Guide/i })).toHaveAttribute(
      "href",
      "/games/7/community/guides/21/edit",
    );
    expect(screen.getByRole("heading", { name: "Recent Reviews" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Open Review/i })).toHaveAttribute(
      "href",
      "/games/7/reviews/2",
    );
    expect(screen.getByRole("heading", { name: "Lists Featuring This" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Soulslike Starter Kit/i })).toHaveAttribute(
      "href",
      "/lists/9",
    );
    expect(screen.getByRole("heading", { name: "Rating Pulse" })).toBeInTheDocument();
    expect(screen.getByText("20h")).toBeInTheDocument();
  });
});

describe("GameUserReviewPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    loaderData = {
      gameId: "7",
      userId: "1",
      gameData: game,
      author: { id: 1, username: "s-arkal" },
      review: {
        user_id: 1,
        game_id: 7,
        score: 9,
        text: "A strong route with useful tradeoffs.",
        created_at: "2026-04-29T12:00:00Z",
      },
    };
  });

  it("renders the linked review detail page with profile, community, game, and owner actions", () => {
    render(<GameUserReviewPage />);

    expect(screen.getByRole("heading", { name: "Elden Ring" })).toBeInTheDocument();
    expect(screen.getByText("A strong route with useful tradeoffs.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /s-arkal/i })).toHaveAttribute("href", "/users/1");
    expect(screen.getByRole("link", { name: /Back to Community/i })).toHaveAttribute(
      "href",
      "/games/7/community",
    );
    expect(screen.getByRole("link", { name: /^Game$/i })).toHaveAttribute("href", "/games/7");
    expect(screen.getByRole("link", { name: /Edit on Game Page/i })).toHaveAttribute(
      "href",
      "/games/7",
    );
  });
});
