import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("react-router", () => ({
  isRouteErrorResponse: vi.fn(),
  Links: () => <link data-testid="links" />,
  Meta: () => <meta data-testid="meta" />,
  Outlet: () => <div data-testid="outlet" />,
  Scripts: () => <script data-testid="scripts" />,
  ScrollRestoration: () => null,
}));
import { isRouteErrorResponse } from "react-router";
const isRouteErrorMock = vi.mocked(isRouteErrorResponse);

vi.mock("@/components/navbar", () => ({
  Navbar: () => <nav data-testid="navbar">Navbar</nav>,
}));

import { links, Layout, ErrorBoundary } from "@/root";
import App from "@/root";

// links
describe("links", () => {
  it("returns an array of link descriptors", () => {
    const result = links();
    expect(result.length).toBeGreaterThanOrEqual(3);
  });

  it("includes google fonts preconnect", () => {
    const result = links();
    expect(result.some((l: any) => l.href?.includes("fonts.googleapis.com"))).toBe(true);
  });
});

// layout
describe("Layout", () => {
  it("renders children inside html>body", () => {
    render(
      <Layout>
        <p>Hello</p>
      </Layout>,
    );
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });
});

// app
describe("App", () => {
  it("renders Navbar and Outlet", () => {
    render(<App />);
    expect(screen.getByTestId("navbar")).toBeInTheDocument();
    expect(screen.getByTestId("outlet")).toBeInTheDocument();
  });
});

// error boundary
describe("ErrorBoundary", () => {
  it("shows Oops! for generic errors", () => {
    isRouteErrorMock.mockReturnValue(false);
    render(<ErrorBoundary error={new Error("boom")} />);
    expect(screen.getByText("Oops!")).toBeInTheDocument();
  });

  it("shows 404 for route error with status 404", () => {
    isRouteErrorMock.mockReturnValue(true);
    const error = { status: 404, statusText: "Not Found", data: null } as any;
    render(<ErrorBoundary error={error} />);
    expect(screen.getByText("404")).toBeInTheDocument();
  });

  it("shows Error for non-404 route errors", () => {
    isRouteErrorMock.mockReturnValue(true);
    const error = { status: 500, statusText: "Server Error", data: null } as any;
    render(<ErrorBoundary error={error} />);
    expect(screen.getByText("Error")).toBeInTheDocument();
  });

  it("shows statusText for non-404 route errors", () => {
    isRouteErrorMock.mockReturnValue(true);
    const error = { status: 500, statusText: "Server Error", data: null } as any;
    render(<ErrorBoundary error={error} />);
    expect(screen.getByText("Server Error")).toBeInTheDocument();
  });
});
