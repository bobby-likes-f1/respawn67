import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// mocks
const navigateMock = vi.fn();
let mockPathname = "/";

vi.mock("react-router", () => ({
  Link: ({ to, children, ...props }: any) => <a href={to} {...props}>{children}</a>,
  useLocation: () => ({ pathname: mockPathname }),
  useNavigate: () => navigateMock,
}));

vi.mock("@/lib/auth", () => ({
  getStoredUser: vi.fn(() => null),
  getInitials: vi.fn((name: string) => name[0]?.toUpperCase() ?? "U"),
  clearSession: vi.fn(),
}));
import { getStoredUser, clearSession } from "@/lib/auth";
const getStoredUserMock = vi.mocked(getStoredUser);

// mock radix dropdown to just render children
vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: any) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: any) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
  DropdownMenuItem: ({ children, onSelect, ...props }: any) => (
    <button onClick={onSelect} {...props}>{children}</button>
  ),
  DropdownMenuLabel: ({ children }: any) => <div>{children}</div>,
  DropdownMenuSeparator: () => <hr />,
}));

vi.mock("@/components/ui/navigation-menu", () => ({
  NavigationMenu: ({ children }: any) => <nav>{children}</nav>,
  NavigationMenuList: ({ children }: any) => <ul>{children}</ul>,
  NavigationMenuItem: ({ children }: any) => <li>{children}</li>,
  NavigationMenuLink: ({ children }: any) => <>{children}</>,
  navigationMenuTriggerStyle: () => "",
}));

import { Navbar } from "@/components/navbar";

describe("Navbar", () => {
  it("renders logo", () => {
    mockPathname = "/";
    render(<Navbar />);
    expect(screen.getByText("RESPAWN67")).toBeInTheDocument();
  });

  it("shows landing page nav links on /", () => {
    mockPathname = "/";
    render(<Navbar />);
    expect(screen.getByText("Features")).toBeInTheDocument();
    expect(screen.getByText("Reviews")).toBeInTheDocument();
  });

  it("shows app nav links on /games", () => {
    mockPathname = "/games";
    render(<Navbar />);
    expect(screen.getByText("Games")).toBeInTheDocument();
    expect(screen.getByText("Catalogue")).toBeInTheDocument();
    expect(screen.getByText("Backlog")).toBeInTheDocument();
  });

  it("shows auth buttons on landing page", () => {
    mockPathname = "/";
    render(<Navbar />);
    expect(screen.getByText("Log In")).toBeInTheDocument();
    expect(screen.getByText("Create Account")).toBeInTheDocument();
  });

  it("shows guest dropdown when not logged in and not on auth/landing page", () => {
    mockPathname = "/games";
    getStoredUserMock.mockReturnValue(null);
    render(<Navbar />);
    expect(screen.getByText("Account")).toBeInTheDocument();
  });

  it("hides navbar actions on /login", () => {
    mockPathname = "/login";
    getStoredUserMock.mockReturnValue(null);
    render(<Navbar />);
    expect(screen.queryByText("Account")).not.toBeInTheDocument();
    expect(screen.queryByText("Log In")).not.toBeInTheDocument();
  });

  it("shows user dropdown when logged in", () => {
    mockPathname = "/games";
    getStoredUserMock.mockReturnValue({ id: 1, username: "Neo", email: "neo@t.co" });
    render(<Navbar />);
    expect(screen.getAllByText("Neo").length).toBeGreaterThanOrEqual(1);
  });

  it("calls logout on Log Out click", async () => {
    mockPathname = "/games";
    getStoredUserMock.mockReturnValue({ id: 1, username: "Neo", email: "neo@t.co" });
    const user = userEvent.setup();
    render(<Navbar />);
    await user.click(screen.getByText("Log Out"));
    expect(clearSession).toHaveBeenCalled();
    expect(navigateMock).toHaveBeenCalledWith("/");
  });
});
