import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

vi.mock("react-router", async () => {
  const actual = await vi.importActual<typeof import("react-router")>("react-router");
  return {
    ...actual,
    Link: ({ to, children, ...props }: any) => <a href={to} {...props}>{children}</a>,
    useNavigate: () => vi.fn(),
    useParams: () => ({ id: "10" }),
  };
});

const mockGetStoredUser = vi.fn();
vi.mock("@/lib/auth", () => ({
  getStoredUser: () => mockGetStoredUser(),
}));

const mockGetListById = vi.fn();
const mockGetListGames = vi.fn();
const mockGetUserById = vi.fn();

vi.mock("@/lib/api", () => ({
  getListById: (id: number) => mockGetListById(id),
  getListGames: (id: number) => mockGetListGames(id),
  getAllGames: vi.fn(async () => []),
  getUserById: (id: number) => mockGetUserById(id),
}));

import ListDetailPage from "@/routes/list.$id";

describe("ListDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetStoredUser.mockReturnValue({
      id: 1,
      username: "TestUser",
    });
    mockGetListById.mockResolvedValue({
      id: 10,
      user_id: 1,
      name: "My Awesome RPGs",
      description: "Best RPGs ever",
      like_count: 42,
    });
    mockGetListGames.mockResolvedValue([
      { id: 100, title: "Final Fantasy" },
      { id: 101, title: "Persona 5" },
    ]);
    mockGetUserById.mockResolvedValue({
      id: 1,
      username: "TestUser",
    });
  });

  it("renders list details and games", async () => {
    render(<ListDetailPage />);
    
    await waitFor(() => {
      expect(screen.queryByText("My Awesome RPGs")).toBeInTheDocument();
    });

    expect(screen.getByText("Best RPGs ever")).toBeInTheDocument();
    expect(screen.getByText("Final Fantasy")).toBeInTheDocument();
    expect(screen.getByText("Persona 5")).toBeInTheDocument();
    
    // Renders owner username
    expect(screen.getByText("TestUser")).toBeInTheDocument();
  });
});
