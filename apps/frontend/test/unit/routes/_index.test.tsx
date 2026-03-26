import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { changeImageSize } from "@/routes/_index";

// mocks
const navigateMock = vi.fn();

vi.mock("react-router", async () => {
  const actual = await vi.importActual<typeof import("react-router")>("react-router");
  return {
    ...actual,
    Link: ({ to, children, ...props }: any) => <a href={to} {...props}>{children}</a>,
    useNavigate: () => navigateMock,
  };
});

vi.mock("@/lib/auth", () => ({
  getToken: vi.fn(() => null),
}));

import LandingPage from "@/routes/_index";

// changeImageSize
describe("changeImageSize", () => {
  it("replaces size token in url", () => {
    const url = "https://images.igdb.com/igdb/image/upload/t_cover_small/co123.webp";
    expect(changeImageSize(url, "1080p")).toBe(
      "https://images.igdb.com/igdb/image/upload/t_1080p/co123.webp",
    );
  });

  it("returns placeholder for null", () => {
    expect(changeImageSize(null, "1080p")).toContain("placeholder");
  });

  it("returns placeholder for undefined", () => {
    expect(changeImageSize(undefined, "1080p")).toContain("placeholder");
  });

  it("returns placeholder for empty string", () => {
    expect(changeImageSize("", "1080p")).toContain("placeholder");
  });

  it("handles underscore in size tokens", () => {
    const url = "https://images.igdb.com/igdb/image/upload/t_cover_big_2x/co1.webp";
    expect(changeImageSize(url, "720p")).toContain("t_720p");
  });
});

// landing page component
describe("LandingPage", () => {
  beforeEach(() => {
    navigateMock.mockReset();
  });

  it("renders the hero heading", () => {
    render(<LandingPage />);
    expect(screen.getByText(/Play it\. Rate it\./)).toBeInTheDocument();
    expect(screen.getByText("Respawn.")).toBeInTheDocument();
  });

  it("renders Get Started button", () => {
    render(<LandingPage />);
    expect(screen.getByRole("button", { name: /Get Started/i })).toBeInTheDocument();
  });

  it("renders the three hero feature cards", () => {
    render(<LandingPage />);
    expect(screen.getByText("Track Your Journey")).toBeInTheDocument();
    expect(screen.getByText("Rate & Review")).toBeInTheDocument();
    expect(screen.getByText("Curate Lists")).toBeInTheDocument();
  });

  it("renders Popular Reviews section", () => {
    render(<LandingPage />);
    expect(screen.getByText("Popular Reviews This Week")).toBeInTheDocument();
  });

  it("renders Popular Lists section", () => {
    render(<LandingPage />);
    expect(screen.getByText("Popular Lists")).toBeInTheDocument();
  });

  it("renders the footer", () => {
    render(<LandingPage />);
    expect(screen.getByText(/Built with shadcn/i)).toBeInTheDocument();
  });
});
