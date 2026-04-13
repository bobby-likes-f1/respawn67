import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

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

vi.mock("@/lib/api", () => ({
  getUserById: (id: string | number) => mockGetUserById(id),
  getFavoriteGames: () => mockGetFavoriteGames(),
  getPublicReviews: () => mockGetPublicReviews(),
  getPlaylistEntries: vi.fn(async () => []),
  getPlaylistGames: vi.fn(async () => []),
  getAllGames: vi.fn(async () => []),
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
});
