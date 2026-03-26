import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const navigateMock = vi.fn();
const signupMock = vi.fn();
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
  signup: (...args: unknown[]) => signupMock(...args),
  login: (...args: unknown[]) => loginMock(...args),
  saveSession: (...args: unknown[]) => saveSessionMock(...args),
}));

import SignupPage from "@/routes/signup";

describe("SignupPage", () => {
  it("renders username, email, and password fields", () => {
    render(<SignupPage />);
    expect(screen.getByPlaceholderText("e.g. GamerTag42")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("At least 8 characters")).toBeInTheDocument();
  });

  it("renders Create Account button", () => {
    render(<SignupPage />);
    expect(screen.getByRole("button", { name: "Create Account" })).toBeInTheDocument();
  });

  it("renders link to login page", () => {
    render(<SignupPage />);
    const link = screen.getByText("Log in");
    expect(link.closest("a")).toHaveAttribute("href", "/login");
  });

  it("submits signup → login → navigates on success", async () => {
    signupMock.mockResolvedValueOnce({});
    loginMock.mockResolvedValueOnce({
      token: "jwt",
      user: { id: 1, username: "Tag42", email: "g@t.co" },
    });
    render(<SignupPage />);
    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText("e.g. GamerTag42"), "Tag42");
    await user.type(screen.getByPlaceholderText("you@example.com"), "g@t.co");
    await user.type(screen.getByPlaceholderText("At least 8 characters"), "pw1234");
    await user.click(screen.getByRole("button", { name: "Create Account" }));

    expect(signupMock).toHaveBeenCalledWith({ username: "Tag42", email: "g@t.co", password: "pw1234" });
    expect(loginMock).toHaveBeenCalled();
    expect(saveSessionMock).toHaveBeenCalled();
    expect(navigateMock).toHaveBeenCalledWith("/games");
  });

  it("displays error on signup failure", async () => {
    signupMock.mockRejectedValueOnce(new Error("Email taken"));
    render(<SignupPage />);
    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText("e.g. GamerTag42"), "Tag42");
    await user.type(screen.getByPlaceholderText("you@example.com"), "dup@t.co");
    await user.type(screen.getByPlaceholderText("At least 8 characters"), "pw1234");
    await user.click(screen.getByRole("button", { name: "Create Account" }));

    expect(await screen.findByText("Email taken")).toBeInTheDocument();
  });

  it("renders logo linking to home", () => {
    render(<SignupPage />);
    const logo = screen.getByText("RESPAWN67").closest("a");
    expect(logo).toHaveAttribute("href", "/");
  });
});
