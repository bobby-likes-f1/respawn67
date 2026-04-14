import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

vi.mock("react-router", async () => {
  const actual = await vi.importActual<typeof import("react-router")>("react-router");
  return {
    ...actual,
    Link: ({ to, children, ...props }: any) => <a href={to} {...props}>{children}</a>,
    useNavigate: () => vi.fn(),
  };
});

const mockGetStoredUser = vi.fn();
vi.mock("@/lib/auth", () => ({
  getStoredUser: () => mockGetStoredUser(),
}));

const mockGetAllLists = vi.fn();
const mockGetUserLists = vi.fn();
const mockGetAllUsers = vi.fn();

vi.mock("@/lib/api", () => ({
  getAllLists: () => mockGetAllLists(),
  getUserLists: () => mockGetUserLists(),
  getListGames: vi.fn(async () => []),
  getAllUsers: () => mockGetAllUsers(),
}));

import ListsPage from "@/routes/lists";

describe("ListsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetStoredUser.mockReturnValue({
      id: 1,
      username: "TestUser",
    });
    mockGetAllUsers.mockResolvedValue([
      { id: 1, username: "TestUser" },
      { id: 2, username: "OtherUser" },
    ]);
    mockGetAllLists.mockResolvedValue([
      { id: 10, user_id: 1, name: "My First List", like_count: 5 },
      { id: 11, user_id: 2, name: "Someone Elses List", like_count: 2 },
    ]);
    mockGetUserLists.mockResolvedValue([
      { id: 10, user_id: 1, name: "My First List", like_count: 5 },
    ]);
  });

  it("renders global lists by default", async () => {
    render(<ListsPage />);
    
    await waitFor(() => {
      expect(screen.queryByText("My First List")).toBeInTheDocument();
      expect(screen.queryByText("Someone Elses List")).toBeInTheDocument();
    });

    // Check that usernames were resolved
    expect(screen.getByText("TestUser")).toBeInTheDocument();
    expect(screen.getByText("OtherUser")).toBeInTheDocument();
  });
});
