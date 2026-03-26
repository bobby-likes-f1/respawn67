import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const navigateMock = vi.fn();
const loginMock = vi.fn();
const saveSessionMock = vi.fn();

vi.mock("react-router", async () => {
  const actual = await vi.importActual<typeof import("react-router")>("react-router");
  return {
    ...actual,
    Link: ({ to, children, ...props }: any) => <a href={to} {...props}>{children}</a>,
    useNavigate: () => navigateMock,
  };
});

vi.mock("@/lib/auth", () => ({
  login: (...args: unknown[]) => loginMock(...args),
  saveSession: (...args: unknown[]) => saveSessionMock(...args),
}));

import LoginPage from "@/routes/login";

describe("LoginPage", () => {
  it("renders email and password fields", () => {
    render(<LoginPage />);
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
  });

  it("renders Log In button", () => {
    render(<LoginPage />);
    expect(screen.getByRole("button", { name: "Log In" })).toBeInTheDocument();
  });

  it("renders link to signup page", () => {
    render(<LoginPage />);
    expect(screen.getByText("Create one")).toBeInTheDocument();
  });

  it("submits login form and navigates on success", async () => {
    loginMock.mockResolvedValueOnce({
      token: "jwt",
      user: { id: 1, username: "neo", email: "neo@t.co" },
    });
    render(<LoginPage />);
    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText("you@example.com"), "neo@t.co");
    await user.type(screen.getByPlaceholderText("••••••••"), "pw123");
    await user.click(screen.getByRole("button", { name: "Log In" }));

    expect(loginMock).toHaveBeenCalledWith({ email: "neo@t.co", password: "pw123" });
    expect(saveSessionMock).toHaveBeenCalled();
    expect(navigateMock).toHaveBeenCalledWith("/games");
  });

  it("displays error on login failure", async () => {
    loginMock.mockRejectedValueOnce(new Error("Invalid credentials"));
    render(<LoginPage />);
    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText("you@example.com"), "bad@t.co");
    await user.type(screen.getByPlaceholderText("••••••••"), "wrong");
    await user.click(screen.getByRole("button", { name: "Log In" }));

    expect(await screen.findByText("Invalid credentials")).toBeInTheDocument();
  });
});
