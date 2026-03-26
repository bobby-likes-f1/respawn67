import { describe, expect, it, vi, beforeEach } from "vitest";

// fetch mock
const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

function jsonOk(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

function jsonErr(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// import after mocking fetch
import {
  signup,
  login,
  saveSession,
  clearSession,
  getToken,
  getStoredUser,
  getInitials,
  getMemberSinceLabel,
} from "@/lib/auth";

// signup
describe("signup", () => {
  it("sends POST and returns data on success", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonOk({ message: "ok", user: { id: 1, username: "a", email: "a@b.c" } }),
    );
    const res = await signup({ username: "a", email: "a@b.c", password: "pw" });
    expect(res.message).toBe("ok");
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("throws on non-ok response with server message", async () => {
    fetchMock.mockResolvedValueOnce(jsonErr(400, { message: "Email taken" }));
    await expect(signup({ username: "a", email: "a@b.c", password: "pw" })).rejects.toThrow(
      "Email taken",
    );
  });

  it("throws generic fallback when no message", async () => {
    fetchMock.mockResolvedValueOnce(jsonErr(500, {}));
    await expect(signup({ username: "a", email: "a@b.c", password: "pw" })).rejects.toThrow(
      "Signup failed",
    );
  });
});

// login
describe("login", () => {
  it("returns normalised user on success", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonOk({
        message: "ok",
        token: "tok",
        user: { id: 1, username: "u", email: "u@t.co", CreatedAt: "2025-01-01" },
      }),
    );
    const res = await login({ email: "u@t.co", password: "pw" });
    expect(res.token).toBe("tok");
    expect(res.user.createdAt).toBe("2025-01-01");
  });

  it("throws on non-ok response", async () => {
    fetchMock.mockResolvedValueOnce(jsonErr(401, { message: "bad creds" }));
    await expect(login({ email: "x", password: "y" })).rejects.toThrow("bad creds");
  });

  it("throws when user payload is invalid", async () => {
    fetchMock.mockResolvedValueOnce(jsonOk({ token: "tok", user: {} }));
    await expect(login({ email: "x", password: "y" })).rejects.toThrow(
      "Invalid user payload",
    );
  });

  it("handles created_at snake_case key", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonOk({ token: "t", user: { id: 1, username: "u", email: "e@e.e", created_at: "2024-06-01" } }),
    );
    const res = await login({ email: "e@e.e", password: "p" });
    expect(res.user.createdAt).toBe("2024-06-01");
  });

  it("falls back to Login failed when body has no message", async () => {
    fetchMock.mockResolvedValueOnce(jsonErr(500, {}));
    await expect(login({ email: "a", password: "b" })).rejects.toThrow("Login failed");
  });
});

// session helpers
describe("saveSession / clearSession / getToken / getStoredUser", () => {
  it("saveSession stores token and user", () => {
    saveSession({ token: "abc", user: { id: 1, username: "u", email: "e@e" } });
    expect(localStorage.getItem("token")).toBe("abc");
    expect(JSON.parse(localStorage.getItem("user")!).username).toBe("u");
  });

  it("getToken returns stored token", () => {
    localStorage.setItem("token", "xyz");
    expect(getToken()).toBe("xyz");
  });

  it("getToken returns null when nothing stored", () => {
    expect(getToken()).toBeNull();
  });

  it("getStoredUser returns parsed user", () => {
    localStorage.setItem("user", JSON.stringify({ id: 2, username: "x", email: "x@x" }));
    const u = getStoredUser();
    expect(u?.id).toBe(2);
    expect(u?.username).toBe("x");
  });

  it("getStoredUser returns null on bad JSON", () => {
    localStorage.setItem("user", "not-json");
    expect(getStoredUser()).toBeNull();
  });

  it("getStoredUser returns null when missing", () => {
    expect(getStoredUser()).toBeNull();
  });

  it("clearSession removes token and user", () => {
    localStorage.setItem("token", "t");
    localStorage.setItem("user", "u");
    clearSession();
    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
  });
});

// getInitials
describe("getInitials", () => {
  it("returns first letter uppercased for single word", () => {
    expect(getInitials("alice")).toBe("A");
  });

  it("returns two initials for two words", () => {
    expect(getInitials("John Doe")).toBe("JD");
  });

  it("returns at most two initials", () => {
    expect(getInitials("A B C")).toBe("AB");
  });

  it('returns "U" for empty / whitespace', () => {
    expect(getInitials("   ")).toBe("U");
  });
});

// getMemberSinceLabel
describe("getMemberSinceLabel", () => {
  it("returns year string for valid createdAt", () => {
    expect(
      getMemberSinceLabel({ id: 1, username: "u", email: "e", createdAt: "2024-11-05T10:00:00Z" }),
    ).toBe("2024");
  });

  it("returns null when no createdAt", () => {
    expect(getMemberSinceLabel({ id: 1, username: "u", email: "e" })).toBeNull();
  });

  it("returns null for invalid date string", () => {
    expect(getMemberSinceLabel({ id: 1, username: "u", email: "e", createdAt: "not-a-date" })).toBeNull();
  });

  it("returns null for null user", () => {
    expect(getMemberSinceLabel(null)).toBeNull();
  });
});
