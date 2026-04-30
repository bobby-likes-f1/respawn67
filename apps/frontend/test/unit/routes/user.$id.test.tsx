import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

// mocks
vi.mock("react-router", async () => {
  const actual = await vi.importActual<typeof import("react-router")>("react-router");
  return {
    ...actual,
    Link: ({ to, children, ...props }: any) => <a href={to} {...props}>{children}</a>,
    useNavigate: () => vi.fn(),
    useParams: () => ({ id: "2" }),
  };
});

const mockGetStoredUser = vi.fn();
vi.mock("@/lib/auth", () => ({
  getStoredUser: () => mockGetStoredUser(),
  getInitials: () => "U",
  getMemberSinceLabel: () => null,
}));

const mockGetUserById = vi.fn();
const mockGetPublicUserLists = vi.fn();
const mockGetFavoriteGames = vi.fn();
const mockGetPublicReviews = vi.fn();
const mockGetAllArticles = vi.fn();
const mockGetAllGames = vi.fn();
const mockGetGameGuides = vi.fn();

vi.mock("@/lib/api", () => ({
  getUserById: (id: string | number) => mockGetUserById(id),
  getFavoriteGames: () => mockGetFavoriteGames(),
  getPublicReviews: () => mockGetPublicReviews(),
  getPlaylistEntries: vi.fn(async () => []),
  getPlaylistGames: vi.fn(async () => []),
  getAllArticles: () => mockGetAllArticles(),
  getAllGames: () => mockGetAllGames(),
  getGameGuides: (id: string | number) => mockGetGameGuides(id),
  getPublicUserLists: (id: number) => mockGetPublicUserLists(id),
  getListGames: vi.fn(async () => []),
}));

import PublicProfilePage from "@/routes/user.$id";

describe("PublicProfilePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetStoredUser.mockReturnValue({
      id: 1,
      username: "SessionUser",
    });
    mockGetUserById.mockResolvedValue({
      id: 2,
      username: "TargetUser",
      email: "target@test.com",
    });
    mockGetPublicUserLists.mockResolvedValue([
      { id: 10, user_id: 2, name: "Target List 1" },
    ]);
    mockGetFavoriteGames.mockResolvedValue([]);
    mockGetPublicReviews.mockResolvedValue([]);
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
        user_id: 2,
        title: "Target article",
        content: "A public article from this player.",
        created_at: "2026-04-28T12:00:00Z",
      },
    ]);
    mockGetGameGuides.mockResolvedValue([
      {
        id: 21,
        game_id: 7,
        user_id: 2,
        title: "Target guide",
        content: "A public guide from this player.",
        created_at: "2026-04-29T12:00:00Z",
      },
    ]);
  });

  it("renders loading state initially", async () => {
    render(<PublicProfilePage />);
    expect(screen.getByText("Loading profile...")).toBeInTheDocument();
    
    // Wait for async effect to settle to prevent act() warnings
    await waitFor(() => {
      expect(screen.queryByText("Loading profile...")).not.toBeInTheDocument();
    });
  });

  it("renders target user profile", async () => {
    render(<PublicProfilePage />);
    
    await waitFor(() => {
      expect(screen.queryByText("Loading profile...")).not.toBeInTheDocument();
    });

    expect(screen.getByText("TargetUser")).toBeInTheDocument();
    expect(screen.getByText(/Member since/i)).toBeInTheDocument();
    
    // Check tabs
    expect(screen.getByRole("tab", { name: /Profile/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Reviews/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Lists/i })).toBeInTheDocument();
  });

  it("shows the user's published articles and guides on the writing tab", async () => {
    render(<PublicProfilePage />);

    await waitFor(() => {
      expect(screen.queryByText("Loading profile...")).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("tab", { name: /Writing/i }));

    expect(await screen.findByRole("link", { name: /Target article/i })).toHaveAttribute(
      "href",
      "/articles/11",
    );
    expect(screen.getByRole("link", { name: /Target guide/i })).toHaveAttribute(
      "href",
      "/games/7/community/guides/21",
    );
    expect(screen.getByText("Elden Ring")).toBeInTheDocument();
  });
});
