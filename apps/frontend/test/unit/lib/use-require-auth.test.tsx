import { describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";

const navigateMock = vi.fn();
vi.mock("react-router", () => ({
  useNavigate: () => navigateMock,
  useLocation: () => ({ pathname: "/backlog" }),
}));

vi.mock("@/lib/auth", () => ({
  getToken: vi.fn(),
}));
import { getToken } from "@/lib/auth";
const getTokenMock = vi.mocked(getToken);

import { useRequireAuth } from "@/lib/use-require-auth";

describe("useRequireAuth", () => {
  it("redirects to /login when no token", () => {
    getTokenMock.mockReturnValue(null);
    const { result } = renderHook(() => useRequireAuth());
    expect(result.current).toBe(false);
    expect(navigateMock).toHaveBeenCalledWith("/login", {
      replace: true,
      state: { from: "/backlog" },
    });
  });

  it("returns true when token exists", () => {
    getTokenMock.mockReturnValue("tok");
    const { result } = renderHook(() => useRequireAuth());
    expect(result.current).toBe(true);
    expect(navigateMock).not.toHaveBeenCalled();
  });
});
