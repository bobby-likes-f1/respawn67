import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

let loaderData: unknown;
const navigateMock = vi.fn();
const apiMocks = vi.hoisted(() => ({
  createArticle: vi.fn(),
  getArticleById: vi.fn(),
  updateArticle: vi.fn(),
}));
const authMocks = vi.hoisted(() => ({
  getStoredUser: vi.fn(),
}));

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
    useParams: () => ({ id: "11" }),
  };
});

vi.mock("@/lib/auth", () => ({
  getInitials: (name: string) =>
    name
      .split(/\s|-/)
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
  getStoredUser: () => authMocks.getStoredUser(),
}));

vi.mock("@/lib/api", () => ({
  createArticle: (...args: unknown[]) => apiMocks.createArticle(...args),
  deleteArticle: vi.fn(async () => ({ message: "deleted" })),
  getAllArticles: vi.fn(async () => []),
  getAllUsers: vi.fn(async () => []),
  getArticleById: (...args: unknown[]) => apiMocks.getArticleById(...args),
  updateArticle: (...args: unknown[]) => apiMocks.updateArticle(...args),
}));

vi.mock("@/lib/use-require-auth", () => ({
  useRequireAuth: () => true,
}));

import ArticlesPage from "@/routes/articles";
import ArticleDetailPage from "@/routes/articles.$id";
import EditArticlePage from "@/routes/articles.edit.$id";
import WriteArticlePage from "@/routes/articles.write";

const articleFixture = {
  id: 11,
  user_id: 2,
  title: "How community guides make hard games more welcoming",
  content: "The best guides do not erase discovery. They give players a clean next step.",
  created_at: "2026-04-28T12:00:00Z",
  updated_at: "2026-04-28T12:00:00Z",
};

describe("ArticlesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMocks.getStoredUser.mockReturnValue({ id: 1, username: "s-arkal" });
    loaderData = {
      articles: [
        articleFixture,
        {
          id: 12,
          user_id: 3,
          title: "The week in player-built routes",
          content: "Boss notes, spoiler-light routes, completion checklists, and build advice.",
          created_at: "2026-04-29T12:00:00Z",
        },
      ],
      users: [
        { id: 2, username: "s-arkal" },
        { id: 3, username: "rccar344" },
      ],
    };
  });

  it("renders collaborator-style article cards with azure palette author info", () => {
    render(<ArticlesPage />);

    expect(screen.getByRole("heading", { name: "Gaming Articles" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search articles...")).toBeInTheDocument();
    expect(screen.getByText(articleFixture.title)).toBeInTheDocument();
    expect(screen.getByText("s-arkal")).toBeInTheDocument();
    expect(screen.getByText("SA")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /How community guides/i })).toHaveAttribute(
      "href",
      "/articles/11",
    );
  });

  it("filters articles by resolved username", () => {
    render(<ArticlesPage />);

    fireEvent.change(screen.getByPlaceholderText("Search articles..."), {
      target: { value: "rccar" },
    });

    expect(screen.getByText("The week in player-built routes")).toBeInTheDocument();
    expect(screen.queryByText(articleFixture.title)).not.toBeInTheDocument();
  });
});

describe("ArticleDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMocks.getStoredUser.mockReturnValue({ id: 1, username: "s-arkal" });
    loaderData = {
      id: "11",
      article: {
        ...articleFixture,
        content: "## Main Route\n\n### Prep\n\n- Upgrade weapon\n\nKeep notes short.",
      },
      users: [{ id: 2, username: "s-arkal" }],
    };
  });

  it("renders fetched article detail with profile link and formatted article content", () => {
    render(<ArticleDetailPage />);

    expect(screen.getByText(articleFixture.title)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /s-arkal/i })).toHaveAttribute("href", "/users/2");
    expect(screen.getByRole("heading", { name: "Main Route" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Prep" })).toBeInTheDocument();
    expect(screen.getByText("Upgrade weapon")).toBeInTheDocument();
  });
});

