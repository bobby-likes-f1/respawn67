import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

let loaderData: unknown;
const navigateMock = vi.fn();
const getStoredUserMock = vi.fn();
const createGuideMock = vi.fn();
const updateGuideMock = vi.fn();
const deleteGuideMock = vi.fn();

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
    useNavigate: () => navigateMock,
  };
});

vi.mock("@/lib/auth", () => ({
  getStoredUser: () => getStoredUserMock(),
}));

vi.mock("@/lib/api", () => ({
  createGuide: (...args: unknown[]) => createGuideMock(...args),
  updateGuide: (...args: unknown[]) => updateGuideMock(...args),
  deleteGuide: (...args: unknown[]) => deleteGuideMock(...args),
  getAllUsers: vi.fn(async () => []),
  getGameById: vi.fn(async () => null),
  getGameGuides: vi.fn(async () => []),
}));

import NewGuidePage from "@/routes/game.$id.community.guides.new";
import EditGuidePage from "@/routes/game.$id.community.guides.$guideId.edit";
import GuideDetailPage from "@/routes/game.$id.community.guides.$guideId";

const gameData = {
  id: 7,
  title: "Elden Ring",
  genre: "RPG",
  developer: "FromSoftware",
  release_year: 2022,
  cover_image_url: "https://images.igdb.com/igdb/image/upload/t_cover_small/co1.webp",
};

const formattedGuide = {
  id: 21,
  game_id: 7,
  user_id: 1,
  title: "First ten hours route",
  content: "## Opening Route\n\n### Before Stormveil\n\n- Upgrade your flask\n- Mark caves\n\nRest before pushing north.",
  created_at: "2026-04-29T12:00:00Z",
};

describe("NewGuidePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getStoredUserMock.mockReturnValue({ id: 1, username: "s-arkal" });
    createGuideMock.mockResolvedValue({ id: 99 });
    loaderData = { id: "7", gameData };
  });

  it("shows rendered formatting tips and a large live preview", () => {
    render(<NewGuidePage />);

    expect(screen.getByText("## Section")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Major Route Step" })).toBeInTheDocument();
    expect(screen.getByText("### Subhead")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Build Warning" })).toBeInTheDocument();
    expect(screen.getByText("- Bullet")).toBeInTheDocument();
    expect(screen.getByText("Upgrade weapon first")).toBeInTheDocument();
    expect(screen.getByText("Blank line")).toBeInTheDocument();
    expect(screen.getByText("Next paragraph.")).toBeInTheDocument();
    expect(screen.getByLabelText("Guide Content")).toHaveAttribute("rows", "24");
  });

  it("renders markdown-style guide content in preview and publishes through the API helper", async () => {
    render(<NewGuidePage />);

    fireEvent.change(screen.getByLabelText("Guide Title"), {
      target: { value: formattedGuide.title },
    });
    fireEvent.change(screen.getByLabelText("Guide Content"), {
      target: { value: formattedGuide.content },
    });
    fireEvent.click(screen.getByRole("button", { name: /Publish Guide/i }));

    expect(screen.getByRole("heading", { name: "Opening Route" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Before Stormveil" })).toBeInTheDocument();
    expect(screen.getByText("Upgrade your flask")).toBeInTheDocument();
    await waitFor(() => {
      expect(createGuideMock).toHaveBeenCalledWith("7", {
        title: formattedGuide.title,
        content: formattedGuide.content,
      });
    });
    expect(navigateMock).toHaveBeenCalledWith("/games/7/community/guides/99");
  });
});

describe("EditGuidePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getStoredUserMock.mockReturnValue({ id: 1, username: "s-arkal" });
    updateGuideMock.mockResolvedValue({ ...formattedGuide, title: "Updated route" });
    loaderData = { id: "7", guideId: 21, gameData, guide: formattedGuide };
  });

  it("loads existing guide content into editor and preview", () => {
    render(<EditGuidePage />);

    expect(screen.getByDisplayValue(formattedGuide.title)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Opening Route" })).toBeInTheDocument();
    expect(screen.getByText("Mark caves")).toBeInTheDocument();
  });

  it("saves updates through the API helper", async () => {
    render(<EditGuidePage />);

    fireEvent.change(screen.getByLabelText("Guide Title"), {
      target: { value: "Updated route" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Save Changes/i }));

    await waitFor(() => {
      expect(updateGuideMock).toHaveBeenCalledWith("7", 21, {
        title: "Updated route",
        content: formattedGuide.content,
      });
    });
    expect(navigateMock).toHaveBeenCalledWith("/games/7/community/guides/21");
  });

  it("blocks editing for non-owners", () => {
    getStoredUserMock.mockReturnValue({ id: 2, username: "rccar344" });

    render(<EditGuidePage />);

    expect(screen.getByText("Only the guide author can edit this.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open Guide" })).toHaveAttribute(
      "href",
      "/games/7/community/guides/21",
    );
  });
});

describe("GuideDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getStoredUserMock.mockReturnValue({ id: 1, username: "s-arkal" });
    deleteGuideMock.mockResolvedValue({ message: "deleted" });
    loaderData = {
      id: "7",
      guideId: 21,
      gameData,
      guide: formattedGuide,
      usernameById: { 1: "s-arkal" },
    };
    vi.spyOn(window, "confirm").mockReturnValue(true);
  });

  it("renders formatted guide detail content and owner actions", () => {
    render(<GuideDetailPage />);

    expect(screen.getByRole("heading", { name: formattedGuide.title })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Opening Route" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Before Stormveil" })).toBeInTheDocument();
    expect(screen.getByText("Upgrade your flask")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /s-arkal/i })).toHaveAttribute("href", "/users/1");
    expect(screen.getByRole("link", { name: /Edit This Guide/i })).toHaveAttribute(
      "href",
      "/games/7/community/guides/21/edit",
    );
  });

  it("deletes owner guide after confirmation", async () => {
    render(<GuideDetailPage />);

    fireEvent.click(screen.getByRole("button", { name: /Delete Guide/i }));

    await waitFor(() => {
      expect(deleteGuideMock).toHaveBeenCalledWith("7", 21);
    });
    expect(navigateMock).toHaveBeenCalledWith("/games/7/community");
  });
});