describe("WriteArticlePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMocks.getStoredUser.mockReturnValue({ id: 1, username: "s-arkal" });
    apiMocks.createArticle.mockResolvedValue({ id: 99 });
  });

  it("renders the collaborator article writing flow with azure formatting help", () => {
    render(<WriteArticlePage />);

    expect(screen.getByText("Write an Article")).toBeInTheDocument();
    expect(screen.getByText(/Publishing as/i)).toHaveTextContent("Publishing as s-arkal");
    expect(
      screen.getByPlaceholderText("Enter article title (at least 5 characters)"),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Write your article here/i)).toBeInTheDocument();
    expect(screen.getByText("Formatting Tips")).toBeInTheDocument();
    expect(screen.getByText("## Section")).toBeInTheDocument();
    expect(screen.getByText("- Bullet")).toBeInTheDocument();
    expect(screen.getByText("Paragraphs")).toBeInTheDocument();
    expect(screen.getByText("### Subheader")).toBeInTheDocument();
  });

  it("validates article title and content before publishing", () => {
    render(<WriteArticlePage />);

    fireEvent.change(screen.getByPlaceholderText("Enter article title (at least 5 characters)"), {
      target: { value: "Bad" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Write your article here/i), {
      target: {
        value:
          "This is long enough content for the article form to move past content validation.",
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "Publish Article" }));

    expect(screen.getByText("Title must be at least 5 characters")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("Enter article title (at least 5 characters)"), {
      target: { value: "Useful route notes" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Write your article here/i), {
      target: { value: "Too short" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Publish Article" }));

    expect(screen.getByText("Content must be at least 50 characters")).toBeInTheDocument();
  });

  it("publishes an article through the article API and shows the preview", async () => {
    render(<WriteArticlePage />);

    fireEvent.change(screen.getByPlaceholderText("Enter article title (at least 5 characters)"), {
      target: { value: "Thoughtful route notes" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Write your article here/i), {
      target: {
        value:
          "A useful article should explain why a route matters, what to try first, and what players can safely skip.",
      },
    });

    expect(screen.getByText("Preview")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Publish Article" }));

    await waitFor(() => {
      expect(apiMocks.createArticle).toHaveBeenCalledWith({
        title: "Thoughtful route notes",
        content:
          "A useful article should explain why a route matters, what to try first, and what players can safely skip.",
      });
    });
    expect(screen.getByText("Article published successfully.")).toBeInTheDocument();
  });
});

describe("EditArticlePage", () => {
  const editableArticle = {
    ...articleFixture,
    user_id: 1,
    title: "Editable article",
    content: "Original article content that is already long enough for an editing surface.",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    authMocks.getStoredUser.mockReturnValue({ id: 1, username: "s-arkal" });
    apiMocks.getArticleById.mockResolvedValue(editableArticle);
    apiMocks.updateArticle.mockResolvedValue({ ...editableArticle, title: "Updated article" });
  });

  it("loads the existing article into the edit form for the author", async () => {
    render(<EditArticlePage />);

    expect(screen.getByText("Loading article...")).toBeInTheDocument();
    expect(await screen.findByText("Edit Article")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Editable article")).toBeInTheDocument();
    expect(screen.getByDisplayValue(editableArticle.content)).toBeInTheDocument();
    expect(apiMocks.getArticleById).toHaveBeenCalledWith("11");
  });

  it("updates an article through the article API", async () => {
    render(<EditArticlePage />);

    const titleInput = await screen.findByDisplayValue("Editable article");
    fireEvent.change(titleInput, {
      target: { value: "Updated article title" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));

    await waitFor(() => {
      expect(apiMocks.updateArticle).toHaveBeenCalledWith("11", {
        title: "Updated article title",
        content: editableArticle.content,
      });
    });
    expect(screen.getByText("Article updated successfully.")).toBeInTheDocument();
  });

  it("blocks editing when the current user is not the article author", async () => {
    authMocks.getStoredUser.mockReturnValue({ id: 3, username: "rccar344" });

    render(<EditArticlePage />);

    expect(await screen.findByText("You can only edit your own articles")).toBeInTheDocument();
    expect(apiMocks.updateArticle).not.toHaveBeenCalled();
  });
});
